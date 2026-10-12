<?php

namespace App\Http\Controllers;

use App\Models\Grade;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    public function index()
    {
        return Grade::with('board')
            ->orderBy('grade_number')
            ->get();
    }

    public function show($id)
    {
        return Grade::with('board')->findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'board_id' => 'required|exists:boards,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'grade_number' => 'required|integer|min:1|max:12',
            'is_active' => 'boolean',
        ]);

        $grade = Grade::create($validated);

        return response()->json($grade, 201);
    }

    public function update(Request $request, $id)
    {
        $grade = Grade::findOrFail($id);

        $validated = $request->validate([
            'board_id' => 'required|exists:boards,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'grade_number' => 'required|integer|min:1|max:12',
            'is_active' => 'boolean',
        ]);

        $grade->update($validated);

        return response()->json($grade);
    }

    public function destroy($id)
    {
        $grade = Grade::findOrFail($id);
        $grade->delete();

        return response()->json([
            'message' => 'Grade deleted successfully.'
        ]);
    }
}
