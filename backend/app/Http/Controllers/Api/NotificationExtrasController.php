<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LessonProgress;
use App\Models\PlannerTask;
use App\Models\User;
use App\Notifications\StudentNotification;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class NotificationExtrasController extends Controller
{
    public function center(Request $request)
    {
        return response()->json(
            $request->user()
                ->notifications()
                ->latest()
                ->limit(200)
                ->get()
                ->map(fn ($notification) => [
                    'id' => $notification->id,
                    'category' =>
                        ($notification->data['type'] ?? '') === 'lesson'
                            ? 'Learning'
                            : 'Announcements',
                    'title' =>
                        $notification->data['title'] ?? 'Update',
                    'description' =>
                        $notification->data['message'] ?? '',
                    'createdAt' =>
                        $notification->created_at->toIso8601String(),
                    'status' =>
                        $notification->read_at ? 'read' : 'unread',
                    'priority' => 'normal',
                    'to' => $this->safeLink(
                        $notification->data['link'] ?? null
                    ),
                ])
        );
    }

    private function safeLink($link)
    {
        return is_string($link) &&
            preg_match(
                '~^/(?!/)[a-zA-Z0-9/_?=&.-]*$~',
                $link
            )
                ? $link
                : '/student/notifications';
    }

    public function delete(
        Request $request,
        string $id
    ) {
        $request->user()
            ->notifications()
            ->findOrFail($id)
            ->delete();

        return response()->json([
            'message' => 'Notification deleted.',
        ]);
    }

    public function preferences(Request $request)
    {
        $preferences = json_decode(
            $request->user()
                ->getRawOriginal('notification_preferences') ?? '{}',
            true
        ) ?? [];

        return response()->json([
            [
                'id' => 'learning',
                'label' => 'New lesson published',
                'hint' => 'For your grade and subjects',
                'enabled' => $preferences['learning'] ?? true,
                'group' => 'Learning',
            ],
            [
                'id' => 'tests',
                'label' => 'Upcoming test reminders',
                'hint' => '3 days and 1 day before',
                'enabled' => $preferences['tests'] ?? true,
                'group' => 'Learning',
            ],
            [
                'id' => 'assignments',
                'label' => 'Assignment deadlines',
                'hint' => 'Evening before due date',
                'enabled' => $preferences['assignments'] ?? true,
                'group' => 'Learning',
            ],
            [
                'id' => 'daily_study',
                'label' => 'Daily study reminder',
                'hint' => 'Every day at 7:00 PM',
                'enabled' => $preferences['daily_study'] ?? true,
                'group' => 'Learning',
            ],
            [
                'id' => 'achievements',
                'label' => 'Achievement unlocked',
                'hint' => 'Badges and streak milestones',
                'enabled' => $preferences['achievements'] ?? false,
                'group' => 'Learning',
            ],
            [
                'id' => 'announcements',
                'label' => 'Announcements',
                'hint' => 'Important platform announcements',
                'enabled' => $preferences['announcements'] ?? true,
                'group' => 'Platform',
            ],
        ]);
    }

    public function updatePreference(Request $request)
    {
        $data = $request->validate([
            'id' => [
                'required',
                Rule::in([
                    'learning',
                    'tests',
                    'assignments',
                    'daily_study',
                    'achievements',
                    'announcements',
                ]),
            ],
            'enabled' => [
                'required',
                'boolean',
            ],
        ]);

        $preferences = json_decode(
            $request->user()
                ->getRawOriginal('notification_preferences') ?? '{}',
            true
        ) ?? [];

        $preferences[$data['id']] =
            $data['enabled'];

        $request->user()
            ->forceFill([
                'notification_preferences' =>
                    json_encode($preferences),
            ])
            ->save();

        return response()->json([
            'message' => 'Preference saved.',
        ]);
    }

    public function reminders(Request $request)
    {
        return response()->json(
            PlannerTask::where(
                'user_id',
                $request->user()->id
            )
                ->where('done', false)
                ->orderBy('due_date')
                ->limit(20)
                ->get()
                ->map(fn ($task) => [
                    'id' => (string) $task->id,
                    'title' => $task->title,
                    'description' =>
                        $task->notes ??
                        (
                            $task->category .
                            ' · ' .
                            $task->minutes .
                            ' min'
                        ),
                    'due' => $task->due_date,
                    'tone' => 'primary',
                    'to' => '/student/planner',
                ])
        );
    }

    public function achievements(Request $request)
    {
        $lessons = LessonProgress::where(
            'user_id',
            $request->user()->id
        )
            ->where('is_completed', true)
            ->whereHas(
                'lesson',
                fn ($query) =>
                    $query->published()
            )
            ->orderBy('completed_at')
            ->get();

        $rows = [];

        foreach ([1, 5, 10, 25, 50] as $number) {
            if ($lessons->count() >= $number) {
                $rows[] = [
                    'id' => 'lessons-' . $number,
                    'title' =>
                        $number .
                        ' lesson' .
                        ($number === 1 ? '' : 's') .
                        ' completed',
                    'description' =>
                        'A milestone in your learning journey.',
                    'earnedAt' =>
                        $lessons[$number - 1]
                            ->completed_at
                            ?->toDateString() ?? '',
                ];
            }
        }

        return response()->json($rows);
    }

    public function announce(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
            'role' => [
                'required',
                Rule::in([
                    'student',
                    'teacher',
                ]),
            ],
            'link' => 'nullable|string|max:255',
        ]);

        if (!empty($data['link'])) {
            abort_if(
                $this->safeLink($data['link']) !==
                    $data['link'],
                422,
                'Use an internal website path for the link.'
            );
        }

        $count = 0;

        User::where(
            'role',
            $data['role']
        )->chunkById(
            100,
            function ($users) use (
                $data,
                &$count
            ) {
                foreach ($users as $user) {
                    $preferences = json_decode(
                        $user->getRawOriginal(
                            'notification_preferences'
                        ) ?? '{}',
                        true
                    ) ?? [];

                    if (
                        ($preferences['announcements'] ?? true)
                        === false
                    ) {
                        continue;
                    }

                    $user->notify(
                        new StudentNotification(
                            $data['title'],
                            $data['message'],
                            'announcement',
                            $data['link'] ?? null
                        )
                    );

                    $count++;
                }
            }
        );

        return response()->json([
            'message' =>
                'Announcement delivered in app.',
            'recipients' => $count,
        ]);
    }
}