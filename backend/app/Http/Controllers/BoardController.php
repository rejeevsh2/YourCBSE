<?php

namespace App\Http\Controllers;

use App\Models\Board;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    public function index()
    {
        return Board::orderBy('name')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:boards,code',
        ]);

        return Board::create($validated);
    }

    public function show(Board $board)
    {
        return $board;
    }

    public function update(Request $request, Board $board)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'code' => 'required|string|max:20|unique:boards,code,' . $board->id,
        ]);

        $board->update($validated);

        return $board;
    }

    public function destroy(Board $board)
    {
        $board->delete();

        return response()->json([
            'message' => 'Board deleted successfully.'
        ]);
    }
}
