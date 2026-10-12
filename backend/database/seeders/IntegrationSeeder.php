<?php

namespace Database\Seeders;

use App\Models\Integration;
use Illuminate\Database\Seeder;

class IntegrationSeeder extends Seeder
{
    public function run(): void
    {
        $integrations = [
            [
                'slug' => 'youtube',
                'name' => 'YouTube',
                'category' => 'video',
                'provider' => 'youtube',
                'description' => 'Video hosting, embeds and optional YouTube API access.',
            ],
            [
                'slug' => 'cloud_storage',
                'name' => 'Cloud storage',
                'category' => 'storage',
                'provider' => 's3',
                'description' => 'Media, documents and backup storage using an S3-compatible service.',
            ],
            [
                'slug' => 'mailer',
                'name' => 'Email delivery',
                'category' => 'email',
                'provider' => 'smtp',
                'description' => 'Transactional email delivery using SMTP, Resend, Postmark or Amazon SES.',
            ],
            [
                'slug' => 'analytics',
                'name' => 'Analytics',
                'category' => 'analytics',
                'provider' => 'google_analytics',
                'description' => 'Traffic and behaviour measurement for the platform.',
            ],
            [
                'slug' => 'payment_gateway',
                'name' => 'Payment gateway',
                'category' => 'payments',
                'provider' => 'razorpay',
                'description' => 'Payment processing for future paid plans and subscriptions.',
            ],
            [
                'slug' => 'push_notifications',
                'name' => 'Push notifications',
                'category' => 'notifications',
                'provider' => 'firebase',
                'description' => 'Web and mobile push notifications and alerts.',
            ],
        ];

        foreach ($integrations as $integration) {
            Integration::updateOrCreate(
                [
                    'slug' => $integration['slug'],
                ],
                [
                    ...$integration,
                    'is_enabled' => false,
                    'connection_status' => 'not_configured',
                ]
            );
        }
    }
}