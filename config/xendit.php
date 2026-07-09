<?php

return [

    'secret_key' => env('XENDIT_SECRET_KEY'),
    'webhook_token' => env('XENDIT_WEBHOOK_TOKEN'),
    'callback_verification_token' => env('XENDIT_CALLBACK_VERIFICATION_TOKEN'),
    'platform_account_id' => env('XENDIT_PLATFORM_ACCOUNT_ID'),

    'base_url' => env('XENDIT_BASE_URL', 'https://api.xendit.co'),

    'timeout' => env('XENDIT_TIMEOUT', 30),

    'platform_fee' => [
        'type' => env('XENDIT_FEE_TYPE', 'percent'),
        'percent' => (float) env('XENDIT_FEE_PERCENT', 2.0),
        'flat_amount' => (int) env('XENDIT_FEE_FLAT', 0),
    ],

    'withdrawal' => [
        'min_amount' => (int) env('XENDIT_WITHDRAWAL_MIN', 50000),
        'rate_limit_per_hour' => (int) env('XENDIT_WITHDRAWAL_RATE_LIMIT', 5),
    ],

];
