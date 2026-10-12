<?php

namespace App\Http\Controllers;

use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    public function index()
    {
        return Subject::with('grade')
            ->orderBy('display_order')
            ->get();
    }

    public function show($id)
    {
        return Subject::with('grade')->findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'grade_id' => 'required|exists:grades,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:50',
            'display_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $subject = Subject::create($validated);

        return response()->json($subject, 201);
    }

    public function update(Request $request, $id)
    {
        $subject = Subject::findOrFail($id);

        $validated = $request->validate([
            'grade_id' => 'required|exists:grades,id',
            'name' => 'required|string|max:255',
            'code' => 'nullable|string|max:50',
            'icon' => 'nullable|string|max:255',
            'color' => 'nullable|string|max:50',
            'display_order' => 'integer',
            'is_active' => 'boolean',
        ]);

        $subject->update($validated);

        return response()->json($subject);
    }

    public function destroy($id)
    {
        $subject = Subject::findOrFail($id);

        $subject->delete();

        return response()->json([
            'message' => 'Subject deleted successfully.'
        ]);
    }
}
