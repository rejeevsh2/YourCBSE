<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\Grade;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClassAssignmentAuditCommandTest extends TestCase
{
    use RefreshDatabase;

    public function test_audit_fails_for_approved_student_without_class(): void
    {
        User::factory()->create([
            'role' => 'student',
            'approval_status' => 'approved',
        ]);

        $this->artisan('yourschool:audit-class-assignments')
            ->assertExitCode(1);
    }

    public function test_audit_passes_when_approved_student_has_class(): void
    {
        $board = Board::create([
            'name' => 'CBSE',
            'code' => 'CBSE',
        ]);

        $grade = Grade::create([
            'board_id' => $board->id,
            'name' => 'Class 7',
            'grade_number' => 7,
        ]);

        $student = User::factory()->create([
            'role' => 'student',
            'approval_status' => 'approved',
        ]);

        $student->grades()->sync([$grade->id]);

        $this->artisan('yourschool:audit-class-assignments')
            ->assertExitCode(0);
    }

    public function test_audit_ignores_pending_student_without_class(): void
    {
        User::factory()->create([
            'role' => 'student',
            'approval_status' => 'pending',
        ]);

        $this->artisan('yourschool:audit-class-assignments')
            ->assertExitCode(0);
    }

    public function test_audit_fails_for_approved_teacher_without_class(): void
    {
        User::factory()->create([
            'role' => 'teacher',
            'approval_status' => 'approved',
        ]);

        $this->artisan('yourschool:audit-class-assignments')
            ->assertExitCode(1);
    }
}