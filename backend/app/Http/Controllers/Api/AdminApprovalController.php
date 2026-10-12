<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AdminApprovalController extends Controller
{
    public function index()
    {
        $rows = DB::table('approval_requests as ar')
            ->leftJoin(
                'users as submitter',
                'submitter.id',
                '=',
                'ar.submitted_by'
            )
            ->leftJoin(
                'users as reviewer',
                'reviewer.id',
                '=',
                'ar.reviewed_by'
            )
            ->select([
                'ar.id',
                'ar.approvable_type',
                'ar.approvable_id',
                'ar.status',
                'ar.note',
                'ar.submitted_at',
                'ar.reviewed_at',
                'submitter.name as submitted_by_name',
                'submitter.email as submitted_by_email',
                'reviewer.name as reviewed_by_name',
            ])
            ->orderByRaw(
                "CASE WHEN ar.status = 'pending' THEN 0 ELSE 1 END"
            )
            ->orderByDesc('ar.submitted_at')
            ->get()
            ->map(function ($row) {
                $content = $this->contentDetails(
                    $row->approvable_type,
                    (int) $row->approvable_id
                );

                return [
                    'id' => (int) $row->id,
                    'approvable_type' => $row->approvable_type,
                    'approvable_id' => (int) $row->approvable_id,
                    'title' => $content['title'],
                    'kind' => $content['kind'],
                    'published' => $content['published'],
                    'status' => $row->status,
                    'note' => $row->note,
                    'submitted_at' => $row->submitted_at,
                    'reviewed_at' => $row->reviewed_at,
                    'submitted_by' => $row->submitted_by_name,
                    'submitted_by_email' => $row->submitted_by_email,
                    'reviewed_by' => $row->reviewed_by_name,
                ];
            })
            ->values();

        return response()->json([
            'approvals' => $rows,

            'stats' => [
                'pending' => DB::table('approval_requests')
                    ->where('status', 'pending')
                    ->count(),

                'approved' => DB::table('approval_requests')
                    ->where('status', 'approved')
                    ->count(),

                'needs_revision' => DB::table('approval_requests')
                    ->where('status', 'needs_revision')
                    ->count(),

                'rejected' => DB::table('approval_requests')
                    ->where('status', 'rejected')
                    ->count(),
            ],
        ]);
    }

    public function review(
        Request $request,
        int $id
    ) {
        $approval = DB::table('approval_requests')
            ->where('id', $id)
            ->first();

        abort_unless(
            $approval,
            404,
            'Approval request not found.'
        );

        if ($approval->status !== 'pending') {
            throw ValidationException::withMessages([
                'status' =>
                    'This approval request has already been reviewed.',
            ]);
        }

        $data = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    'approved',
                    'needs_revision',
                    'rejected',
                ]),
            ],

            'note' =>
                'nullable|string|max:5000',
        ]);

        if (
            in_array(
                $data['status'],
                [
                    'needs_revision',
                    'rejected',
                ],
                true
            ) &&
            empty(trim($data['note'] ?? ''))
        ) {
            throw ValidationException::withMessages([
                'note' =>
                    'Please enter a review note.',
            ]);
        }

        DB::transaction(
            function () use (
                $approval,
                $data,
                $request
            ) {
                $this->applyReviewToContent(
                    $approval->approvable_type,
                    (int) $approval->approvable_id,
                    $data['status']
                );

                DB::table('approval_requests')
                    ->where(
                        'id',
                        $approval->id
                    )
                    ->update([
                        'status' =>
                            $data['status'],

                        'note' =>
                            $data['note']
                                ?? null,

                        'reviewed_by' =>
                            $request->user()->id,

                        'reviewed_at' =>
                            now(),

                        'updated_at' =>
                            now(),
                    ]);
            }
        );

        return response()->json([
            'message' =>
                'Approval request reviewed successfully.',
        ]);
    }

    private function contentDetails(
        string $type,
        int $id
    ): array {
        if ($type === 'lesson') {
            $lesson = Lesson::find($id);

            return [
                'title' =>
                    $lesson?->title ??
                    'Deleted lesson',

                'kind' =>
                    'Lesson',

                'published' =>
                    (bool) (
                        $lesson?->is_published
                        ?? false
                    ),
            ];
        }

        return [
            'title' =>
                'Unknown content',

            'kind' =>
                ucfirst(
                    str_replace(
                        '_',
                        ' ',
                        $type
                    )
                ),

            'published' =>
                false,
        ];
    }

    private function applyReviewToContent(
        string $type,
        int $id,
        string $status
    ): void {
        if ($type === 'lesson') {
            $lesson = Lesson::findOrFail($id);

            $lesson->update([
                'is_published' =>
                    $status === 'approved',
            ]);

            return;
        }

        throw ValidationException::withMessages([
            'approval' =>
                'This content type is not yet connected to the approval workflow.',
        ]);
    }
}