<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class ParentAdminController extends Controller
{
    public function index()
    {
        $parents = User::query()
            ->where('role', 'parent')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'email',
                'mobile',
                'created_at',
            ]);

        $links = DB::table('parent_student as ps')
            ->join(
                'users as students',
                'students.id',
                '=',
                'ps.student_id'
            )
            ->select([
                'ps.id as link_id',
                'ps.parent_id',
                'ps.student_id',
                'ps.relationship',
                'ps.is_primary',
                'students.name as student_name',
                'students.email as student_email',
            ])
            ->orderBy('students.name')
            ->get()
            ->groupBy('parent_id');

        $parentRows = $parents
            ->map(function (User $parent) use ($links) {
                $children = $links
                    ->get($parent->id, collect())
                    ->map(fn ($link) => [
                        'link_id' =>
                            (int) $link->link_id,

                        'id' =>
                            (int) $link->student_id,

                        'name' =>
                            $link->student_name,

                        'email' =>
                            $link->student_email,

                        'relationship' =>
                            $link->relationship,

                        'is_primary' =>
                            (bool) $link->is_primary,
                    ])
                    ->values();

                return [
                    'id' => $parent->id,
                    'name' => $parent->name,
                    'email' => $parent->email,
                    'mobile' => $parent->mobile,
                    'created_at' => $parent->created_at,
                    'students' => $children,
                ];
            })
            ->values();

        $students = User::query()
            ->where('role', 'student')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'email',
            ]);

        $totalParents = $parents->count();

        $linkedStudents = DB::table('parent_student')
            ->distinct()
            ->count('student_id');

        $totalLinks = DB::table('parent_student')
            ->count();

        $unlinkedParents = User::query()
            ->where('role', 'parent')
            ->whereNotExists(function ($query) {
                $query
                    ->selectRaw('1')
                    ->from('parent_student')
                    ->whereColumn(
                        'parent_student.parent_id',
                        'users.id'
                    );
            })
            ->count();

        return response()->json([
            'parents' => $parentRows,
            'students' => $students,

            'stats' => [
                'parents' => $totalParents,
                'linked_students' => $linkedStudents,
                'relationships' => $totalLinks,
                'unlinked_parents' => $unlinkedParents,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' =>
                'required|string|max:255',

            'email' =>
                'required|email|max:255|unique:users,email',

            'mobile' =>
                'nullable|string|max:30',

            'password' =>
                'required|string|min:8|max:255',
        ]);

        $parent = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'mobile' => $data['mobile'] ?? null,
            'password' => $data['password'],
            'role' => 'parent',
        ]);

        $parent->forceFill([
            'approval_status' =>
                'approved',
            'approved_at' => now(),
            'approved_by' => null,
        ])->save();

        return response()->json([
            'message' =>
                'Parent account created successfully.',

            'parent' => [
                'id' => $parent->id,
                'name' => $parent->name,
                'email' => $parent->email,
                'mobile' => $parent->mobile,
            ],
        ], 201);
    }

    public function update(
        Request $request,
        int $id
    ) {
        $parent = User::query()
            ->where('role', 'parent')
            ->findOrFail($id);

        $data = $request->validate([
            'name' =>
                'required|string|max:255',

            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique(
                    'users',
                    'email'
                )->ignore($parent->id),
            ],

            'mobile' =>
                'nullable|string|max:30',

            'password' =>
                'nullable|string|min:8|max:255',
        ]);

        $update = [
            'name' => $data['name'],
            'email' => $data['email'],
            'mobile' => $data['mobile'] ?? null,
        ];

        if (!empty($data['password'])) {
            $update['password'] =
                $data['password'];
        }

        $parent->update($update);

        return response()->json([
            'message' =>
                'Parent account updated successfully.',

            'parent' => [
                'id' => $parent->id,
                'name' => $parent->name,
                'email' => $parent->email,
                'mobile' => $parent->mobile,
            ],
        ]);
    }

    public function destroy(int $id)
    {
        $parent = User::query()
            ->where('role', 'parent')
            ->findOrFail($id);

        $parent->delete();

        return response()->json([
            'message' =>
                'Parent account deleted successfully.',
        ]);
    }

    public function linkStudent(
        Request $request,
        int $parentId
    ) {
        $parent = User::query()
            ->where('role', 'parent')
            ->findOrFail($parentId);

        $data = $request->validate([
            'student_id' =>
                'required|integer|exists:users,id',

            'relationship' =>
                'nullable|string|max:50',

            'is_primary' =>
                'required|boolean',
        ]);

        $student = User::findOrFail(
            $data['student_id']
        );

        if ($student->role !== 'student') {
            throw ValidationException::withMessages([
                'student_id' =>
                    'The selected account is not a student.',
            ]);
        }

        DB::transaction(
            function () use (
                $parent,
                $student,
                $data
            ) {
                if ($data['is_primary']) {
                    DB::table('parent_student')
                        ->where(
                            'student_id',
                            $student->id
                        )
                        ->update([
                            'is_primary' => false,
                            'updated_at' => now(),
                        ]);
                }

                DB::table('parent_student')
                    ->updateOrInsert(
                        [
                            'parent_id' =>
                                $parent->id,

                            'student_id' =>
                                $student->id,
                        ],
                        [
                            'relationship' =>
                                $data['relationship']
                                    ?: null,

                            'is_primary' =>
                                $data['is_primary'],

                            'updated_at' => now(),
                            'created_at' => now(),
                        ]
                    );
            }
        );

        return response()->json([
            'message' =>
                'Student linked to parent successfully.',
        ]);
    }

    public function unlinkStudent(
        int $parentId,
        int $studentId
    ) {
        $parent = User::query()
            ->where('role', 'parent')
            ->findOrFail($parentId);

        $student = User::query()
            ->where('role', 'student')
            ->findOrFail($studentId);

        DB::table('parent_student')
            ->where(
                'parent_id',
                $parent->id
            )
            ->where(
                'student_id',
                $student->id
            )
            ->delete();

        return response()->json([
            'message' =>
                'Student unlinked successfully.',
        ]);
    }
}