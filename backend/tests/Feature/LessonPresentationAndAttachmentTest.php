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

class LessonPresentationAndAttachmentTest extends TestCase
{
    use RefreshDatabase;

    private function createLesson(): Lesson
    {
        $board = Board::create(['name' => 'CBSE', 'code' => 'CBSE']);
        $grade = Grade::create([
            'board_id' => $board->id,
            'name' => 'Class 7',
            'grade_number' => 7,
        ]);
        $subject = Subject::create([
            'grade_id' => $grade->id,
            'name' => 'Science',
            'code' => 'SCI7',
        ]);
        $unit = Unit::create([
            'subject_id' => $subject->id,
            'title' => 'Motion',
            'unit_number' => 1,
        ]);
        $chapter = Chapter::create([
            'unit_id' => $unit->id,
            'title' => 'Speed and Time',
            'chapter_number' => 1,
        ]);

        return Lesson::create([
            'chapter_id' => $chapter->id,
            'title' => 'What Is Speed?',
            'slug' => 'what-is-speed',
            'lesson_number' => 1,
            'is_published' => true,
            'is_active' => true,
        ]);
    }

    private function signInAdmin(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        DB::table('admin_role_user')->insert([
            'role_id' => DB::table('admin_roles')
                ->where('slug', 'super-admin')
                ->value('id'),
            'user_id' => $admin->id,
        ]);

        Sanctum::actingAs($admin);
    }

    private function localFilePath(LessonContent $content): string
    {
        return ltrim(
            (string) parse_url($content->file_path, PHP_URL_PATH),
            '/'
        );
    }

    public function test_admin_can_upload_pptx_and_students_can_access_it(): void
    {
        Storage::fake('public');
        $lesson = $this->createLesson();
        $this->signInAdmin();

        $this->post('/api/lesson-contents', [
            'lesson_id' => $lesson->id,
            'title' => 'Lesson presentation',
            'content_type' => 'ppt',
            'file' => UploadedFile::fake()->create(
                'lesson-deck.pptx',
                24,
                'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            ),
            'is_active' => '1',
            'is_free' => '1',
        ])->assertCreated()->assertJsonPath('content_type', 'ppt');

        $content = LessonContent::where('title', 'Lesson presentation')->firstOrFail();
        $stored = str_replace('storage/', '', $this->localFilePath($content));
        Storage::disk('public')->assertExists($stored);

        $this->getJson("/api/public/lessons/{$lesson->id}")
            ->assertOk()
            ->assertJsonPath('contents.0.content_type', 'ppt');
    }

    public function test_removing_uploaded_file_preserves_lesson_content_and_external_link(): void
    {
        Storage::fake('public');
        $lesson = $this->createLesson();
        $path = UploadedFile::fake()->image('diagram.png')
            ->store('lesson-content', 'public');
        $content = LessonContent::create([
            'lesson_id' => $lesson->id,
            'title' => 'Science image',
            'content_type' => 'image',
            'content' => 'Important notes',
            'file_path' => asset('storage/' . $path),
            'external_url' => 'https://drive.google.com/file/d/abc/view',
            'display_order' => 1,
            'is_active' => true,
            'is_free' => true,
        ]);
        $this->signInAdmin();

        $this->deleteJson("/api/lesson-contents/{$content->id}/file")
            ->assertOk()
            ->assertJsonPath('content.content', 'Important notes')
            ->assertJsonPath('content.file_path', null);

        Storage::disk('public')->assertMissing($path);
        $this->assertDatabaseHas('lesson_contents', [
            'id' => $content->id,
            'content' => 'Important notes',
            'external_url' => 'https://drive.google.com/file/d/abc/view',
            'file_path' => null,
        ]);
    }

    public function test_deleting_content_removes_its_uploaded_file_and_record(): void
    {
        Storage::fake('public');
        $lesson = $this->createLesson();
        $path = UploadedFile::fake()->create('deck.pptx', 20)
            ->store('lesson-content', 'public');
        $content = LessonContent::create([
            'lesson_id' => $lesson->id,
            'title' => 'PPT to delete',
            'content_type' => 'ppt',
            'file_path' => asset('storage/' . $path),
        ]);
        $this->signInAdmin();

        $this->deleteJson("/api/lesson-contents/{$content->id}")->assertOk();

        Storage::disk('public')->assertMissing($path);
        $this->assertDatabaseMissing('lesson_contents', ['id' => $content->id]);
    }

    public function test_teacher_cannot_use_admin_upload_or_file_removal(): void
    {
        $lesson = $this->createLesson();
        $content = LessonContent::create([
            'lesson_id' => $lesson->id,
            'title' => 'Document',
            'content_type' => 'pdf',
            'file_path' => asset('storage/lesson-content/safe.pdf'),
        ]);

        Sanctum::actingAs(User::factory()->create(['role' => 'teacher']));

        $this->deleteJson("/api/lesson-contents/{$content->id}/file")
            ->assertForbidden();
        $this->deleteJson("/api/lesson-contents/{$content->id}")
            ->assertForbidden();
    }

    public function test_removing_file_from_link_only_record_returns_validation_error(): void
    {
        $lesson = $this->createLesson();
        $content = LessonContent::create([
            'lesson_id' => $lesson->id,
            'title' => 'YouTube',
            'content_type' => 'video',
            'external_url' => 'https://www.youtube.com/watch?v=abc123',
        ]);
        $this->signInAdmin();

        $this->deleteJson("/api/lesson-contents/{$content->id}/file")
            ->assertUnprocessable();

        $this->assertDatabaseHas('lesson_contents', [
            'id' => $content->id,
            'external_url' => 'https://www.youtube.com/watch?v=abc123',
        ]);
    }
}
