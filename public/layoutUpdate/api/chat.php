<?php
/*
 * AICIVSIM — AI Advisor Streaming Proxy
 *
 * Receives chat messages from the browser widget, forwards to the
 * configured LLM provider, and streams the response back via SSE.
 * The API key never leaves the server.
 */

$cfg = @include(__DIR__ . '/config.php');
if (!$cfg || empty($cfg['api_key'])) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'API not configured. See config.example.php.']);
    exit;
}

$origin = $cfg['allowed_origin'] ?: ($_SERVER['HTTP_ORIGIN'] ?? '*');
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST only']);
    exit;
}

/* ── Rate limiting (file-based, per IP) ── */
$rateDir  = sys_get_temp_dir() . '/aicivsim_rate';
if (!is_dir($rateDir)) @mkdir($rateDir, 0700, true);
$ip       = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
$rateFile = $rateDir . '/' . md5($ip) . '.json';
$limit    = $cfg['rate_limit_per_minute'] ?? 20;
$window   = 60;

$now   = time();
$hits  = [];
if (file_exists($rateFile)) {
    $hits = json_decode(file_get_contents($rateFile), true) ?: [];
    $hits = array_filter($hits, function ($t) use ($now, $window) { return $t > $now - $window; });
}
if (count($hits) >= $limit) {
    http_response_code(429);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Rate limit exceeded. Try again in a minute.']);
    exit;
}
$hits[] = $now;
file_put_contents($rateFile, json_encode(array_values($hits)));

/* ── Parse request ── */
$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['messages']) || !is_array($input['messages'])) {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(['error' => 'Invalid request. Expected { messages: [...] }']);
    exit;
}

$messages    = $input['messages'];
$systemMsg   = $input['system'] ?? '';
$provider    = $cfg['provider'] ?? 'openai';
$model       = $cfg['model'] ?? 'gpt-4o-mini';
$maxTokens   = $cfg['max_tokens'] ?? 2048;
$apiKey      = $cfg['api_key'];

/* ── Build provider request ── */
if ($provider === 'anthropic') {
    $url  = 'https://api.anthropic.com/v1/messages';
    $headers = [
        'Content-Type: application/json',
        'x-api-key: ' . $apiKey,
        'anthropic-version: 2023-06-01',
    ];
    $body = json_encode([
        'model'      => $model,
        'system'     => $systemMsg,
        'messages'   => $messages,
        'stream'     => true,
        'max_tokens' => $maxTokens,
    ]);
} else {
    $url  = 'https://api.openai.com/v1/chat/completions';
    $headers = [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
    ];
    $apiMessages = [];
    if ($systemMsg) {
        $apiMessages[] = ['role' => 'system', 'content' => $systemMsg];
    }
    foreach ($messages as $m) {
        $apiMessages[] = ['role' => $m['role'], 'content' => $m['content']];
    }
    $body = json_encode([
        'model'      => $model,
        'messages'   => $apiMessages,
        'stream'     => true,
        'max_tokens' => $maxTokens,
    ]);
}

/* ── Stream response via curl ── */
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('X-Accel-Buffering: no');

if (ob_get_level()) ob_end_flush();

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => $headers,
    CURLOPT_POSTFIELDS     => $body,
    CURLOPT_RETURNTRANSFER => false,
    CURLOPT_WRITEFUNCTION  => function ($ch, $data) {
        echo $data;
        if (ob_get_level()) ob_flush();
        flush();
        return strlen($data);
    },
    CURLOPT_TIMEOUT        => 120,
    CURLOPT_CONNECTTIMEOUT => 10,
]);

$result = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if (curl_errno($ch)) {
    $err = curl_error($ch);
    echo "data: " . json_encode(['error' => $err]) . "\n\n";
    flush();
}

curl_close($ch);
