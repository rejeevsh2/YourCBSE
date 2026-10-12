<?php

namespace App\Http\Controllers;

use App\Models\Chapter;
use Illuminate\Http\Request;

class ChapterController extends Controller
{
    /**
     * Display all chapters.
     */
    public function index()
    {
        return Chapter::with('unit')
            ->orderBy('display_order')
            ->get();
    }

    /**
     * Display one chapter.
     */
    public function show($id)
    {
        return Chapter::with('unit')->findOrFail($id);
    }

    /**
     * Create a new chapter.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'unit_id'         => 'required|exists:units,id',
            'title'           => 'required|string|max:255',
            'code'            => 'nullable|string|max:255',
            'chapter_number'  => 'required|integer|min:1|max:255',
            'description'     => 'nullable|string',
            'display_order'   => 'nullable|integer|min:1|max:255',
            'is_active'       => 'nullable|boolean',
        ]);

        $chapter = Chapter::create($validated);

        return response()->json($chapter, 201);
    }

    /**
     * Update an existing chapter.
     */
    public function update(Request $request, $id)
    {
        $chapter = Chapter::findOrFail($id);

        $validated = $request->validate([
            'unit_id'         => 'required|exists:units,id',
            'title'           => 'required|string|max:255',
            'code'            => 'nullable|string|max:255',
            'chapter_number'  => 'required|integer|min:1|max:255',
            'description'     => 'nullable|string',
            'display_order'   => 'nullable|integer|min:1|max:255',
            'is_active'       => 'nullable|boolean',
        ]);

        $chapter->update($validated);

        return response()->json($chapter);
    }

    /**
     * Delete a chapter.
     */
    public function destroy($id)
    {
        $chapter = Chapter::findOrFail($id);

        $chapter->delete();

        return response()->json([
            'message' => 'Chapter deleted successfully.'
        ]);
    }
}
