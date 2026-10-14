<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\Subject;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccountApprovalAccessTest extends TestCase
{
    use RefreshDatabase;

    private function curriculum(): array
    {
        $board = Board::create([
            'name' => 'CBSE',
            'code' => 'CBSE',
        ]);

        $grade7 = Grade::create([
            'board_id' => $board->id,
            'name' => 'Class 7',
            'grade_number' => 7,
        ]);

        $grade9 = Grade::create([
            'board_id' => $board->id,
            'name' => 'Class 9',
            'grade_number' => 9,
        ]);

        Subject::create([
            'grade_id' => $grade7->id,
            'name' => 'Science',
            'code' => 'SCI7',
        ]);

        Subject::create([
            'grade_id' => $grade9->id,
            'name' => 'Science',
            'code' => 'SCI9',
        ]);

        return [
            $board,
            $grade7,
            $grade9,
        ];
    }

    private function admin(): User
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'approval_status' => 'approved',
            'approved_at' => now(),
        ]);

        $adminRoleId = DB::table(
            'admin_roles'
        )
            ->where(
                'slug',
                'admin'
            )
            ->value('id');

        DB::table(
            'admin_role_user'
        )->insert([
            'role_id' => $adminRoleId,
            'user_id' => $admin->id,
        ]);

        return $admin;
    }

    public function test_parent_and_admin_accounts_are_not_blocked_by_approval_gate(): void
    {
        foreach (
            ['parent', 'admin']
            as $role
        ) {
            $user = User::create([
                'name' =>
                    ucfirst($role) . ' User',
                'email' =>
                    $role . '-approval@example.test',
                'role' => $role,
                'password' =>
                    'SecurePassword123!',
            ])->fresh();

            $this->assertSame(
                'approved',
                $user->approval_status
            );

            $this->postJson(
                '/api/login',
                [
                    'email' =>
                        $user->email,
                    'password' =>
                        'SecurePassword123!',
                ]
            )
                ->assertOk()
                ->assertJsonPath(
                    'user.role',
                    $role
                );

            $user->tokens()->delete();
        }
    }

    public function test_rejection_revokes_tokens_and_clears_class_assignments(): void
    {
        [, $grade7, $grade9] =
            $this->curriculum();

        $teacher =
            User::factory()->create([
                'role' => 'teacher',
                'approval_status' =>
                    'pending',
                'approved_at' => null,
            ]);

        $teacher->grades()->sync([
            $grade7->id,
            $grade9->id,
        ]);

        $teacher->createToken(
            'pre-rejection'
        );

        $admin = $this->admin();

        Sanctum::actingAs($admin);

        $this->patchJson(
            '/api/admin/users/' .
            $teacher->id .
            '/approval',
            [
                'status' =>
                    'rejected',
                'grade_ids' => [],
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'user.approval_status',
                'rejected'
            )
            ->assertJsonCount(
                0,
                'user.grades'
            );

        $teacher->refresh();

        $this->assertSame(
            'rejected',
            $teacher->approval_status
        );

        $this->assertSame(
            $admin->id,
            (int) $teacher->approved_by
        );

        $this->assertNotNull(
            $teacher->approved_at
        );

        $this->assertDatabaseMissing(
            'grade_user',
            [
                'user_id' =>
                    $teacher->id,
            ]
        );

        $this->assertDatabaseMissing(
            'personal_access_tokens',
            [
                'tokenable_id' =>
                    $teacher->id,
            ]
        );
    }

    public function test_teacher_with_multiple_classes_cannot_be_changed_to_student_without_single_class_assignment(): void
    {
        [, $grade7, $grade9] =
            $this->curriculum();

        $teacher =
            User::factory()->create([
                'name' =>
                    'Multi Class Teacher',
                'email' =>
                    'multi-class@example.test',
                'role' => 'teacher',
                'approval_status' =>
                    'approved',
            ]);

        $teacher->grades()->sync([
            $grade7->id,
            $grade9->id,
        ]);

        Sanctum::actingAs(
            $this->admin()
        );

        $this->patchJson(
            '/api/admin/users/' .
            $teacher->id,
            [
                'name' =>
                    $teacher->name,
                'email' =>
                    $teacher->email,
                'role' =>
                    'student',
                'password' => null,
            ]
        )->assertUnprocessable();

        $this->assertSame(
            'teacher',
            $teacher
                ->fresh()
                ->role
        );

        $this->assertCount(
            2,
            $teacher
                ->fresh()
                ->grades
        );
    }

    public function test_new_student_and_teacher_models_default_to_pending(): void
    {
        foreach (['student', 'teacher'] as $role) {
            $user = User::create([
                'name' => ucfirst($role) . ' Default',
                'email' =>
                    $role . '-default@example.test',
                'role' => $role,
                'password' =>
                    'SecurePassword123!',
            ])->fresh();

            $this->assertSame(
                'pending',
                $user->approval_status
            );

            $this->assertNull(
                $user->approved_at
            );

            $this->assertNull(
                $user->approved_by
            );
        }
    }

    public function test_teacher_cannot_submit_owned_lesson_from_unassigned_class(): void
    {
        [, $grade7, $grade9] =
            $this->curriculum();

        $subject = Subject::query()
            ->where(
                'grade_id',
                $grade7->id
            )
            ->firstOrFail();

        $unit = Unit::create([
            'subject_id' =>
                $subject->id,
            'title' => 'Motion',
            'unit_number' => 1,
        ]);

        $chapter = Chapter::create([
            'unit_id' => $unit->id,
            'title' => 'Speed',
            'chapter_number' => 1,
        ]);

        $teacher =
            User::factory()->create([
                'role' => 'teacher',
                'approval_status' =>
                    'approved',
            ]);

        $teacher->grades()->sync([
            $grade9->id,
        ]);

        $lesson = Lesson::create([
            'created_by' =>
                $teacher->id,
            'chapter_id' =>
                $chapter->id,
            'title' =>
                'Legacy Grade 7 Draft',
            'slug' =>
                'legacy-grade-7-draft',
            'lesson_number' => 1,
            'is_published' => false,
            'is_active' => true,
        ]);

        Sanctum::actingAs($teacher);

        $this->postJson(
            '/api/teacher/lessons/' .
            $lesson->id .
            '/submit-for-approval'
        )->assertNotFound();

        $this->assertDatabaseMissing(
            'approval_requests',
            [
                'approvable_type' =>
                    'lesson',
                'approvable_id' =>
                    $lesson->id,
            ]
        );
    }

    public function test_student_registration_is_pending_and_cannot_login_before_approval(): void
    {
        $response = $this->postJson(
            '/api/register',
            [
                'name' =>
                    'Pending Student',
                'email' =>
                    'pending-student@example.test',
                'password' =>
                    'SecurePassword123!',
                'password_confirmation' =>
                    'SecurePassword123!',
                'role' =>
                    'student',
            ]
        )
            ->assertCreated()
            ->assertJsonPath(
                'user.role',
                'student'
            )
            ->assertJsonPath(
                'user.approval_status',
                'pending'
            );

        $userId =
            $response->json('user.id');

        $this->assertDatabaseHas(
            'users',
            [
                'id' => $userId,
                'approval_status' =>
                    'pending',
                'approved_at' => null,
                'approved_by' => null,
            ]
        );

        $this->assertDatabaseMissing(
            'grade_user',
            [
                'user_id' => $userId,
            ]
        );

        $this->postJson(
            '/api/login',
            [
                'email' =>
                    'pending-student@example.test',
                'password' =>
                    'SecurePassword123!',
            ]
        )
            ->assertForbidden()
            ->assertJsonPath(
                'code',
                'account-pending-approval'
            );

        $this->assertDatabaseMissing(
            'personal_access_tokens',
            [
                'tokenable_id' =>
                    $userId,
            ]
        );
    }

    public function test_teacher_registration_stores_requested_classes_but_remains_pending(): void
    {
        [, $grade7, $grade9] =
            $this->curriculum();

        $response = $this->postJson(
            '/api/register',
            [
                'name' =>
                    'Pending Teacher',
                'email' =>
                    'pending-teacher@example.test',
                'password' =>
                    'SecurePassword123!',
                'password_confirmation' =>
                    'SecurePassword123!',
                'role' =>
                    'teacher',
                'grade_ids' => [
                    $grade7->id,
                    $grade9->id,
                ],
            ]
        )
            ->assertCreated()
            ->assertJsonPath(
                'user.role',
                'teacher'
            )
            ->assertJsonPath(
                'user.approval_status',
                'pending'
            )
            ->assertJsonCount(
                2,
                'user.grades'
            );

        $userId =
            $response->json('user.id');

        $this->assertDatabaseHas(
            'grade_user',
            [
                'user_id' => $userId,
                'grade_id' => $grade7->id,
            ]
        );

        $this->assertDatabaseHas(
            'grade_user',
            [
                'user_id' => $userId,
                'grade_id' => $grade9->id,
            ]
        );

        $this->postJson(
            '/api/login',
            [
                'email' =>
                    'pending-teacher@example.test',
                'password' =>
                    'SecurePassword123!',
            ]
        )
            ->assertForbidden()
            ->assertJsonPath(
                'code',
                'account-pending-approval'
            );
    }

    public function test_admin_must_assign_exactly_one_class_to_student_before_approval(): void
    {
        [, $grade7, $grade9] =
            $this->curriculum();

        $student =
            User::factory()->create([
                'role' => 'student',
                'approval_status' =>
                    'pending',
                'approved_at' => null,
            ]);

        $admin = $this->admin();

        Sanctum::actingAs($admin);

        $this->patchJson(
            '/api/admin/users/' .
            $student->id .
            '/approval',
            [
                'status' =>
                    'approved',
                'grade_ids' => [
                    $grade7->id,
                    $grade9->id,
                ],
            ]
        )->assertUnprocessable();

        $this->patchJson(
            '/api/admin/users/' .
            $student->id .
            '/approval',
            [
                'status' =>
                    'approved',
                'grade_ids' => [
                    $grade7->id,
                ],
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'user.approval_status',
                'approved'
            )
            ->assertJsonCount(
                1,
                'user.grades'
            );

        $student->refresh();

        $this->assertSame(
            'approved',
            $student->approval_status
        );

        $this->assertSame(
            $admin->id,
            (int) $student->approved_by
        );

        $this->assertTrue(
            $student->grades()
                ->whereKey(
                    $grade7->id
                )
                ->exists()
        );

        $this->assertFalse(
            $student->grades()
                ->whereKey(
                    $grade9->id
                )
                ->exists()
        );
    }

    public function test_admin_can_adjust_teacher_classes_during_approval(): void
    {
        [, $grade7, $grade9] =
            $this->curriculum();

        $teacher =
            User::factory()->create([
                'role' => 'teacher',
                'approval_status' =>
                    'pending',
                'approved_at' => null,
            ]);

        $teacher->grades()->sync([
            $grade7->id,
            $grade9->id,
        ]);

        $admin = $this->admin();

        Sanctum::actingAs($admin);

        $this->patchJson(
            '/api/admin/users/' .
            $teacher->id .
            '/approval',
            [
                'status' =>
                    'approved',
                'grade_ids' => [
                    $grade9->id,
                ],
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'user.approval_status',
                'approved'
            )
            ->assertJsonCount(
                1,
                'user.grades'
            );

        $this->assertDatabaseMissing(
            'grade_user',
            [
                'user_id' =>
                    $teacher->id,
                'grade_id' =>
                    $grade7->id,
            ]
        );

        $this->assertDatabaseHas(
            'grade_user',
            [
                'user_id' =>
                    $teacher->id,
                'grade_id' =>
                    $grade9->id,
            ]
        );
    }

    public function test_assigned_class_access_is_enforced_for_students_and_teachers_but_not_admins(): void
    {
        [$board, $grade7, $grade9] =
            $this->curriculum();

        $student =
            User::factory()->create([
                'role' => 'student',
                'approval_status' =>
                    'approved',
            ]);

        $student->grades()->sync([
            $grade7->id,
        ]);

        Sanctum::actingAs($student);

        $this->getJson(
            '/api/public/grades/' .
            $grade7->id .
            '/subjects'
        )->assertOk();

        $this->getJson(
            '/api/public/grades/' .
            $grade9->id .
            '/subjects'
        )->assertNotFound();

        $teacher =
            User::factory()->create([
                'role' => 'teacher',
                'approval_status' =>
                    'approved',
            ]);

        $teacher->grades()->sync([
            $grade7->id,
            $grade9->id,
        ]);

        Sanctum::actingAs($teacher);

        $this->getJson(
            '/api/public/grades/' .
            $grade7->id .
            '/subjects'
        )->assertOk();

        $this->getJson(
            '/api/public/grades/' .
            $grade9->id .
            '/subjects'
        )->assertOk();

        $admin = $this->admin();

        Sanctum::actingAs($admin);

        $this->getJson(
            '/api/public/boards/' .
            $board->id .
            '/grades'
        )
            ->assertOk()
            ->assertJsonCount(2);
    }

    public function test_non_admin_cannot_approve_accounts(): void
    {
        [, $grade7] =
            $this->curriculum();

        $pending =
            User::factory()->create([
                'role' => 'student',
                'approval_status' =>
                    'pending',
            ]);

        $student =
            User::factory()->create([
                'role' => 'student',
                'approval_status' =>
                    'approved',
            ]);

        Sanctum::actingAs($student);

        $this->patchJson(
            '/api/admin/users/' .
            $pending->id .
            '/approval',
            [
                'status' =>
                    'approved',
                'grade_ids' => [
                    $grade7->id,
                ],
            ]
        )->assertForbidden();

        $this->assertSame(
            'pending',
            $pending
                ->fresh()
                ->approval_status
        );
    }
}
