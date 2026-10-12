<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bookmark;
use App\Models\Lesson;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    /**
     * Return all bookmarks for the logged-in student.
     */
    public function index(Request $request): JsonResponse
    {
        $bookmarks = Bookmark::query()
            ->whereHas('lesson', fn ($q) => $q->published())
            ->where('user_id', $request->user()->id)
            ->with([
                'lesson.chapter.unit.subject',
            ])
            ->latest()
            ->get();

        return response()->json([
            'bookmarks' => $bookmarks,
            'count' => $bookmarks->count(),
        ]);
    }

    /**
     * Check whether one lesson is bookmarked.
     */
    public function status(
        Request $request,
        Lesson $lesson
    ): JsonResponse {
        abort_unless(Lesson::published()->whereKey($lesson->id)->exists(), 404);
        $bookmark = Bookmark::query()
            ->where('user_id', $request->user()->id)
            ->where('lesson_id', $lesson->id)
            ->first();

        return response()->json([
            'bookmarked' => $bookmark !== null,
            'bookmarkId' => $bookmark?->id,
        ]);
    }

    /**
     * Bookmark a lesson.
     */
    public function store(
        Request $request,
        Lesson $lesson
    ): JsonResponse {
        abort_unless(Lesson::published()->whereKey($lesson->id)->exists(), 404);
        $bookmark = Bookmark::firstOrCreate([
            'user_id' => $request->user()->id,
            'lesson_id' => $lesson->id,
        ]);

        $bookmark->load(
            'lesson.chapter.unit.subject'
        );

        return response()->json([
            'message' => 'Lesson bookmarked successfully.',
            'bookmark' => $bookmark,
        ], $bookmark->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * Remove a lesson bookmark.
     */
    public function destroy(
        Request $request,
        Lesson $lesson
    ): JsonResponse {
        abort_unless(Lesson::published()->whereKey($lesson->id)->exists(), 404);
        $deleted = Bookmark::query()
            ->where('user_id', $request->user()->id)
            ->where('lesson_id', $lesson->id)
            ->delete();

        return response()->json([
            'message' => $deleted
                ? 'Bookmark removed successfully.'
                : 'Bookmark was not found.',
            'bookmarked' => false,
        ]);
    }
}