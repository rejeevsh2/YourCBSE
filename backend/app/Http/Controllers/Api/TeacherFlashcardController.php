<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FlashcardDeck;
use App\Models\Lesson;
use Illuminate\Http\Request;

class TeacherFlashcardController extends Controller
{
    public function index(Request $request)
    {
        $decks = FlashcardDeck::where(
            'created_by',
            $request->user()->id
        )
            ->with(['lesson', 'cards'])
            ->withCount('cards')
            ->orderBy('display_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'decks' => $decks,
        ]);
    }

    public function show(Request $request, int $id)
    {
        $deck = $this->ownedDeck(
            $request,
            $id
        );

        return response()->json([
            'deck' => $this->freshDeck($deck),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'display_order' => 'nullable|integer|min:1|max:65535',
            'is_active' => 'nullable|boolean',
        ]);

        $lesson = $this->ownedLesson(
            $request,
            (int) $data['lesson_id']
        );

        abort_if(
            $lesson->is_published,
            409,
            'Ask an administrator to unpublish this lesson before adding flashcards.'
        );

        $deck = FlashcardDeck::create([
            'lesson_id' => $lesson->id,
            'created_by' => $request->user()->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'display_order' => $data['display_order'] ?? 1,
            'is_published' => false,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return response()->json([
            'deck' => $this->freshDeck($deck),
        ], 201);
    }

    public function update(
        Request $request,
        int $id
    ) {
        $deck = $this->ownedDeck(
            $request,
            $id
        );

        $this->ensureEditable($deck);

        $data = $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'display_order' => 'nullable|integer|min:1|max:65535',
            'is_active' => 'nullable|boolean',
        ]);

        $lesson = $this->ownedLesson(
            $request,
            (int) $data['lesson_id']
        );

        abort_if(
            $lesson->is_published,
            409,
            'Ask an administrator to unpublish this lesson before moving flashcards to it.'
        );

        $deck->update([
            'lesson_id' => $lesson->id,
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'display_order' => $data['display_order']
                ?? $deck->display_order,
            'is_active' => $data['is_active']
                ?? $deck->is_active,
        ]);

        return response()->json([
            'deck' => $this->freshDeck($deck),
        ]);
    }

    public function destroy(
        Request $request,
        int $id
    ) {
        $deck = $this->ownedDeck(
            $request,
            $id
        );

        $this->ensureEditable($deck);

        $deck->delete();

        return response()->json([
            'message' => 'Flashcard deck deleted.',
        ]);
    }

    public function storeCard(
        Request $request,
        int $deckId
    ) {
        $deck = $this->ownedDeck(
            $request,
            $deckId
        );

        $this->ensureEditable($deck);

        $data = $request->validate([
            'front' => 'required|string|max:10000',
            'back' => 'required|string|max:10000',
            'display_order' => 'nullable|integer|min:1|max:65535',
            'is_active' => 'nullable|boolean',
        ]);

        $nextOrder =
            ((int) $deck
                ->cards()
                ->max('display_order')) + 1;

        $deck->cards()->create([
            'front' => $data['front'],
            'back' => $data['back'],
            'display_order' => $data['display_order']
                ?? $nextOrder,
            'is_active' => $data['is_active']
                ?? true,
        ]);

        return response()->json([
            'deck' => $this->freshDeck($deck),
        ], 201);
    }

    public function updateCard(
        Request $request,
        int $deckId,
        int $cardId
    ) {
        $deck = $this->ownedDeck(
            $request,
            $deckId
        );

        $this->ensureEditable($deck);

        $card = $deck
            ->cards()
            ->whereKey($cardId)
            ->firstOrFail();

        $data = $request->validate([
            'front' => 'required|string|max:10000',
            'back' => 'required|string|max:10000',
            'display_order' => 'nullable|integer|min:1|max:65535',
            'is_active' => 'nullable|boolean',
        ]);

        $card->update([
            'front' => $data['front'],
            'back' => $data['back'],
            'display_order' => $data['display_order']
                ?? $card->display_order,
            'is_active' => $data['is_active']
                ?? $card->is_active,
        ]);

        return response()->json([
            'deck' => $this->freshDeck($deck),
        ]);
    }

    public function destroyCard(
        Request $request,
        int $deckId,
        int $cardId
    ) {
        $deck = $this->ownedDeck(
            $request,
            $deckId
        );

        $this->ensureEditable($deck);

        $card = $deck
            ->cards()
            ->whereKey($cardId)
            ->firstOrFail();

        $card->delete();

        return response()->json([
            'deck' => $this->freshDeck($deck),
        ]);
    }

    private function ownedDeck(
        Request $request,
        int $id
    ): FlashcardDeck {
        return FlashcardDeck::where(
            'created_by',
            $request->user()->id
        )->findOrFail($id);
    }

    private function ownedLesson(
        Request $request,
        int $id
    ): Lesson {
        return Lesson::where(
            'created_by',
            $request->user()->id
        )->findOrFail($id);
    }

    private function ensureEditable(
        FlashcardDeck $deck
    ): void {
        abort_if(
            $deck->is_published,
            409,
            'Published flashcard decks must be unpublished by an administrator before editing.'
        );

        $deck->loadMissing('lesson');

        abort_if(
            $deck->lesson?->is_published,
            409,
            'Published lessons must be unpublished by an administrator before editing flashcards.'
        );
    }

    private function freshDeck(
        FlashcardDeck $deck
    ): FlashcardDeck {
        return $deck
            ->fresh()
            ->load(['lesson', 'cards'])
            ->loadCount('cards');
    }
}