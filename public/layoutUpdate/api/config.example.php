<?php
/*
 * AICIVSIM — AI Advisor API Configuration
 *
 * OPTION A (recommended): Place this file ABOVE the web root as:
 *   /home/<username>/aicivsim_config.php
 *   This is completely inaccessible from the web — no URL can reach it.
 *
 * OPTION B (fallback): Copy to config.php in this same api/ directory.
 *   Protected by .htaccess but still inside public_html/.
 *
 * config.php is gitignored and should NEVER be committed.
 */

return [
    'provider' => 'openai',         // 'openai' or 'anthropic'
    'api_key'  => '',               // Your API key here
    'model'    => 'gpt-4o-mini',    // Model to use

    // Rate limiting
    'rate_limit_per_minute' => 20,  // Max requests per IP per minute
    'max_tokens'            => 2048,

    // Optional: restrict to your domain (leave empty to allow any origin)
    'allowed_origin' => '',         // e.g. 'https://aicivsim.com'
];
