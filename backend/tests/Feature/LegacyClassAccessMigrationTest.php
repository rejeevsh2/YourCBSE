<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\Grade;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class LegacyClassAccessMigrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_migration_backfills_only_qualifying_legacy_accounts(): void
    {
        $migration = require database_path(
            'migrations/2026_10_15_000001_add_legacy_class_access_to_users.php'
        );

        // Simulate the schema immediately before this migration.
        $migration->down();

        $this->assertFalse(
            Schema::hasColumn('users', 'legacy_class_access')
        );

        $board = Board::create([
            'name' => 'CBSE',
            'code' => 'CBSE',
        ]);

        $grade = Grade::create([
            'board_id' => $board->id,
            'name' => 'Class 7',
            'grade_number' => 7,
        ]);

        $legacyStudent = User::factory()->create([
            'role' => 'student',
            'approval_status' => 'approved',
        ]);

        $legacyTeacher = User::factory()->create([
            'role' => 'teacher',
            'approval_status' => 'approved',
        ]);

        $assignedStudent = User::factory()->create([
            'role' => 'student',
            'approval_status' => 'approved',
        ]);

        $assignedStudent->grades()->sync([$grade->id]);

        $pendingTeacher = User::factory()->create([
            'role' => 'teacher',
            'approval_status' => 'pending',
        ]);

        $rejectedStudent = User::factory()->create([
            'role' => 'student',
            'approval_status' => 'rejected',
        ]);

        $admin = User::factory()->create([
            'role' => 'admin',
            'approval_status' => 'approved',
        ]);

        // Apply the actual migration, including its data backfill.
        $migration->up();

        $this->assertTrue(
            Schema::hasColumn('users', 'legacy_class_access')
        );

        $this->assertTrue(
            $legacyStudent->fresh()->legacy_class_access
        );

        $this->assertTrue(
            $legacyTeacher->fresh()->legacy_class_access
        );

        foreach (
            [$assignedStudent, $pendingTeacher, $rejectedStudent, $admin]
            as $user
        ) {
            $this->assertFalse(
                $user->fresh()->legacy_class_access
            );
        }

        $this->assertTrue(
            $assignedStudent->grades()->whereKey($grade->id)->exists()
        );

        // All approved users without classes are now explicitly
        // protected by the temporary compatibility flag.
        $this->artisan('yourschool:audit-class-assignments')
            ->assertExitCode(0);
    }
}