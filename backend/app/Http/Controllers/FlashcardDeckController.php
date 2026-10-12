<?php

namespace App\Http\Controllers;

use App\Models\Flashcard;
use App\Models\FlashcardDeck;
use Illuminate\Http\Request;

class FlashcardDeckController extends Controller
{
    public function index()
    {
        return FlashcardDeck::with('lesson')
            ->withCount('cards')
            ->orderBy('display_order')
            ->orderBy('id')
            ->get();
    }

    public function show($id)
    {
        return FlashcardDeck::with([
            'lesson',
            'creator',
            'cards',
        ])->findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'display_order' => 'nullable|integer|min:1|max:65535',
            'is_published' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $deck = FlashcardDeck::create([
            'lesson_id' => $validated['lesson_id'],
            'created_by' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'display_order' => $validated['display_order'] ?? 1,
            'is_published' => $validated['is_published'] ?? false,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json(
            $deck->load('lesson')->loadCount('cards'),
            201
        );
    }

    public function update(Request $request, $id)
    {
        $deck = FlashcardDeck::findOrFail($id);

        $validated = $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:5000',
            'display_order' => 'nullable|integer|min:1|max:65535',
            'is_published' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',
        ]);

        $deck->update([
            'lesson_id' => $validated['lesson_id'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'display_order' => $validated['display_order']
                ?? $deck->display_order,
            'is_published' => $validated['is_published']
                ?? $deck->is_published,
            'is_active' => $validated['is_active']
                ?? $deck->is_active,
        ]);

        return response()->json(
            $deck->fresh()
                ->load('lesson')
                ->loadCount('cards')
        );
    }

    public function destroy($id)
    {
        $deck = FlashcardDeck::findOrFail($id);

        $deck->delete();

        return response()->json([
            'message' => 'Flashcard deck deleted successfully.',
        ]);
    }

    public function storeCard(Request $request, $deckId)
    {
        $deck = FlashcardDeck::findOrFail($deckId);

        $validated = $request->validate([
            'front' => 'required|string|max:10000',
            'back' => 'required|string|max:10000',
            'display_order' => 'nullable|integer|min:1|max:65535',
            'is_active' => 'nullable|boolean',
        ]);

        $nextOrder = ((int) $deck->cards()->max('display_order')) + 1;

        $card = $deck->cards()->create([
            'front' => $validated['front'],
            'back' => $validated['back'],
            'display_order' => $validated['display_order'] ?? $nextOrder,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json($card, 201);
    }

    public function updateCard(Request $request, $deckId, $cardId)
    {
        $deck = FlashcardDeck::findOrFail($deckId);

        $card = $deck->cards()
            ->whereKey($cardId)
            ->firstOrFail();

        $validated = $request->validate([
            'front' => 'required|string|max:10000',
            'back' => 'required|string|max:10000',
            'display_order' => 'nullable|integer|min:1|max:65535',
            'is_active' => 'nullable|boolean',
        ]);

        $card->update([
            'front' => $validated['front'],
            'back' => $validated['back'],
            'display_order' => $validated['display_order']
                ?? $card->display_order,
            'is_active' => $validated['is_active']
                ?? $card->is_active,
        ]);

        return response()->json($card->fresh());
    }

    public function destroyCard($deckId, $cardId)
    {
        $deck = FlashcardDeck::findOrFail($deckId);

        $card = $deck->cards()
            ->whereKey($cardId)
            ->firstOrFail();

        $card->delete();

        return response()->json([
            'message' => 'Flashcard deleted successfully.',
        ]);
    }
}
