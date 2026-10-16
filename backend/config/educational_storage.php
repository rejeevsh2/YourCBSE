<?php

return [
    /*
    |------------------------------------------------------------------
    | Phased migration flags for educational file delivery
    |------------------------------------------------------------------
    | These flags deliberately default to false. Until the authenticated
    | R2 upload and view flows have shipped and passed mobile/browser
    | tests, *no* existing lesson files or media are switched to R2.
    |
    | This config is a rollout contract; it does not enable migration.
    */
    'r2_new_uploads_enabled' => (bool) env('EDUCATIONAL_R2_UPLOADS_ENABLED', false),
    'r2_signed_reads_enabled' => (bool) env('EDUCATIONAL_R2_READS_ENABLED', false),
    'r2_url_ttl_seconds' => max(60, min(900, (int) env('EDUCATIONAL_R2_URL_TTL_SECONDS', 120))),
];
