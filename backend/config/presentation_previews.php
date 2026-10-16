<?php

return [
    // Remains OFF until the isolated converter service is deployed and tested.
    'enabled' => (bool) env('PRESENTATION_PREVIEWS_ENABLED', false),
    'converter_url' => env('PRESENTATION_CONVERTER_URL'),
    'converter_token' => env('PRESENTATION_CONVERTER_TOKEN'),
    'max_slides' => 80,
];
