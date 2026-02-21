<?php
/*
 * AICIVSIM — AI Advisor API Configuration
 *
 * Copy this file to config.php and fill in your API key.
 * config.php is gitignored and should NEVER be committed.
 *
 * Upload config.php to public_html/api/ on Hostinger.
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
