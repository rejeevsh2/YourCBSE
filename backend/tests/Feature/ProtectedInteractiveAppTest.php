<?php

namespace Tests\Feature;

use App\Models\Board;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\InteractiveApp;
use App\Models\Lesson;
use App\Models\Subject;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProtectedInteractiveAppTest extends TestCase
{
    use RefreshDatabase;

    private function sample(bool $published = true): array
    {
        $board = Board::create(['name' => 'CBSE', 'code' => 'CBSE']);
        $grade = Grade::create(['board_id' => $board->id, 'name' => 'Class 7', 'grade_number' => 7]);
        $subject = Subject::create(['grade_id' => $grade->id, 'name' => 'Science', 'code' => 'SCI7']);
        $unit = Unit::create(['subject_id' => $subject->id, 'title' => 'Light', 'unit_number' => 1]);
        $chapter = Chapter::create(['unit_id' => $unit->id, 'title' => 'Mirrors', 'chapter_number' => 1]);
        $lesson = Lesson::create([
            'chapter_id' => $chapter->id,
            'title' => 'Mirrors Lesson',
            'slug' => 'mirrors',
            'lesson_number' => 1,
            'is_published' => $published,
            'is_active' => true,
        ]);

        $directory = 'interactive-apps/01234567-89ab-4cde-8fab-0123456789ab';
        $app = InteractiveApp::create([
            'lesson_id' => $lesson->id,
            'title' => 'Mirrors Lab',
            'source_type' => 'zip',
            'file_path' => $directory,
            'entry_url' => asset('storage/' . $directory . '/lab/index.html'),
            'is_published' => $published,
            'is_active' => true,
        ]);

        return [$app, $lesson, $grade, $directory];
    }

    private function student(Grade $grade): array
    {
        $student = User::factory()->create([
            'role' => 'student',
            'approval_status' => 'approved',
        ]);
        $student->grades()->attach($grade);
        return [$student, $student->createToken('learner-login')];
    }

    public function test_a_public_link_to_html_or_assets_cannot_bypass_login(): void
    {
        Storage::fake('local');
        [$app, , , $directory] = $this->sample();
        Storage::disk('local')->put($directory . '/lab/index.html', '<h1>Private</h1>');
        Storage::disk('local')->put($directory . '/lab/game.js', 'console.log("private")');

        $this->get("/interactive-apps/{$app->id}/open")
            ->assertRedirect('https://www.yourschool.co.in/interactive-app/' . $app->id);

        $this->get("/interactive-apps/{$app->id}/files/lab/index.html")
            ->assertRedirect('https://www.yourschool.co.in/interactive-app/' . $app->id);

        $this->get("/interactive-apps/{$app->id}/files/lab/game.js")
            ->assertUnauthorized();

        $this->assertSame('/interactive-app/' . $app->id, $app->fresh()->entry_url);
    }

    public function test_approved_student_receives_a_one_time_ticket_and_private_assets(): void
    {
        Storage::fake('local');
        Cache::clear();
        [$app, , $grade, $directory] = $this->sample();
        Storage::disk('local')->put($directory . '/lab/index.html', '<h1>Private Lab</h1>');
        Storage::disk('local')->put($directory . '/lab/game.js', 'console.log("ready")');

        [$student, $token] = $this->student($grade);

        $response = $this->withToken($token->plainTextToken)
            ->postJson("/api/interactive-apps/{$app->id}/launch");

        $response->assertOk()->assertJsonStructure(['launch_url']);
        $url = $response->json('launch_url');
        $this->assertStringContainsString('/open?ticket=', $url);

        $open = $this->get($url);
        $open->assertRedirect('/interactive-apps/' . $app->id . '/files/lab/index.html');
        $sessionCookie = collect($open->headers->getCookies())
            ->first(fn ($cookie) => $cookie->getName() === 'ys_app_' . $app->id);

        $this->assertNotNull($sessionCookie);
        $this->assertTrue($sessionCookie->isHttpOnly());

        $this->withUnencryptedCookie($sessionCookie->getName(), $sessionCookie->getValue())
            ->get("/interactive-apps/{$app->id}/files/lab/game.js")
            ->assertOk()
            ->assertHeader('Content-Type', 'text/javascript; charset=UTF-8');

        $this->assertSame('console.log("ready")',
            Storage::disk('local')->get($directory . '/lab/game.js'));

        // The ticket is consumed; sharing or reusing it grants no access.
        $this->get($url)->assertForbidden();

        $student->tokens()->delete();

        $this->withUnencryptedCookie($sessionCookie->getName(), $sessionCookie->getValue())
            ->get("/interactive-apps/{$app->id}/files/lab/game.js")
            ->assertUnauthorized();
    }

    public function test_account_pause_and_class_access_are_enforced_on_every_launch(): void
    {
        [$app, , $grade] = $this->sample();
        [$student, $token] = $this->student($grade);

        $student->forceFill(['legacy_class_access' => false])->save();
        $student->grades()->detach($grade);
        $this->withToken($token->plainTextToken)
            ->postJson("/api/interactive-apps/{$app->id}/launch")
            ->assertForbidden();

        $student->grades()->attach($grade);
        $student->forceFill(['paused_at' => now()])->save();

        $this->withToken($token->plainTextToken)
            ->postJson("/api/interactive-apps/{$app->id}/launch")
            ->assertForbidden();
    }

    public function test_unpublished_apps_are_not_available_to_students(): void
    {
        [$app, , $grade] = $this->sample(false);
        [, $token] = $this->student($grade);

        $this->withToken($token->plainTextToken)
            ->postJson("/api/interactive-apps/{$app->id}/launch")
            ->assertForbidden();
    }

    public function test_external_sites_are_explicitly_outside_yourschool_protection(): void
    {
        [$app, , $grade] = $this->sample();
        $app->update([
            'source_type' => 'external',
            'file_path' => null,
            'entry_url' => 'https://example.org/app',
            'external_url' => 'https://example.org/app',
        ]);
        [, $token] = $this->student($grade);

        $this->withToken($token->plainTextToken)
            ->postJson("/api/interactive-apps/{$app->id}/launch")
            ->assertUnprocessable();

        $this->assertSame('https://example.org/app', $app->fresh()->entry_url);
    }

    public function test_secure_command_copies_verifies_then_removes_legacy_public_files(): void
    {
        Storage::fake('public');
        Storage::fake('local');
        [$app, , , $directory] = $this->sample();

        Storage::disk('public')->put($directory . '/lab/index.html', '<p>Old public URL</p>');
        Storage::disk('public')->put($directory . '/lab/scripts/start.js', 'console.log("legacy")');

        $this->artisan('interactive-apps:secure --dry-run')->assertExitCode(0);
        Storage::disk('public')->assertExists($directory . '/lab/index.html');

        $this->artisan('interactive-apps:secure')->assertExitCode(0);
        Storage::disk('local')->assertExists($directory . '/lab/index.html');
        Storage::disk('local')->assertExists($directory . '/lab/scripts/start.js');
        Storage::disk('public')->assertMissing($directory . '/lab/index.html');

        $this->assertSame('/interactive-app/' . $app->id, $app->fresh()->entry_url);
    }

    public function test_migration_refuses_to_delete_public_files_if_an_entry_is_missing(): void
    {
        Storage::fake('public');
        Storage::fake('local');
        [$app, , , $directory] = $this->sample();

        Storage::disk('public')->put($directory . '/lab/not-index.js', 'console.log("still-public")');

        $this->artisan('interactive-apps:secure')->assertExitCode(1);
        Storage::disk('public')->assertExists($directory . '/lab/not-index.js');
    }
}
