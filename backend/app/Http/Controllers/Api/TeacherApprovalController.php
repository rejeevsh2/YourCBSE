<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class TeacherApprovalController extends Controller
{
    public function submitLesson(
        Request $request,
        int $id
    ) {
        $lesson = Lesson::query()
            ->where(
                'created_by',
                $request->user()->id
            )
            ->findOrFail($id);

        if ($lesson->is_published) {
            throw ValidationException::withMessages([
                'lesson' =>
                    'Published lessons do not need approval.',
            ]);
        }

        $pending = DB::table('approval_requests')
            ->where(
                'approvable_type',
                'lesson'
            )
            ->where(
                'approvable_id',
                $lesson->id
            )
            ->where(
                'status',
                'pending'
            )
            ->exists();

        if ($pending) {
            throw ValidationException::withMessages([
                'lesson' =>
                    'This lesson is already waiting for approval.',
            ]);
        }

        $id = DB::table('approval_requests')
            ->insertGetId([
                'approvable_type' =>
                    'lesson',

                'approvable_id' =>
                    $lesson->id,

                'submitted_by' =>
                    $request->user()->id,

                'status' =>
                    'pending',

                'note' =>
                    null,

                'reviewed_by' =>
                    null,

                'submitted_at' =>
                    now(),

                'reviewed_at' =>
                    null,

                'created_at' =>
                    now(),

                'updated_at' =>
                    now(),
            ]);

        return response()->json([
            'message' =>
                'Lesson submitted for approval.',

            'approval_id' =>
                $id,
        ], 201);
    }
}