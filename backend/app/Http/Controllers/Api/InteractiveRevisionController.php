<?php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Lesson, RevisionItem, RevisionReview, RevisionSession};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class InteractiveRevisionController extends Controller
{
    private function items(Request $request) {
        return RevisionItem::where('user_id', $request->user()->id)->where('is_active', true)
            ->whereHas('lesson', fn ($q) => $q->published()->accessibleTo($request->user()));
    }

    public function index(Request $request) {
        $reviews = RevisionReview::where('user_id', $request->user()->id);
        $count = (clone $reviews)->count();
        return response()->json([
            'due' => $this->items($request)->where(fn ($q) => $q->whereNull('next_review_at')->orWhere('next_review_at', '<=', now()))->count(),
            'recall_accuracy' => $count ? round((clone $reviews)->whereIn('rating', ['good', 'easy'])->count() * 100 / $count) : 0,
            'sessions' => RevisionSession::where('user_id', $request->user()->id)->latest()->limit(20)->get(),
        ]);
    }

    public function start(Request $request) {
        return DB::transaction(function () use ($request) {
            // Serialise starts for the same student, including the first session.
            $request->user()->newQuery()->whereKey($request->user()->id)->lockForUpdate()->first();
            $active = RevisionSession::where('user_id', $request->user()->id)->where('status', 'active')->first();
            if ($active) return $this->show($request, $active->id);
            $ids = $this->items($request)->where(fn ($q) => $q->whereNull('next_review_at')->orWhere('next_review_at', '<=', now()))
                ->orderBy('next_review_at')->limit(20)->pluck('id')->all();
            abort_if(empty($ids), 422, 'No cards are due. Add a revision card from a lesson first.');
            $session = RevisionSession::create([
                'user_id' => $request->user()->id, 'mode' => 'flashcards', 'difficulty' => 'adaptive',
                'total_cards' => count($ids), 'card_ids' => $ids, 'reviewed_ids' => [],
                'status' => 'active', 'started_at' => now(),
            ]);
            return $this->show($request, $session->id);
        });
    }

    public function show(Request $request, int $sessionId) {
        $session = RevisionSession::where('user_id', $request->user()->id)->findOrFail($sessionId);
        return response()->json([
            'session' => $session,
            'cards' => $this->items($request)->whereIn('id', $session->card_ids ?? [])->get(['id', 'title', 'content', 'lesson_id']),
        ]);
    }

    public function review(Request $request, int $sessionId) {
        $data = $request->validate(['card_id' => 'required|integer', 'rating' => ['required', Rule::in(['again', 'hard', 'good', 'easy'])]]);
        return DB::transaction(function () use ($request, $sessionId, $data) {
            $session = RevisionSession::where('user_id', $request->user()->id)->lockForUpdate()->findOrFail($sessionId);
            abort_if($session->status !== 'active', 409, 'This session has finished.');
            abort_unless(in_array($data['card_id'], $session->card_ids ?? []), 422, 'Card is not in this session.');
            $reviewed = $session->reviewed_ids ?? [];
            if (in_array($data['card_id'], $reviewed)) return $this->show($request, $sessionId);
            $item = $this->items($request)->lockForUpdate()->findOrFail($data['card_id']);
            $before = $item->strength;
            $after = max(0, min(100, $before + ['again' => -20, 'hard' => 5, 'good' => 15, 'easy' => 25][$data['rating']]));
            $next = $data['rating'] === 'again' ? now()->addMinutes(10) : now()->addDays(['hard' => 1, 'good' => 3, 'easy' => 7][$data['rating']]);
            RevisionReview::create([
                'revision_item_id' => $item->id, 'user_id' => $request->user()->id, 'rating' => $data['rating'],
                'strength_before' => $before, 'strength_after' => $after, 'reviewed_at' => now(), 'next_review_at' => $next,
            ]);
            $item->update(['strength' => $after, 'review_count' => $item->review_count + 1, 'last_reviewed_at' => now(), 'next_review_at' => $next]);
            $reviewed[] = $item->id;
            $session->update([
                'reviewed_ids' => $reviewed, 'completed_cards' => count($reviewed),
                'score' => $session->score + (in_array($data['rating'], ['good', 'easy']) ? 1 : 0),
            ]);
            return $this->show($request, $sessionId);
        });
    }

    public function finish(Request $request, int $sessionId) {
        $session = RevisionSession::where('user_id', $request->user()->id)->findOrFail($sessionId);
        if ($session->status === 'active') $session->update(['status' => 'completed', 'finished_at' => now()]);
        return response()->json(['session' => $session]);
    }

    public function storeCard(Request $request, Lesson $lesson) {
        abort_unless(Lesson::published()->accessibleTo($request->user())->whereKey($lesson->id)->exists(), 404);
        $data = $request->validate(['title' => 'required|string|max:255', 'content' => 'required|string|max:10000']);
        $card = RevisionItem::create($data + ['user_id' => $request->user()->id, 'lesson_id' => $lesson->id, 'type' => 'flashcard']);
        return response()->json(['card' => $card], 201);
    }
}
