<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Integration;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AdminIntegrationController extends Controller
{
    public function index(): JsonResponse
    {
        $integrations = Integration::query()
            ->with('updatedBy:id,name,email')
            ->orderBy('id')
            ->get()
            ->map(
                fn (Integration $integration) =>
                    $this->payload($integration)
            )
            ->values();

        return response()->json([
            'integrations' => $integrations,
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $integration = Integration::query()
            ->with('updatedBy:id,name,email')
            ->findOrFail($id);

        return response()->json([
            'integration' =>
                $this->payload($integration),
        ]);
    }

    public function update(
        Request $request,
        int $id
    ): JsonResponse {
        $integration = Integration::findOrFail($id);

        $validated = $request->validate([
            'provider' => [
                'sometimes',
                'nullable',
                'string',
                'max:80',
            ],

            'settings' => [
                'sometimes',
                'array',
            ],

            'credentials' => [
                'sometimes',
                'array',
            ],

            'clear_credentials' => [
                'sometimes',
                'array',
            ],

            'clear_credentials.*' => [
                'string',
                'max:100',
            ],
        ]);

        $originalProvider =
            $integration->provider;

        $originalSettings =
            $integration->settings ?? [];

        $originalCredentials =
            $integration->credentials ?? [];

        if (array_key_exists(
            'provider',
            $validated
        )) {
            $integration->provider =
                $validated['provider'];
        }

        if (array_key_exists(
            'settings',
            $validated
        )) {
            $integration->settings =
                $validated['settings'];
        }

        $providerChanged =
            $integration->provider !==
            $originalProvider;

        $credentials =
            $providerChanged
                ? []
                : $originalCredentials;

        if (array_key_exists(
            'credentials',
            $validated
        )) {
            foreach (
                $validated['credentials']
                as $key => $value
            ) {
                if (
                    is_string($value) &&
                    trim($value) === ''
                ) {
                    continue;
                }

                if ($value === null) {
                    continue;
                }

                $credentials[$key] = $value;
            }
        }

        foreach (
            $validated['clear_credentials']
                ?? []
            as $key
        ) {
            unset($credentials[$key]);
        }

        $integration->credentials =
            $credentials ?: null;

        $settings =
            $integration->settings ?? [];

        $hasConfiguration =
            !empty($settings) ||
            !empty($credentials);

        $configurationChanged =
            $providerChanged ||
            $settings !== $originalSettings ||
            $credentials !== $originalCredentials;

        if (!$hasConfiguration) {
            $integration->connection_status =
                'not_configured';

            $integration->is_enabled = false;

            $this->clearTestState(
                $integration
            );
        } elseif ($configurationChanged) {
            $integration->connection_status =
                'configured';

            /*
             * A changed credential or setting must
             * be tested again before it can be enabled.
             */
            $integration->is_enabled = false;

            $this->clearTestState(
                $integration
            );
        } elseif (
            $integration->connection_status ===
            'not_configured'
        ) {
            $integration->connection_status =
                'configured';
        }

        $integration->updated_by =
            $request->user()?->id;

        $integration->save();

        $integration->load(
            'updatedBy:id,name,email'
        );

        return response()->json([
            'message' =>
                'Integration settings saved.',

            'integration' =>
                $this->payload($integration),
        ]);
    }

    public function test(
        Request $request,
        int $id
    ): JsonResponse {
        $integration = Integration::findOrFail($id);

        if (
            $integration->connection_status ===
            'not_configured'
        ) {
            return response()->json([
                'message' =>
                    'Configure and save this integration before testing it.',
            ], 422);
        }

        try {
            [
                $success,
                $liveVerified,
                $message,
            ] = $this->runConnectionTest(
                $integration
            );
        } catch (\Throwable $exception) {
            $success = false;
            $liveVerified = false;
            $message =
                'Connection test could not be completed.';
        }

        $integration->last_tested_at =
            now();

        $integration->last_test_status =
            $success
                ? 'success'
                : 'failed';

        $integration->last_test_message =
            $message;

        $integration->updated_by =
            $request->user()?->id;

        if ($success) {
            /*
             * "connected" is used only when we were
             * able to verify the external service.
             *
             * Some providers can currently only be
             * configuration-validated. Those remain
             * "configured" but still receive a
             * successful test state.
             */
            $integration->connection_status =
                $liveVerified
                    ? 'connected'
                    : 'configured';

            $integration->connected_at =
                $liveVerified
                    ? now()
                    : null;
        } else {
            $integration->connection_status =
                'failed';

            $integration->connected_at = null;

            $integration->is_enabled = false;
        }

        $integration->save();

        $integration->load(
            'updatedBy:id,name,email'
        );

        return response()->json([
            'message' => $message,

            'success' => $success,

            'live_verified' =>
                $liveVerified,

            'integration' =>
                $this->payload($integration),
        ], $success ? 200 : 422);
    }

    public function toggle(
        Request $request,
        int $id
    ): JsonResponse {
        $integration = Integration::findOrFail($id);

        $validated = $request->validate([
            'is_enabled' => [
                'required',
                'boolean',
            ],
        ]);

        $enable =
            (bool) $validated['is_enabled'];

        if (
            $enable &&
            $integration->last_test_status !==
                'success'
        ) {
            return response()->json([
                'message' =>
                    'Test this integration successfully before enabling it.',
            ], 422);
        }

        if (
            $enable &&
            $integration->connection_status ===
                'failed'
        ) {
            return response()->json([
                'message' =>
                    'This integration failed its latest connection test.',
            ], 422);
        }

        $integration->is_enabled =
            $enable;

        $integration->updated_by =
            $request->user()?->id;

        $integration->save();

        $integration->load(
            'updatedBy:id,name,email'
        );

        return response()->json([
            'message' =>
                $integration->is_enabled
                    ? 'Integration enabled.'
                    : 'Integration disabled.',

            'integration' =>
                $this->payload($integration),
        ]);
    }

    private function runConnectionTest(
        Integration $integration
    ): array {
        $settings =
            $integration->settings ?? [];

        $credentials =
            $integration->credentials ?? [];

        return match ($integration->slug) {
            'youtube' =>
                $this->testYouTube(
                    $credentials
                ),

            'cloud_storage' =>
                $this->testCloudStorage(
                    $settings,
                    $credentials
                ),

            'mailer' =>
                $this->testMailer(
                    $integration->provider,
                    $settings,
                    $credentials
                ),

            'analytics' =>
                $this->testAnalytics(
                    $settings
                ),

            'payment_gateway' =>
                $this->testPaymentGateway(
                    $integration->provider,
                    $credentials
                ),

            'push_notifications' =>
                $this->testPushNotifications(
                    $settings,
                    $credentials
                ),

            default => [
                false,
                false,
                'This integration does not have a connection test yet.',
            ],
        };
    }

    private function testYouTube(
        array $credentials
    ): array {
        $apiKey =
            $this->stringValue(
                $credentials,
                'api_key'
            );

        if (!$apiKey) {
            return [
                false,
                false,
                'A YouTube API key is required.',
            ];
        }

        $response = Http::timeout(10)
            ->acceptJson()
            ->get(
                'https://www.googleapis.com/youtube/v3/videos',
                [
                    'part' => 'id',
                    'chart' => 'mostPopular',
                    'maxResults' => 1,
                    'key' => $apiKey,
                ]
            );

        if (!$response->successful()) {
            return [
                false,
                false,
                'YouTube API verification failed.',
            ];
        }

        return [
            true,
            true,
            'YouTube API connection verified.',
        ];
    }

    private function testCloudStorage(
        array $settings,
        array $credentials
    ): array {
        $region =
            $this->stringValue(
                $settings,
                'region'
            );

        $bucket =
            $this->stringValue(
                $settings,
                'bucket'
            );

        $accessKey =
            $this->stringValue(
                $credentials,
                'access_key_id'
            );

        $secretKey =
            $this->stringValue(
                $credentials,
                'secret_access_key'
            );

        if (
            !$region ||
            !$bucket ||
            !$accessKey ||
            !$secretKey
        ) {
            return [
                false,
                false,
                'Region, bucket and S3 credentials are required.',
            ];
        }

        return [
            true,
            false,
            'S3 configuration validated. Live signed storage verification is not available in the current build.',
        ];
    }

    private function testMailer(
        ?string $provider,
        array $settings,
        array $credentials
    ): array {
        return match ($provider) {
            'smtp' =>
                $this->testSmtp(
                    $settings
                ),

            'resend' =>
                $this->testResend(
                    $credentials
                ),

            'postmark' =>
                $this->testPostmark(
                    $credentials
                ),

            'ses' =>
                $this->testSes(
                    $settings,
                    $credentials
                ),

            default => [
                false,
                false,
                'Select a supported email provider.',
            ],
        };
    }

    private function testSmtp(
        array $settings
    ): array {
        $host =
            $this->stringValue(
                $settings,
                'host'
            );

        $port =
            (int) (
                $settings['port']
                ?? 0
            );

        if (!$host || $port <= 0) {
            return [
                false,
                false,
                'SMTP host and port are required.',
            ];
        }

        $errorNumber = 0;
        $errorMessage = '';

        $socket = @fsockopen(
            $host,
            $port,
            $errorNumber,
            $errorMessage,
            8
        );

        if (!$socket) {
            return [
                false,
                false,
                'SMTP server could not be reached.',
            ];
        }

        fclose($socket);

        return [
            true,
            false,
            'SMTP server is reachable. Authentication will be verified when mail is sent.',
        ];
    }

    private function testResend(
        array $credentials
    ): array {
        $apiKey =
            $this->stringValue(
                $credentials,
                'api_key'
            );

        if (!$apiKey) {
            return [
                false,
                false,
                'A Resend API key is required.',
            ];
        }

        $response = Http::timeout(10)
            ->withToken($apiKey)
            ->acceptJson()
            ->get(
                'https://api.resend.com/domains'
            );

        if (!$response->successful()) {
            return [
                false,
                false,
                'Resend API verification failed.',
            ];
        }

        return [
            true,
            true,
            'Resend API connection verified.',
        ];
    }

    private function testPostmark(
        array $credentials
    ): array {
        $apiKey =
            $this->stringValue(
                $credentials,
                'api_key'
            );

        if (!$apiKey) {
            return [
                false,
                false,
                'A Postmark server token is required.',
            ];
        }

        $response = Http::timeout(10)
            ->withHeaders([
                'Accept' =>
                    'application/json',

                'X-Postmark-Server-Token' =>
                    $apiKey,
            ])
            ->get(
                'https://api.postmarkapp.com/server'
            );

        if (!$response->successful()) {
            return [
                false,
                false,
                'Postmark API verification failed.',
            ];
        }

        return [
            true,
            true,
            'Postmark API connection verified.',
        ];
    }

    private function testSes(
        array $settings,
        array $credentials
    ): array {
        $region =
            $this->stringValue(
                $settings,
                'region'
            );

        $accessKey =
            $this->stringValue(
                $credentials,
                'access_key_id'
            );

        $secretKey =
            $this->stringValue(
                $credentials,
                'secret_access_key'
            );

        if (
            !$region ||
            !$accessKey ||
            !$secretKey
        ) {
            return [
                false,
                false,
                'SES region and AWS credentials are required.',
            ];
        }

        return [
            true,
            false,
            'Amazon SES configuration validated. Live signed API verification is not available in the current build.',
        ];
    }

    private function testAnalytics(
        array $settings
    ): array {
        $measurementId =
            $this->stringValue(
                $settings,
                'measurement_id'
            );

        if (!$measurementId) {
            return [
                false,
                false,
                'A Google Analytics measurement ID is required.',
            ];
        }

        if (
            !preg_match(
                '/^G-[A-Z0-9]+$/i',
                $measurementId
            )
        ) {
            return [
                false,
                false,
                'The Google Analytics measurement ID format is invalid.',
            ];
        }

        return [
            true,
            false,
            'Google Analytics configuration validated.',
        ];
    }

    private function testPaymentGateway(
        ?string $provider,
        array $credentials
    ): array {
        if ($provider === 'razorpay') {
            $keyId =
                $this->stringValue(
                    $credentials,
                    'key_id'
                );

            $keySecret =
                $this->stringValue(
                    $credentials,
                    'key_secret'
                );

            if (!$keyId || !$keySecret) {
                return [
                    false,
                    false,
                    'Razorpay key ID and key secret are required.',
                ];
            }

            $response = Http::timeout(10)
                ->withBasicAuth(
                    $keyId,
                    $keySecret
                )
                ->acceptJson()
                ->get(
                    'https://api.razorpay.com/v1/payments',
                    [
                        'count' => 1,
                    ]
                );

            if (!$response->successful()) {
                return [
                    false,
                    false,
                    'Razorpay API verification failed.',
                ];
            }

            return [
                true,
                true,
                'Razorpay API connection verified.',
            ];
        }

        if ($provider === 'stripe') {
            $secret =
                $this->stringValue(
                    $credentials,
                    'key_secret'
                );

            if (!$secret) {
                return [
                    false,
                    false,
                    'A Stripe secret key is required.',
                ];
            }

            $response = Http::timeout(10)
                ->withToken($secret)
                ->acceptJson()
                ->get(
                    'https://api.stripe.com/v1/balance'
                );

            if (!$response->successful()) {
                return [
                    false,
                    false,
                    'Stripe API verification failed.',
                ];
            }

            return [
                true,
                true,
                'Stripe API connection verified.',
            ];
        }

        return [
            false,
            false,
            'Select a supported payment provider.',
        ];
    }

    private function testPushNotifications(
        array $settings,
        array $credentials
    ): array {
        $projectId =
            $this->stringValue(
                $settings,
                'project_id'
            );

        $credential =
            $this->stringValue(
                $credentials,
                'server_key'
            );

        if (!$projectId || !$credential) {
            return [
                false,
                false,
                'Firebase project ID and credential are required.',
            ];
        }

        return [
            true,
            false,
            'Firebase configuration validated. Live FCM service-account verification is not available in the current build.',
        ];
    }

    private function stringValue(
        array $values,
        string $key
    ): ?string {
        $value =
            $values[$key]
            ?? null;

        if (!is_string($value)) {
            return null;
        }

        $value = trim($value);

        return $value !== ''
            ? $value
            : null;
    }

    private function clearTestState(
        Integration $integration
    ): void {
        $integration->last_test_status = null;
        $integration->last_test_message = null;
        $integration->last_tested_at = null;
        $integration->connected_at = null;
    }

    private function payload(
        Integration $integration
    ): array {
        $credentialKeys = array_keys(
            $integration->credentials ?? []
        );

        return [
            'id' =>
                (int) $integration->id,

            'slug' =>
                $integration->slug,

            'name' =>
                $integration->name,

            'category' =>
                $integration->category,

            'provider' =>
                $integration->provider,

            'description' =>
                $integration->description,

            'is_enabled' =>
                (bool) $integration->is_enabled,

            'connection_status' =>
                $integration->connection_status,

            'settings' =>
                $integration->settings ?? [],

            'has_credentials' =>
                count($credentialKeys) > 0,

            'credential_keys' =>
                $credentialKeys,

            'last_test_status' =>
                $integration->last_test_status,

            'last_test_message' =>
                $integration->last_test_message,

            'last_tested_at' =>
                $integration->last_tested_at
                    ?->toISOString(),

            'connected_at' =>
                $integration->connected_at
                    ?->toISOString(),

            'updated_by' =>
                $integration->updatedBy
                    ? [
                        'id' =>
                            (int) $integration
                                ->updatedBy->id,

                        'name' =>
                            $integration
                                ->updatedBy->name,

                        'email' =>
                            $integration
                                ->updatedBy->email,
                    ]
                    : null,

            'updated_at' =>
                $integration->updated_at
                    ?->toISOString(),
        ];
    }
}