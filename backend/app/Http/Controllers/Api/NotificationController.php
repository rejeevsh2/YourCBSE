<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Return notifications for the logged-in student.
     */
    public function index(
        Request $request
    ): JsonResponse {
        $user = $request->user();

        $notifications = $user
            ->notifications()
            ->latest()
            ->take(20)
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => $notification->data,
                    'read' => $notification->read_at !== null,
                    'read_at' => $notification->read_at,
                    'created_at' => $notification->created_at,
                    'time' => $notification->created_at
                        ?->diffForHumans(),
                ];
            });

        return response()->json([
            'notifications' => $notifications,
            'unreadCount' => $user
                ->unreadNotifications()
                ->count(),
        ]);
    }

       /**
     * Mark one notification as read.
     */
    public function markAsRead(
        Request $request,
        string $notificationId
    ): JsonResponse {
        $user = $request->user();

        $notification = $user
            ->notifications()
            ->where('id', $notificationId)
            ->first();

        if (!$notification) {
            return response()->json([
                'message' => 'Notification not found.',
            ], 404);
        }

        if (!$notification->read_at) {
            $notification->markAsRead();
        }

        return response()->json([
            'message' => 'Notification marked as read.',
            'notificationId' => $notification->id,
            'unreadCount' => $user
                ->unreadNotifications()
                ->count(),
        ]);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(
        Request $request
    ): JsonResponse {
        $user = $request->user();

        $user->unreadNotifications->markAsRead();

        return response()->json([
            'message' => 'All notifications marked as read.',
            'unreadCount' => 0,
        ]);
    }
}