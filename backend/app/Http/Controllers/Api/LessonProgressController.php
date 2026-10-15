<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Lesson;
use App\Models\LessonProgress;
use App\Models\Subject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonProgressController extends Controller
{
    /**
     * Get the logged-in student's progress for one lesson.
     */
    public function show(
        Request $request,
        Lesson $lesson
    ): JsonResponse {
        abort_unless(Lesson::published()->accessibleTo($request->user())->whereKey($lesson->id)->exists(), 404);
        $progress = LessonProgress::query()
        ->whereHas('lesson', fn ($q) => $q->published()->accessibleTo($request->user()))
            ->where('user_id', $request->user()->id)
            ->where('lesson_id', $lesson->id)
            ->first();

        return response()->json([
            'lesson_id' => $lesson->id,
            'progress' => $progress,
        ]);
    }

    /**
     * Record that the student opened a lesson.
     */
    public function open(
        Request $request,
        Lesson $lesson
    ): JsonResponse {
        abort_unless(Lesson::published()->accessibleTo($request->user())->whereKey($lesson->id)->exists(), 404);
        $now = now();

        $progress = LessonProgress::firstOrNew([
            'user_id' => $request->user()->id,
            'lesson_id' => $lesson->id,
        ]);

        if (!$progress->exists) {
            $progress->started_at = $now;
        }

        $progress->last_opened_at = $now;
        $progress->save();

        return response()->json([
            'message' => 'Lesson activity recorded.',
            'progress' => $progress,
        ]);
    }

    /**
     * Mark a lesson as completed.
     */
    public function complete(
        Request $request,
        Lesson $lesson
    ): JsonResponse {
        abort_unless(Lesson::published()->accessibleTo($request->user())->whereKey($lesson->id)->exists(), 404);
        $now = now();

        $progress = LessonProgress::firstOrNew([
            'user_id' => $request->user()->id,
            'lesson_id' => $lesson->id,
        ]);

        if (!$progress->exists) {
            $progress->started_at = $now;
        }

        $progress->is_completed = true;
        $progress->last_opened_at = $now;

        if (!$progress->completed_at) {
            $progress->completed_at = $now;
        }

        $progress->save();

        return response()->json([
            'message' => 'Lesson marked as complete.',
            'progress' => $progress,
        ]);
    }

    /**
     * Change a completed lesson back to incomplete.
     */
    public function incomplete(
        Request $request,
        Lesson $lesson
    ): JsonResponse {
        abort_unless(Lesson::published()->accessibleTo($request->user())->whereKey($lesson->id)->exists(), 404);
        $progress = LessonProgress::query()
        ->whereHas('lesson', fn ($q) => $q->published()->accessibleTo($request->user()))
            ->where('user_id', $request->user()->id)
            ->where('lesson_id', $lesson->id)
            ->first();

        if (!$progress) {
            return response()->json([
                'message' => 'No lesson progress exists yet.',
                'progress' => null,
            ]);
        }

        $progress->is_completed = false;
        $progress->completed_at = null;
        $progress->last_opened_at = now();
        $progress->save();

        return response()->json([
            'message' => 'Lesson marked as incomplete.',
            'progress' => $progress,
        ]);
    }

    /**
     * Return progress for all published lessons in a chapter
     * for the currently logged-in student.
     */
    public function chapterProgress(
        Request $request,
        Chapter $chapter
    ): JsonResponse {
        $userId = $request->user()->id;

        $lessons = Lesson::published()->accessibleTo($request->user())
            ->where('chapter_id', $chapter->id)
            ->where('is_published', true)
            ->where('is_active', true)
            ->orderBy('display_order')
            ->orderBy('lesson_number')
            ->get([
                'id',
                'chapter_id',
                'title',
                'slug',
                'lesson_number',
                'summary',
                'duration',
                'display_order',
            ]);

        $progressRecords = LessonProgress::query()
        ->whereHas('lesson', fn ($q) => $q->published()->accessibleTo($request->user()))
            ->where('user_id', $userId)
            ->whereIn('lesson_id', $lessons->pluck('id'))
            ->get()
            ->keyBy('lesson_id');

        $lessonProgress = $lessons->map(function ($lesson) use ($progressRecords) {
            $progress = $progressRecords->get($lesson->id);

            return [
                'lesson' => $lesson,
                'is_started' => $progress !== null,
                'is_completed' => (bool) ($progress?->is_completed ?? false),
                'started_at' => $progress?->started_at,
                'last_opened_at' => $progress?->last_opened_at,
                'completed_at' => $progress?->completed_at,
            ];
        });

        $totalLessons = $lessons->count();

        $completedLessons = $lessonProgress
            ->where('is_completed', true)
            ->count();

        $startedLessons = $lessonProgress
            ->where('is_started', true)
            ->count();

        $percentage = $totalLessons > 0
            ? (int) round(($completedLessons / $totalLessons) * 100)
            : 0;

        return response()->json([
            'chapter_id' => $chapter->id,
            'total_lessons' => $totalLessons,
            'started_lessons' => $startedLessons,
            'completed_lessons' => $completedLessons,
            'percentage' => $percentage,
            'lessons' => $lessonProgress->values(),
        ]);
    }

    /**
     * Return the student's most recently opened unfinished lesson.
     * If all started lessons are completed, return the most recent lesson.
     */
    public function continueLearning(
        Request $request
    ): JsonResponse {
        $userId = $request->user()->id;

        $progress = LessonProgress::query()
        ->whereHas('lesson', fn ($q) => $q->published()->accessibleTo($request->user()))
            ->with([
                'lesson',
                'lesson.chapter',
                'lesson.chapter.unit',
                'lesson.chapter.unit.subject',
            ])
            ->where('user_id', $userId)
            ->where('is_completed', false)
            ->whereNotNull('last_opened_at')
            ->orderByDesc('last_opened_at')
            ->first();

        if (!$progress) {
            $progress = LessonProgress::query()
        ->whereHas('lesson', fn ($q) => $q->published()->accessibleTo($request->user()))
                ->with([
                    'lesson',
                    'lesson.chapter',
                    'lesson.chapter.unit',
                    'lesson.chapter.unit.subject',
                ])
                ->where('user_id', $userId)
                ->whereNotNull('last_opened_at')
                ->orderByDesc('last_opened_at')
                ->first();
        }

        return response()->json([
            'progress' => $progress,
        ]);
    }

    /**
     * Dashboard statistics for the logged-in student.
     */
    public function dashboardStats(
    Request $request
): JsonResponse {
    $userId = $request->user()->id;

    $totalLessons = Lesson::published()->accessibleTo($request->user())
        ->where('is_active', true)
        ->where('is_published', true)
        ->count();

    $completedLessons = LessonProgress::query()
        ->whereHas('lesson', fn ($q) => $q->published()->accessibleTo($request->user()))
        ->where('user_id', $userId)
        ->where('is_completed', true)
        ->count();

    $inProgressLessons = LessonProgress::query()
        ->whereHas('lesson', fn ($q) => $q->published()->accessibleTo($request->user()))
        ->where('user_id', $userId)
        ->where('is_completed', false)
        ->count();

    $percentage = $totalLessons > 0
        ? (int) round(($completedLessons / $totalLessons) * 100)
        : 0;

    return response()->json([
        'totalLessons' => $totalLessons,
        'completedLessons' => $completedLessons,
        'inProgressLessons' => $inProgressLessons,
        'percentage' => $percentage,
    ]);
}

/**
 * Return the student's recently opened chapters.
 */
public function recentChapters(
    Request $request
): JsonResponse {
    $chapters = LessonProgress::query()
        ->whereHas('lesson', fn ($q) => $q->published()->accessibleTo($request->user()))
        ->with([
            'lesson.chapter.unit.subject',
        ])
        ->where('user_id', $request->user()->id)
        ->whereNotNull('last_opened_at')
        ->orderByDesc('last_opened_at')
        ->get()
        ->pluck('lesson.chapter')
        ->filter()
        ->unique('id')
        ->take(4)
        ->values()
        ->map(function ($chapter) {
            return [
                'id' => $chapter->id,
                'title' => $chapter->title,
                'slug' => $chapter->slug,
                'subject' => $chapter->unit?->subject?->name,
                'unit' => $chapter->unit?->title,
            ];
        });

    return response()->json([
        'chapters' => $chapters,
    ]);
}

/**
 * Return the student's recent learning activity.
 */
public function recentActivity(
    Request $request
): JsonResponse {
    $activities = LessonProgress::query()
        ->whereHas('lesson', fn ($q) => $q->published()->accessibleTo($request->user()))
        ->with([
            'lesson.chapter.unit.subject',
        ])
        ->where('user_id', $request->user()->id)
        ->whereNotNull('last_opened_at')
        ->orderByDesc('last_opened_at')
        ->take(10)
        ->get()
        ->map(function ($progress) {
            return [
                'id' => $progress->id,

                'lesson' =>
                    $progress->lesson?->title,

                'chapter' =>
                    $progress->lesson?->chapter?->title,

                'subject' =>
                    $progress
                        ->lesson
                        ?->chapter
                        ?->unit
                        ?->subject
                        ?->name,

                'completed' =>
                    (bool) $progress->is_completed,

                'time' =>
                    $progress->last_opened_at
                        ?->diffForHumans(),
            ];
        });

    return response()->json([
        'activities' => $activities,
    ]);
}
/**
 * Return real course/subject progress for the logged-in student.
 */
public function myCourses(
    Request $request
): JsonResponse {
    $userId = $request->user()->id;

    $subjects = Subject::query()
        ->accessibleTo($request->user())
        ->where('is_active', true)
        ->with([
            'grade',
            'units' => function ($query) {
                $query
                    ->where('is_active', true)
                    ->orderBy('display_order');
            },
            'units.chapters' => function ($query) {
                $query
                    ->where('is_active', true)
                    ->orderBy('display_order');
            },
            'units.chapters.lessons' => function ($query) {
                $query
                    ->where('is_active', true)
                    ->where('is_published', true)
                    ->orderBy('display_order')
                    ->orderBy('lesson_number');
            },
        ])
        ->orderBy('display_order')
        ->get();

    $lessonIds = $subjects
        ->flatMap(
            fn ($subject) => $subject->units
                ->flatMap(
                    fn ($unit) => $unit->chapters
                        ->flatMap(
                            fn ($chapter) => $chapter->lessons
                        )
                )
        )
        ->pluck('id')
        ->unique()
        ->values();

    $progressRecords = LessonProgress::query()
        ->whereHas('lesson', fn ($q) => $q->published()->accessibleTo($request->user()))
        ->where('user_id', $userId)
        ->whereIn('lesson_id', $lessonIds)
        ->get()
        ->keyBy('lesson_id');

    $courses = $subjects->map(function ($subject) use ($progressRecords) {
        $chapters = $subject->units
            ->flatMap(fn ($unit) => $unit->chapters);

        $lessons = $chapters
            ->flatMap(fn ($chapter) => $chapter->lessons);

        $totalLessons = $lessons->count();

        $completedLessons = $lessons
            ->filter(function ($lesson) use ($progressRecords) {
                return (bool) (
                    $progressRecords
                        ->get($lesson->id)
                        ?->is_completed ?? false
                );
            })
            ->count();

        $startedLessons = $lessons
            ->filter(function ($lesson) use ($progressRecords) {
                return $progressRecords->has($lesson->id);
            })
            ->count();

        $completedChapters = $chapters
            ->filter(function ($chapter) use ($progressRecords) {
                $chapterLessons = $chapter->lessons;

                if ($chapterLessons->isEmpty()) {
                    return false;
                }

                return $chapterLessons->every(
                    function ($lesson) use ($progressRecords) {
                        return (bool) (
                            $progressRecords
                                ->get($lesson->id)
                                ?->is_completed ?? false
                        );
                    }
                );
            })
            ->count();

        $percentage = $totalLessons > 0
            ? (int) round(
                ($completedLessons / $totalLessons) * 100
            )
            : 0;

        $nextLesson = $lessons->first(
            function ($lesson) use ($progressRecords) {
                return !(
                    $progressRecords
                        ->get($lesson->id)
                        ?->is_completed ?? false
                );
            }
        );

        return [
            'id' => $subject->id,
            'name' => $subject->name,
            'code' => $subject->code,
            'icon' => $subject->icon,
            'color' => $subject->color,

            'grade' => $subject->grade
                ? [
                    'id' => $subject->grade->id,
                    'name' => $subject->grade->name,
                ]
                : null,

            'total_chapters' => $chapters->count(),
            'completed_chapters' => $completedChapters,

            'total_lessons' => $totalLessons,
            'started_lessons' => $startedLessons,
            'completed_lessons' => $completedLessons,

            'percentage' => $percentage,

            'next_lesson' => $nextLesson
                ? [
                    'id' => $nextLesson->id,
                    'title' => $nextLesson->title,
                    'lesson_number' =>
                        $nextLesson->lesson_number,
                    'chapter_id' =>
                        $nextLesson->chapter_id,
                ]
                : null,
        ];
    })->values();

    return response()->json([
        'courses' => $courses,
        'count' => $courses->count(),
    ]);
}
/**
 * Return the logged-in student's complete learning path.
 */
public function learningPath(
    Request $request
): JsonResponse {
    $userId = $request->user()->id;

    $subjects = \App\Models\Subject::query()
        ->accessibleTo($request->user())
        ->with([
            'grade',
            'units' => function ($query) {
                $query
                    ->where('is_active', true)
                    ->orderBy('display_order')
                    ->orderBy('unit_number');
            },
            'units.chapters' => function ($query) {
                $query
                    ->where('is_active', true)
                    ->orderBy('display_order')
                    ->orderBy('chapter_number');
            },
            'units.chapters.lessons' => function ($query) {
                $query
                    ->where('is_active', true)
                    ->where('is_published', true)
                    ->orderBy('display_order')
                    ->orderBy('lesson_number');
            },
        ])
        ->where('is_active', true)
        ->orderBy('display_order')
        ->get();

    $lessonIds = $subjects
        ->flatMap(fn ($subject) =>
            $subject->units->flatMap(fn ($unit) =>
                $unit->chapters->flatMap(fn ($chapter) =>
                    $chapter->lessons->pluck('id')
                )
            )
        )
        ->unique()
        ->values();

    $progressRecords = LessonProgress::query()
        ->whereHas('lesson', fn ($q) => $q->published()->accessibleTo($request->user()))
        ->where('user_id', $userId)
        ->whereIn('lesson_id', $lessonIds)
        ->get()
        ->keyBy('lesson_id');

    $totalLessons = 0;
    $completedLessons = 0;
    $startedLessons = 0;

    $path = $subjects->map(function ($subject) use (
        $progressRecords,
        &$totalLessons,
        &$completedLessons,
        &$startedLessons
    ) {
        $subjectTotal = 0;
        $subjectCompleted = 0;
        $subjectStarted = 0;

        $units = $subject->units->map(function ($unit) use (
            $progressRecords,
            &$totalLessons,
            &$completedLessons,
            &$startedLessons,
            &$subjectTotal,
            &$subjectCompleted,
            &$subjectStarted
        ) {
            $unitTotal = 0;
            $unitCompleted = 0;

            $chapters = $unit->chapters->map(function ($chapter) use (
                $progressRecords,
                &$totalLessons,
                &$completedLessons,
                &$startedLessons,
                &$subjectTotal,
                &$subjectCompleted,
                &$subjectStarted,
                &$unitTotal,
                &$unitCompleted
            ) {
                $chapterTotal = $chapter->lessons->count();
                $chapterCompleted = 0;
                $chapterStarted = 0;

                $lessons = $chapter->lessons->map(
                    function ($lesson) use (
                        $progressRecords,
                        &$chapterCompleted,
                        &$chapterStarted
                    ) {
                        $progress =
                            $progressRecords->get($lesson->id);

                        $isStarted = $progress !== null;

                        $isCompleted = (bool) (
                            $progress?->is_completed ?? false
                        );

                        if ($isStarted) {
                            $chapterStarted++;
                        }

                        if ($isCompleted) {
                            $chapterCompleted++;
                        }

                        return [
                            'id' => $lesson->id,
                            'title' => $lesson->title,
                            'slug' => $lesson->slug,
                            'lesson_number' =>
                                $lesson->lesson_number,
                            'duration' =>
                                $lesson->duration,
                            'is_started' =>
                                $isStarted,
                            'is_completed' =>
                                $isCompleted,
                            'last_opened_at' =>
                                $progress?->last_opened_at,
                        ];
                    }
                );

                $chapterPercentage =
                    $chapterTotal > 0
                        ? (int) round(
                            ($chapterCompleted /
                                $chapterTotal) * 100
                        )
                        : 0;

                $totalLessons += $chapterTotal;
                $completedLessons += $chapterCompleted;
                $startedLessons += $chapterStarted;

                $subjectTotal += $chapterTotal;
                $subjectCompleted += $chapterCompleted;
                $subjectStarted += $chapterStarted;

                $unitTotal += $chapterTotal;
                $unitCompleted += $chapterCompleted;

                return [
                    'id' => $chapter->id,
                    'title' => $chapter->title,
                    'code' => $chapter->code,
                    'chapter_number' =>
                        $chapter->chapter_number,
                    'total_lessons' =>
                        $chapterTotal,
                    'completed_lessons' =>
                        $chapterCompleted,
                    'percentage' =>
                        $chapterPercentage,
                    'lessons' =>
                        $lessons->values(),
                ];
            });

            $unitPercentage =
                $unitTotal > 0
                    ? (int) round(
                        ($unitCompleted / $unitTotal) * 100
                    )
                    : 0;

            return [
                'id' => $unit->id,
                'title' => $unit->title,
                'code' => $unit->code,
                'unit_number' => $unit->unit_number,
                'total_lessons' => $unitTotal,
                'completed_lessons' =>
                    $unitCompleted,
                'percentage' => $unitPercentage,
                'chapters' => $chapters->values(),
            ];
        });

        $subjectPercentage =
            $subjectTotal > 0
                ? (int) round(
                    ($subjectCompleted /
                        $subjectTotal) * 100
                )
                : 0;

        return [
            'id' => $subject->id,
            'name' => $subject->name,
            'code' => $subject->code,
            'icon' => $subject->icon,
            'color' => $subject->color,

            'grade' => $subject->grade
                ? [
                    'id' => $subject->grade->id,
                    'name' => $subject->grade->name,
                    'grade_number' =>
                        $subject->grade->grade_number,
                ]
                : null,

            'total_lessons' => $subjectTotal,
            'started_lessons' => $subjectStarted,
            'completed_lessons' =>
                $subjectCompleted,
            'percentage' => $subjectPercentage,
            'units' => $units->values(),
        ];
    });

    $overallPercentage =
        $totalLessons > 0
            ? (int) round(
                ($completedLessons /
                    $totalLessons) * 100
            )
            : 0;

    return response()->json([
        'summary' => [
            'subjects' => $path->count(),
            'total_lessons' => $totalLessons,
            'started_lessons' => $startedLessons,
            'completed_lessons' => $completedLessons,
            'percentage' => $overallPercentage,
        ],

        'subjects' => $path->values(),
    ]);
}
}