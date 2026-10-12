<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RevisionItem;
use App\Models\RevisionReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RevisionController extends Controller
{
    /**
     * Return the logged-in student's Revision Hub.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        /*
         * Active revision items.
         */
        $items = RevisionItem::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->whereHas('lesson', fn ($q) => $q->published())
            ->with([
                'lesson:id,title',
            ])
            ->orderByRaw('next_review_at IS NULL')
            ->orderBy('next_review_at')
            ->get();

        /*
         * Items currently due for revision.
         */
        $dueItems = $items
            ->filter(function (RevisionItem $item) {
                return $item->next_review_at === null || $item->next_review_at->lte(now());
            })
            ->values();

        /*
         * Number of revision reviews completed.
         */
        $totalReviews = RevisionReview::query()
            ->where('user_id', $user->id)
            ->count();

        /*
         * Successful recall:
         * "good" and "easy" count as successful.
         */
        $successfulReviews = RevisionReview::query()
            ->where('user_id', $user->id)
            ->whereIn('rating', ['good', 'easy'])
            ->count();

        $recallAccuracy = $totalReviews > 0
            ? round(($successfulReviews / $totalReviews) * 100)
            : 0;

        return response()->json([
            'revision_items' => $items,
            'due_items' => $dueItems,

            'stats' => [
                'cards_due_today' => $dueItems->count(),
                'revision_items' => $items->count(),
                'reviews_completed' => $totalReviews,
                'recall_accuracy' => $recallAccuracy,
            ],
        ]);
    }
}