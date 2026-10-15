<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\Grade;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LegacyClassAccessTest extends TestCase
{
    use RefreshDatabase;

    private function classes(): array
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

        return [$grade7, $grade9];
    }

    private function admin(): User
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'approval_status' => 'approved',
        ]);

        $roleId = DB::table('admin_roles')
            ->where('slug', 'admin')
            ->value('id');

        DB::table('admin_role_user')->insert([
            'role_id' => $roleId,
            'user_id' => $admin->id,
        ]);

        return $admin;
    }

    public function test_approved_legacy_student_retains_previous_access(): void
    {
        [$grade7, $grade9] = $this->classes();

        $student = User::factory()->create([
            'role' => 'student',
            'approval_status' => 'approved',
            'legacy_class_access' => true,
        ]);

        $this->assertTrue($student->hasLegacyClassAccess());

        $actual = Grade::query()
            ->accessibleTo($student)
            ->pluck('id')
            ->all();

        $this->assertEqualsCanonicalizing(
            [$grade7->id, $grade9->id],
            $actual
        );

        $this->assertSame(
            2,
            Subject::query()->accessibleTo($student)->count()
        );
    }

    public function test_approved_legacy_teacher_retains_previous_access(): void
    {
        $this->classes();

        $teacher = User::factory()->create([
            'role' => 'teacher',
            'approval_status' => 'approved',
            'legacy_class_access' => true,
        ]);

        $this->assertTrue($teacher->hasLegacyClassAccess());

        $this->assertSame(
            2,
            Grade::query()->accessibleTo($teacher)->count()
        );
    }

    public function test_new_pending_and_rejected_users_cannot_use_legacy_access(): void
    {
        $this->classes();

        foreach (['pending', 'rejected'] as $status) {
            $student = User::factory()->create([
                'role' => 'student',
                'approval_status' => $status,
                'legacy_class_access' => true,
            ]);

            $this->assertFalse(
                $student->hasLegacyClassAccess()
            );

            $this->assertSame(
                0,
                Grade::query()->accessibleTo($student)->count()
            );
        }

        $newStudent = User::factory()->create([
            'role' => 'student',
            'approval_status' => 'approved',
        ]);

        $this->assertFalse(
            $newStudent->hasLegacyClassAccess()
        );

        $this->assertSame(
            0,
            Grade::query()->accessibleTo($newStudent)->count()
        );
    }

    public function test_real_class_assignment_disables_legacy_access(): void
    {
        [$grade7, $grade9] = $this->classes();

        $student = User::factory()->create([
            'role' => 'student',
            'approval_status' => 'approved',
            'legacy_class_access' => true,
        ]);

        $this->assertTrue($student->hasLegacyClassAccess());

        Sanctum::actingAs($this->admin());

        $this->patchJson(
            '/api/admin/users/' . $student->id . '/approval',
            [
                'status' => 'approved',
                'grade_ids' => [$grade7->id],
            ]
        )->assertOk();

        $student->refresh();

        $this->assertFalse($student->legacy_class_access);
        $this->assertFalse($student->hasLegacyClassAccess());

        $actual = Grade::query()
            ->accessibleTo($student)
            ->pluck('id')
            ->all();

        $this->assertEqualsCanonicalizing(
            [$grade7->id],
            $actual
        );

        $this->assertNotContains($grade9->id, $actual);
    }

    public function test_rejection_permanently_clears_legacy_flag(): void
    {
        $this->classes();

        $teacher = User::factory()->create([
            'role' => 'teacher',
            'approval_status' => 'approved',
            'legacy_class_access' => true,
        ]);

        Sanctum::actingAs($this->admin());

        $this->patchJson(
            '/api/admin/users/' . $teacher->id . '/approval',
            [
                'status' => 'rejected',
                'grade_ids' => [],
            ]
        )->assertOk();

        $teacher->refresh();

        $this->assertSame(
            'rejected',
            $teacher->approval_status
        );

        $this->assertFalse($teacher->legacy_class_access);
        $this->assertFalse($teacher->hasLegacyClassAccess());

        $this->assertSame(
            0,
            Grade::query()->accessibleTo($teacher)->count()
        );
    }
}