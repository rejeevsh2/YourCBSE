<?php

namespace App\Http\Controllers;

use App\Models\Unit;
use Illuminate\Http\Request;

class UnitController extends Controller
{
    /**
     * Display all units.
     */
    public function index()
    {
        return Unit::with('subject')
            ->orderBy('display_order')
            ->get();
    }

    /**
     * Display one unit.
     */
    public function show($id)
    {
        return Unit::with('subject')->findOrFail($id);
    }

    /**
     * Create a new unit.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject_id'   => 'required|exists:subjects,id',
            'title'        => 'required|string|max:255',
            'code'         => 'nullable|string|max:255',
            'unit_number'  => 'required|integer|min:1|max:255',
            'description'  => 'nullable|string',
            'display_order'=> 'nullable|integer|min:1|max:255',
            'is_active'    => 'nullable|boolean',
        ]);

        $unit = Unit::create($validated);

        return response()->json($unit, 201);
    }

    /**
     * Update an existing unit.
     */
    public function update(Request $request, $id)
    {
        $unit = Unit::findOrFail($id);

        $validated = $request->validate([
            'subject_id'   => 'required|exists:subjects,id',
            'title'        => 'required|string|max:255',
            'code'         => 'nullable|string|max:255',
            'unit_number'  => 'required|integer|min:1|max:255',
            'description'  => 'nullable|string',
            'display_order'=> 'nullable|integer|min:1|max:255',
            'is_active'    => 'nullable|boolean',
        ]);

        $unit->update($validated);

        return response()->json($unit);
    }

    /**
     * Delete a unit.
     */
    public function destroy($id)
    {
        $unit = Unit::findOrFail($id);

        $unit->delete();

        return response()->json([
            'message' => 'Unit deleted successfully.'
        ]);
    }
}
