<?php

namespace Tests\Feature;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccountLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private function admin(bool $super = false): User
    {
        $admin = User::factory()->create(['role' => 'admin']);

        DB::table('admin_role_user')->insert([
            'role_id' => DB::table('admin_roles')
                ->where('slug', $super ? 'super-admin' : 'admin')
                ->value('id'),
            'user_id' => $admin->id,
        ]);

        return $admin;
    }

    public function test_regular_admin_pauses_and_reactivates_student_without_losing_approval(): void
    {
        $actor = $this->admin();
        $student = User::factory()->create([
            'role' => 'student',
            'approval_status' => 'approved',
        ]);
        $student->createToken('test-session');

        Sanctum::actingAs($actor);

        $this->patchJson("/api/admin/users/{$student->id}/pause")
            ->assertOk()
            ->assertJsonPath('user.approval_status', 'approved');

        $this->assertNotNull($student->fresh()->paused_at);
        $this->assertSame(0, $student->tokens()->count());
        $this->assertDatabaseHas('audit_logs', [
            'actor_user_id' => $actor->id,
            'action' => 'pause_user',
        ]);

        $this->patchJson("/api/admin/users/{$student->id}/reactivate")
            ->assertOk()
            ->assertJsonPath('user.approval_status', 'approved');

        $this->assertNull($student->fresh()->paused_at);
        $this->assertDatabaseHas('audit_logs', [
            'actor_user_id' => $actor->id,
            'action' => 'reactivate_user',
        ]);
    }

    public function test_paused_account_cannot_sign_in_even_with_valid_password(): void
    {
        $student = User::factory()->create([
            'role' => 'student',
            'password' => 'Password123!',
            'approval_status' => 'approved',
            'paused_at' => now(),
        ]);

        $this->postJson('/api/login', [
            'email' => $student->email,
            'password' => 'Password123!',
        ])->assertForbidden()->assertJsonPath('code', 'account-paused');
    }

    public function test_regular_admin_can_pause_school_admin_but_not_self_or_super_admin(): void
    {
        $actor = $this->admin();
        $otherAdmin = $this->admin();
        $superAdmin = $this->admin(true);

        Sanctum::actingAs($actor);

        $this->patchJson("/api/admin/users/{$otherAdmin->id}/pause")
            ->assertOk();
        $this->patchJson("/api/admin/users/{$actor->id}/pause")
            ->assertForbidden();
        $this->patchJson("/api/admin/users/{$superAdmin->id}/pause")
            ->assertForbidden();

        $this->assertNull($actor->fresh()->paused_at);
        $this->assertNull($superAdmin->fresh()->paused_at);
    }

    public function test_only_super_admin_can_delete_with_both_confirmations_and_audit(): void
    {
        $regular = $this->admin();
        $super = $this->admin(true);
        $teacher = User::factory()->create(['role' => 'teacher']);
        $teacher->createToken('test-session');

        Sanctum::actingAs($regular);
        $this->deleteJson("/api/admin/users/{$teacher->id}", [
            'confirmation' => 'DELETE',
            'confirm_email' => $teacher->email,
        ])->assertForbidden();

        Sanctum::actingAs($super);
        $this->deleteJson("/api/admin/users/{$teacher->id}", [
            'confirmation' => 'DELETE',
        ])->assertUnprocessable();

        $this->deleteJson("/api/admin/users/{$teacher->id}", [
            'confirmation' => 'DELETE',
            'confirm_email' => 'not-the-target@example.test',
        ])->assertUnprocessable();

        $this->deleteJson("/api/admin/users/{$teacher->id}", [
            'confirmation' => 'DELETE',
            'confirm_email' => $teacher->email,
        ])->assertOk();

        $this->assertSoftDeleted($teacher);
        $this->assertSame(0, $teacher->tokens()->count());
        $this->assertDatabaseHas('audit_logs', [
            'actor_user_id' => $super->id,
            'action' => 'destroy_user',
        ]);
    }

    public function test_super_admin_cannot_delete_self_or_another_super_admin(): void
    {
        $super = $this->admin(true);
        $another = $this->admin(true);
        Sanctum::actingAs($super);

        foreach ([$super, $another] as $target) {
            $this->deleteJson("/api/admin/users/{$target->id}", [
                'confirmation' => 'DELETE',
                'confirm_email' => $target->email,
            ])->assertForbidden();

            $this->assertNull($target->fresh()->deleted_at);
        }
    }

    public function test_account_list_includes_school_admins_and_accurate_delete_capability(): void
    {
        $regular = $this->admin();
        $super = $this->admin(true);

        Sanctum::actingAs($regular);
        $this->getJson('/api/admin/users')
            ->assertOk()
            ->assertJsonPath('can_delete_accounts', false);

        Sanctum::actingAs($super);
        $this->getJson('/api/admin/users?role=admin')
            ->assertOk()
            ->assertJsonPath('can_delete_accounts', true)
            ->assertJsonCount(2, 'users');
    }

    public function test_pausing_pending_account_does_not_approve_it(): void
    {
        $actor = $this->admin();
        $student = User::factory()->create([
            'role' => 'student',
            'approval_status' => 'pending',
        ]);

        Sanctum::actingAs($actor);
        $this->patchJson("/api/admin/users/{$student->id}/pause")->assertOk();
        $this->patchJson("/api/admin/users/{$student->id}/reactivate")->assertOk();

        $this->assertSame('pending', $student->fresh()->approval_status);
    }
}
