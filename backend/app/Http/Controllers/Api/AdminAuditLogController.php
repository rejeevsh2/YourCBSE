<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;

class AdminAuditLogController extends Controller
{
    private const MAX_ENTRIES = 500;

    public function index(): JsonResponse
    {
        $entries = AuditLog::query()
            ->latest('occurred_at')
            ->latest('id')
            ->limit(self::MAX_ENTRIES)
            ->get([
                'id',
                'actor_user_id',
                'actor_name',
                'actor_email',
                'actor_role',
                'action',
                'target',
                'method',
                'route_uri',
                'route_parameters',
                'changed_fields',
                'ip_address',
                'user_agent',
                'response_status',
                'occurred_at',
            ]);

        return response()->json([
            'stats' => [
                'total_actions' =>
                    AuditLog::count(),

                'actions_24h' =>
                    AuditLog::where(
                        'occurred_at',
                        '>=',
                        now()->subDay()
                    )->count(),

                'actions_7d' =>
                    AuditLog::where(
                        'occurred_at',
                        '>=',
                        now()->subDays(7)
                    )->count(),

                'unique_actors' =>
                    AuditLog::whereNotNull(
                        'actor_user_id'
                    )
                        ->distinct()
                        ->count('actor_user_id'),
            ],

            'entries' => $entries,

            'meta' => [
                'returned_entries' =>
                    $entries->count(),

                'max_entries' =>
                    self::MAX_ENTRIES,

                'append_only' => true,
            ],
        ]);
    }
}