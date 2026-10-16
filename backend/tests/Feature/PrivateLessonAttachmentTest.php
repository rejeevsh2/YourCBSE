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
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PrivateLessonAttachmentTest extends TestCase
{
    use RefreshDatabase;

    private function lesson(): array
    {
        $board = Board::create(['name' => 'CBSE', 'code' => 'CBSE']);
        $grade = Grade::create(['board_id' => $board->id, 'name' => 'Class 7', 'grade_number' => 7]);
        $subject = Subject::create(['grade_id' => $grade->id, 'name' => 'Science', 'code' => 'SCI7']);
        $unit = Unit::create(['subject_id' => $subject->id, 'title' => 'Motion', 'unit_number' => 1]);
        $chapter = Chapter::create(['unit_id' => $unit->id, 'title' => 'Speed', 'chapter_number' => 1]);
        $lesson = Lesson::create(['chapter_id' => $chapter->id, 'title' => 'Movement', 'slug' => 'movement', 'lesson_number' => 1, 'is_active' => true, 'is_published' => true]);

        return [$lesson, $grade];
    }

    private function admin(): User
    {
        $admin = User::factory()->create(['role' => 'admin']);
        DB::table('admin_role_user')->insert([
            'role_id' => DB::table('admin_roles')->where('slug', 'super-admin')->value('id'),
            'user_id' => $admin->id,
        ]);

        return $admin;
    }

    private function upload(Lesson $lesson): LessonContent
    {
        Sanctum::actingAs($this->admin());
        $this->post('/api/lesson-contents', [
            'lesson_id' => $lesson->id,
            'title' => 'Private notes',
            'content_type' => 'pdf',
            'file' => UploadedFile::fake()->create('notes.pdf', 12, 'application/pdf'),
        ])->assertCreated()->assertJsonPath('file_path', null)
          ->assertJsonPath('has_uploaded_file', true)
          ->assertJsonMissingPath('file_object_key');

        return LessonContent::where('title', 'Private notes')->firstOrFail();
    }

    public function test_private_upload_uses_opaque_r2_key_without_public_url(): void
    {
        Storage::fake('r2');
        config()->set('educational_storage.r2_new_uploads_enabled', true);
        [$lesson] = $this->lesson();
        $content = $this->upload($lesson);

        $this->assertSame('r2', $content->file_disk);
        $this->assertNull($content->file_path);
        $this->assertStringStartsWith("lessons/{$lesson->id}/files/", $content->file_object_key);
        Storage::disk('r2')->assertExists($content->file_object_key);

        $this->deleteJson("/api/lesson-contents/{$content->id}/file")
            ->assertOk()->assertJsonPath('content.has_uploaded_file', false);
        Storage::disk('r2')->assertMissing($content->file_object_key);
    }

    public function test_signed_url_requires_feature_flag_and_current_class_approval(): void
    {
        Storage::fake('r2');
        config()->set('educational_storage.r2_new_uploads_enabled', true);
        [$lesson, $grade] = $this->lesson();
        $content = $this->upload($lesson);

        // No temporary URL while Phase 2 is disabled.
        $urlPath = "/api/lesson-attachments/{$content->id}/temporary-url";
        $this->getJson($urlPath)->assertNotFound();

        config()->set('educational_storage.r2_signed_reads_enabled', true);
        Storage::disk('r2')->buildTemporaryUrlsUsing(
            fn ($path, $expiration, $options) => 'https://temporary.example.test/object?signature=test'
        );

        $student = User::factory()->create(['role' => 'student', 'approval_status' => 'approved']);
        $student->grades()->sync([$grade->id]);
        Sanctum::actingAs($student);
        $this->getJson($urlPath)->assertOk()->assertJsonPath('url', 'https://temporary.example.test/object?signature=test')
            ->assertHeader('Cache-Control', 'no-store, private');

        $student->grades()->detach();
        $this->getJson($urlPath)->assertForbidden();

        $student->grades()->sync([$grade->id]);
        $student->update(['approval_status' => 'pending']);
        $this->getJson($urlPath)->assertForbidden();

        $student->update(['approval_status' => 'approved', 'paused_at' => now()]);
        $this->getJson($urlPath)->assertForbidden();
    }

    public function test_unpublished_or_inactive_lessons_and_contents_cannot_issue_student_links(): void
    {
        Storage::fake('r2');
        config()->set('educational_storage.r2_new_uploads_enabled', true);
        config()->set('educational_storage.r2_signed_reads_enabled', true);
        [$lesson, $grade] = $this->lesson();
        $content = $this->upload($lesson);
        Storage::disk('r2')->buildTemporaryUrlsUsing(
            fn ($path, $expiration, $options) => 'https://temporary.example.test/private'
        );

        $student = User::factory()->create(['role' => 'student', 'approval_status' => 'approved']);
        $student->grades()->sync([$grade->id]);
        Sanctum::actingAs($student);
        $url = "/api/lesson-attachments/{$content->id}/temporary-url";

        $lesson->update(['is_published' => false]);
        $this->getJson($url)->assertForbidden();
        $lesson->update(['is_published' => true, 'is_active' => false]);
        $this->getJson($url)->assertForbidden();
        $lesson->update(['is_active' => true]);
        $content->update(['is_active' => false]);
        $this->getJson($url)->assertNotFound();
    }

    public function test_old_uploaded_files_remain_on_public_storage_when_flag_off(): void
    {
        Storage::fake('public');
        [$lesson] = $this->lesson();
        Sanctum::actingAs($this->admin());

        $this->post('/api/lesson-contents', [
            'lesson_id' => $lesson->id,
            'title' => 'Original notes',
            'content_type' => 'pdf',
            'file' => UploadedFile::fake()->create('original.pdf', 4),
        ])->assertCreated()->assertJsonPath('has_uploaded_file', true);

        $content = LessonContent::where('title', 'Original notes')->firstOrFail();
        $this->assertSame('public', $content->file_disk);
        $this->assertStringContainsString('/storage/lesson-content/', $content->file_path);
        Storage::disk('public')->assertExists($content->file_object_key);
    }
}
