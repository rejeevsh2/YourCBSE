<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BlockedIp;
use App\Models\LoginEvent;
use App\Models\SecurityAlert;
use App\Models\SecuritySetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSecurityController extends Controller
{
    /**
     * Security Center dashboard.
     */
    public function index(): JsonResponse
    {
        $this->expireOldBlocks();

        $settings = SecuritySetting::current();

        $activeBlocks = BlockedIp::query()
            ->where('is_active', true)
            ->where(function ($query) {
                $query
                    ->whereNull('blocked_until')
                    ->orWhere('blocked_until', '>', now());
            })
            ->orderByDesc('created_at')
            ->get();

        $alerts = SecurityAlert::query()
            ->with([
                'user:id,name,email',
                'resolvedBy:id,name,email',
            ])
            ->orderByRaw("
                CASE
                    WHEN status = 'open' THEN 0
                    ELSE 1
                END
            ")
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        $loginEvents = LoginEvent::query()
            ->with('user:id,name,email,role')
            ->orderByDesc('occurred_at')
            ->limit(50)
            ->get();

        return response()->json([
            'stats' => [
                'open_alerts' => SecurityAlert::query()
                    ->where('status', 'open')
                    ->count(),

                'failed_logins_24h' => LoginEvent::query()
                    ->where('status', 'failed')
                    ->where(
                        'occurred_at',
                        '>=',
                        now()->subDay()
                    )
                    ->count(),

                'successful_logins_24h' => LoginEvent::query()
                    ->where('status', 'success')
                    ->where(
                        'occurred_at',
                        '>=',
                        now()->subDay()
                    )
                    ->count(),

                'blocked_ips' => $activeBlocks->count(),

                /*
                 * MFA is intentionally reported as unavailable until
                 * YourTeacher has a real MFA implementation.
                 */
                'mfa_available' => false,
            ],

            'settings' => [
                'id' => $settings->id,
                'failed_login_lockout_enabled' =>
                    $settings->failed_login_lockout_enabled,
                'failed_login_max_attempts' =>
                    $settings->failed_login_max_attempts,
                'failed_login_window_minutes' =>
                    $settings->failed_login_window_minutes,
                'failed_login_lockout_minutes' =>
                    $settings->failed_login_lockout_minutes,
                'admin_ip_restriction_enabled' =>
                    $settings->admin_ip_restriction_enabled,
                'allowed_admin_ips' =>
                    $settings->allowed_admin_ips ?? [],
                'security_alerts_enabled' =>
                    $settings->security_alerts_enabled,
                'updated_at' =>
                    $settings->updated_at?->toIso8601String(),
            ],

            'alerts' => $alerts,
            'login_events' => $loginEvents,
            'blocked_ips' => $activeBlocks,
        ]);
    }

    /**
     * Update implemented Security Center policies.
     */
    public function updateSettings(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'failed_login_lockout_enabled' =>
                'required|boolean',

            'failed_login_max_attempts' =>
                'required|integer|min:3|max:20',

            'failed_login_window_minutes' =>
                'required|integer|min:1|max:1440',

            'failed_login_lockout_minutes' =>
                'required|integer|min:1|max:10080',

            'admin_ip_restriction_enabled' =>
                'required|boolean',

            'allowed_admin_ips' =>
                'nullable|array|max:100',

            'allowed_admin_ips.*' =>
                'required|ip',

            'security_alerts_enabled' =>
                'required|boolean',
        ]);

        $allowedIps = collect(
            $validated['allowed_admin_ips'] ?? []
        )
            ->map(fn ($ip) => trim($ip))
            ->filter()
            ->unique()
            ->values()
            ->all();

        /*
         * Prevent an administrator from accidentally enabling
         * IP restriction with no valid way back into the panel.
         */
        if (
            $validated['admin_ip_restriction_enabled']
            && empty($allowedIps)
        ) {
            return response()->json([
                'message' =>
                    'Add at least one allowed admin IP before enabling IP restriction.',
            ], 422);
        }

        $currentIp = $request->ip();

        if (
            $validated['admin_ip_restriction_enabled']
            && $currentIp !== null
            && !in_array($currentIp, $allowedIps, true)
        ) {
            return response()->json([
                'message' =>
                    'Your current IP address must be included in the allowed list before enabling admin IP restriction.',
                'current_ip' => $currentIp,
            ], 422);
        }

        $settings = SecuritySetting::current();

        $settings->update([
            'failed_login_lockout_enabled' =>
                $validated['failed_login_lockout_enabled'],

            'failed_login_max_attempts' =>
                $validated['failed_login_max_attempts'],

            'failed_login_window_minutes' =>
                $validated['failed_login_window_minutes'],

            'failed_login_lockout_minutes' =>
                $validated['failed_login_lockout_minutes'],

            'admin_ip_restriction_enabled' =>
                $validated['admin_ip_restriction_enabled'],

            'allowed_admin_ips' =>
                $allowedIps ?: null,

            'security_alerts_enabled' =>
                $validated['security_alerts_enabled'],

            'updated_by' =>
                $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Security policies saved.',
            'settings' => $settings->fresh(),
        ]);
    }

    /**
     * Resolve a Security Center alert.
     */
    public function resolveAlert(
        Request $request,
        int $id
    ): JsonResponse {
        $alert = SecurityAlert::query()
            ->findOrFail($id);

        if ($alert->status !== 'resolved') {
            $alert->update([
                'status' => 'resolved',
                'resolved_at' => now(),
                'resolved_by' => $request->user()->id,
            ]);
        }

        return response()->json([
            'message' => 'Security alert resolved.',
            'alert' => $alert->fresh([
                'user:id,name,email',
                'resolvedBy:id,name,email',
            ]),
        ]);
    }

    /**
     * Manually block an IP address.
     */
    public function blockIp(
        Request $request
    ): JsonResponse {
        $validated = $request->validate([
            'ip_address' => 'required|ip',
            'reason' => 'nullable|string|max:1000',
            'blocked_until' =>
                'nullable|date|after:now',
        ]);

        if (
            $request->ip() !== null
            && $validated['ip_address'] === $request->ip()
        ) {
            return response()->json([
                'message' =>
                    'You cannot manually block your current IP address.',
            ], 422);
        }

        $block = BlockedIp::query()
            ->updateOrCreate(
                [
                    'ip_address' =>
                        $validated['ip_address'],
                ],
                [
                    'source' => 'manual',
                    'reason' =>
                        $validated['reason']
                        ?? 'Manually blocked by administrator.',
                    'is_active' => true,
                    'blocked_until' =>
                        $validated['blocked_until']
                        ?? null,
                    'created_by' =>
                        $request->user()->id,
                ]
            );

        return response()->json([
            'message' => 'IP address blocked.',
            'blocked_ip' => $block->fresh(
                'createdBy:id,name,email'
            ),
        ]);
    }

    /**
     * Deactivate an IP block while preserving its history.
     */
    public function unblockIp(
        int $id
    ): JsonResponse {
        $block = BlockedIp::query()
            ->findOrFail($id);

        $block->update([
            'is_active' => false,
        ]);

        return response()->json([
            'message' => 'IP address unblocked.',
            'blocked_ip' => $block->fresh(
                'createdBy:id,name,email'
            ),
        ]);
    }

    private function expireOldBlocks(): void
    {
        BlockedIp::query()
            ->where('is_active', true)
            ->whereNotNull('blocked_until')
            ->where('blocked_until', '<=', now())
            ->update([
                'is_active' => false,
            ]);
    }
}