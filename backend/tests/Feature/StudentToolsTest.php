<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\LessonContent;
use App\Models\Subject;
use App\Models\Unit;
use App\Models\User;
use App\Notifications\StudentNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StudentToolsTest extends TestCase
{
    use RefreshDatabase;

    private function resource(): LessonContent
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

        $subject = Subject::create([
            'grade_id' => $grade->id,
            'name' => 'Science',
            'code' => 'SCI',
        ]);

        $unit = Unit::create([
            'subject_id' => $subject->id,
            'title' => 'Motion',
            'unit_number' => 1,
        ]);

        $chapter = Chapter::create([
            'unit_id' => $unit->id,
            'title' => 'Time',
            'chapter_number' => 1,
        ]);

        $lesson = Lesson::create([
            'chapter_id' => $chapter->id,
            'title' => 'Speed',
            'slug' => 'speed',
            'lesson_number' => 1,
            'is_published' => true,
            'is_active' => true,
        ]);

        return LessonContent::create([
            'lesson_id' => $lesson->id,
            'title' => 'Speed notes',
            'content_type' => 'text',
            'content' => 'Speed = distance / time',
            'is_active' => true,
            'is_free' => true,
        ]);
    }

    private function assignResourceGrade(
        User $user,
        LessonContent $content
    ): void {
        $user->grades()->sync([
            $content
                ->lesson
                ->chapter
                ->unit
                ->subject
                ->grade_id,
        ]);
    }

    private function admin(): User
    {
        $admin = User::factory()->create([
            'role' => 'admin',
        ]);

        $adminRoleId = DB::table('admin_roles')
            ->where('slug', 'admin')
            ->value('id');

        DB::table('admin_role_user')->insert([
            'role_id' => $adminRoleId,
            'user_id' => $admin->id,
        ]);

        return $admin;
    }

    public function test_planner_is_persistent_and_private(): void
    {
        $owner = User::factory()->create();
        Sanctum::actingAs($owner);

        $id = $this
            ->postJson(
                '/api/student/planner/tasks',
                [
                    'title' => 'Revise speed',
                    'due_date' => '2026-09-20',
                    'minutes' => 30,
                    'category' => 'Revise',
                ]
            )
            ->assertCreated()
            ->json('task.id');

        $this->patchJson(
            '/api/student/planner/tasks/' . $id,
            ['done' => true]
        )
            ->assertOk()
            ->assertJsonPath('task.done', true);

        $this->getJson(
            '/api/student/planner/tasks'
        )
            ->assertOk()
            ->assertJsonPath(
                'tasks.0.title',
                'Revise speed'
            );

        Sanctum::actingAs(
            User::factory()->create()
        );

        $this->getJson(
            '/api/student/planner/tasks'
        )->assertJsonCount(0, 'tasks');

        $this->patchJson(
            '/api/student/planner/tasks/' . $id,
            ['done' => false]
        )->assertNotFound();

        $this->deleteJson(
            '/api/student/planner/tasks/' . $id
        )->assertNotFound();

        $this->assertDatabaseHas(
            'planner_tasks',
            [
                'id' => $id,
                'done' => true,
            ]
        );
    }

    public function test_profile_cannot_change_role_or_email(): void
    {
        $user = User::factory()->create([
            'role' => 'student',
            'email' => 'original@example.test',
        ]);

        Sanctum::actingAs($user);

        $this->putJson(
            '/api/profile',
            [
                'name' => 'Updated name',
                'bio' => 'I like science',
                'mobile' => '1234567890',
                'role' => 'admin',
                'email' => 'changed@example.test',
            ]
        )->assertOk();

        $this->assertDatabaseHas(
            'users',
            [
                'id' => $user->id,
                'name' => 'Updated name',
                'role' => 'student',
                'email' => 'original@example.test',
            ]
        );
    }

    public function test_catalog_hides_drafts_premium_and_unassigned_resources(): void
    {
        $content = $this->resource();

        $student = User::factory()->create([
            'role' => 'student',
        ]);

        $this->assignResourceGrade(
            $student,
            $content
        );

        Sanctum::actingAs($student);

        $this->getJson(
            '/api/library/catalog?q=Speed'
        )
            ->assertOk()
            ->assertJsonPath('total', 1);

        $unassignedStudent =
            User::factory()->create([
                'role' => 'student',
            ]);

        Sanctum::actingAs(
            $unassignedStudent
        );

        $this->getJson(
            '/api/library/catalog?q=Speed'
        )
            ->assertOk()
            ->assertJsonPath('total', 0);

        $this->getJson(
            '/api/library/resources/' .
            $content->id
        )->assertNotFound();

        Sanctum::actingAs($student);

        $content
            ->lesson
            ->update([
                'is_published' => false,
            ]);

        $this->getJson(
            '/api/library/resources/' .
            $content->id
        )->assertNotFound();

        $this->getJson(
            '/api/library/resources/' .
            $content->id .
            '/file'
        )->assertNotFound();

        $content
            ->lesson
            ->update([
                'is_published' => true,
            ]);

        $content->update([
            'is_free' => false,
        ]);

        $this->getJson(
            '/api/library/catalog'
        )->assertJsonPath('total', 0);

        $this->getJson(
            '/api/library/resources/' .
            $content->id .
            '/file'
        )->assertNotFound();
    }

    public function test_resource_state_is_owned_and_text_download_is_real(): void
    {
        $content = $this->resource();

        $user = User::factory()->create([
            'role' => 'student',
        ]);

        $this->assignResourceGrade(
            $user,
            $content
        );

        Sanctum::actingAs($user);

        $this->patchJson(
            '/api/library/resources/' .
            $content->id .
            '/state',
            [
                'bookmarked' => true,
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'items.0.bookmarked',
                true
            );

        $this->get(
            '/api/library/resources/' .
            $content->id .
            '/file'
        )
            ->assertOk()
            ->assertDownload(
                'speed-notes.txt'
            );

        Sanctum::actingAs(
            User::factory()->create([
                'role' => 'student',
            ])
        );

        $this->getJson(
            '/api/library/account-state'
        )->assertJsonCount(0, 'items');
    }

    public function test_notification_preferences_are_respected_and_private(): void
    {
        $student =
            User::factory()->create([
                'role' => 'student',
            ]);

        Sanctum::actingAs($student);

        $this->patchJson(
            '/api/notifications/preferences',
            [
                'id' => 'announcements',
                'enabled' => false,
            ]
        )->assertOk();

        Sanctum::actingAs(
            $this->admin()
        );

        $this->postJson(
            '/api/admin/announcements',
            [
                'title' => 'Notice',
                'message' => 'New resource',
                'role' => 'student',
            ]
        )
            ->assertOk()
            ->assertJsonPath(
                'recipients',
                0
            );

        $student->notify(
            new StudentNotification(
                'Private notice',
                'For owner only'
            )
        );

        $notice =
            $student
                ->notifications()
                ->first();

        $this->deleteJson(
            '/api/notifications/' .
            $notice->id
        )->assertNotFound();

        $this->patchJson(
            '/api/notifications/' .
            $notice->id .
            '/read'
        )->assertNotFound();

        Sanctum::actingAs($student);

        $this->patchJson(
            '/api/notifications/' .
            $notice->id .
            '/read'
        )
            ->assertOk()
            ->assertJsonPath(
                'unreadCount',
                0
            );

        $this->deleteJson(
            '/api/notifications/' .
            $notice->id
        )->assertOk();
    }

    public function test_password_change_requires_current_password_and_revokes_other_tokens(): void
    {
        $user = User::factory()->create([
            'password' =>
                'oldPassword123!',
        ]);

        $first =
            $user->createToken(
                'current'
            );

        $user->createToken('other');

        $this
            ->withToken(
                $first->plainTextToken
            )
            ->putJson(
                '/api/profile/password',
                [
                    'current_password' =>
                        'wrong',
                    'password' =>
                        'newPassword123!',
                    'password_confirmation' =>
                        'newPassword123!',
                ]
            )
            ->assertUnprocessable();

        $this
            ->withToken(
                $first->plainTextToken
            )
            ->putJson(
                '/api/profile/password',
                [
                    'current_password' =>
                        'oldPassword123!',
                    'password' =>
                        'newPassword123!',
                    'password_confirmation' =>
                        'newPassword123!',
                ]
            )
            ->assertOk();

        $this->assertEquals(
            1,
            $user
                ->tokens()
                ->count()
        );

        $this->assertTrue(
            \Illuminate\Support\Facades\Hash::check(
                'newPassword123!',
                $user->fresh()->password
            )
        );
    }
}
