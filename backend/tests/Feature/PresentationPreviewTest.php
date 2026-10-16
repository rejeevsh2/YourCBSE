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
use App\Services\PresentationPreviewService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PresentationPreviewTest extends TestCase
{
    use RefreshDatabase;

    private function lessonAndGrade(): array
    {
        $board = Board::create(['name' => 'CBSE', 'code' => 'CBSE']);
        $grade = Grade::create(['board_id' => $board->id, 'name' => 'Class 8', 'grade_number' => 8]);
        $subject = Subject::create(['grade_id' => $grade->id, 'name' => 'History', 'code' => 'HIS8']);
        $unit = Unit::create(['subject_id' => $subject->id, 'title' => 'Ancient India', 'unit_number' => 1]);
        $chapter = Chapter::create(['unit_id' => $unit->id, 'title' => 'Empires', 'chapter_number' => 1]);
        $lesson = Lesson::create([
            'chapter_id' => $chapter->id,
            'title' => 'Kingdoms',
            'slug' => 'kingdoms',
            'lesson_number' => 1,
            'is_active' => true,
            'is_published' => true,
        ]);

        return [$lesson, $grade];
    }

    private function presentation(Lesson $lesson): LessonContent
    {
        return LessonContent::create([
            'lesson_id' => $lesson->id,
            'title' => 'Ancient India slides',
            'content_type' => 'ppt',
            'is_free' => true,
            'is_active' => true,
            'file_disk' => 'r2',
            'file_path' => null,
            'file_object_key' => "lessons/{$lesson->id}/files/11111111-2222-4333-8444-555555555555.pptx",
        ]);
    }

    private function student(Grade $grade): User
    {
        $student = User::factory()->create(['role' => 'student', 'approval_status' => 'approved']);
        $student->grades()->sync([$grade->id]);

        return $student;
    }

    public function test_slide_endpoint_is_opt_in_and_unavailable_without_manifest(): void
    {
        Storage::fake('r2');
        config()->set('educational_storage.r2_signed_reads_enabled', true);
        [$lesson, $grade] = $this->lessonAndGrade();
        $content = $this->presentation($lesson);
        Sanctum::actingAs($this->student($grade));

        $this->getJson("/api/lesson-attachments/{$content->id}/slides")->assertNotFound();

        config()->set('presentation_previews.enabled', true);
        $this->getJson("/api/lesson-attachments/{$content->id}/slides")
            ->assertOk()->assertJsonPath('status', 'processing')
            ->assertHeader('Cache-Control', 'no-store, private');
    }

    public function test_student_sees_only_signed_slide_images_not_original_pptx(): void
    {
        Storage::fake('r2');
        config()->set('educational_storage.r2_signed_reads_enabled', true);
        config()->set('presentation_previews.enabled', true);

        [$lesson, $grade] = $this->lessonAndGrade();
        $content = $this->presentation($lesson);
        $prefix = app(PresentationPreviewService::class)->prefix($content);
        $this->assertNotNull($prefix);

        Storage::disk('r2')->put($prefix.'/manifest.json', json_encode([
            'version' => 1,
            'slides' => [
                $prefix.'/slides/slide-0001.jpg',
                $prefix.'/slides/slide-0002.jpg',
            ],
        ]));

        Storage::disk('r2')->buildTemporaryUrlsUsing(
            fn ($path, $expiration, $options) => 'https://r2.example.test/'.basename($path).'?token=temporary'
        );

        Sanctum::actingAs($this->student($grade));

        $this->getJson("/api/lesson-attachments/{$content->id}/slides")
            ->assertOk()
            ->assertJsonPath('status', 'ready')
            ->assertJsonPath('count', 2)
            ->assertJsonPath('slides.0.url', 'https://r2.example.test/slide-0001.jpg?token=temporary')
            ->assertJsonMissingPath('file_object_key')
            ->assertHeader('Cache-Control', 'no-store, private');

        $this->getJson("/api/lesson-attachments/{$content->id}/temporary-url")
            ->assertForbidden();
    }

    public function test_slide_endpoint_does_not_bypass_class_or_free_restrictions(): void
    {
        Storage::fake('r2');
        config()->set('educational_storage.r2_signed_reads_enabled', true);
        config()->set('presentation_previews.enabled', true);

        [$lesson, $grade] = $this->lessonAndGrade();
        $content = $this->presentation($lesson);
        $student = $this->student($grade);
        Sanctum::actingAs($student);

        $content->update(['is_free' => false]);
        $this->getJson("/api/lesson-attachments/{$content->id}/slides")->assertForbidden();

        $content->update(['is_free' => true]);
        $student->grades()->detach();
        $this->getJson("/api/lesson-attachments/{$content->id}/slides")->assertForbidden();

        $student->grades()->sync([$grade->id]);
        $student->update(['paused_at' => now()]);
        $this->getJson("/api/lesson-attachments/{$content->id}/slides")->assertForbidden();
    }

    public function test_preview_manifest_cannot_redirect_reader_to_another_key(): void
    {
        Storage::fake('r2');
        [$lesson] = $this->lessonAndGrade();
        $content = $this->presentation($lesson);
        $prefix = app(PresentationPreviewService::class)->prefix($content);

        Storage::disk('r2')->put($prefix.'/manifest.json', json_encode([
            'slides' => ['lessons/999/files/private.pptx'],
        ]));

        $this->assertNull(app(PresentationPreviewService::class)->manifest($content));
    }

    public function test_admin_can_retry_failed_background_conversion(): void
    {
        Storage::fake('r2');
        config()->set('presentation_previews.enabled', true);
        config()->set('presentation_previews.converter_url', 'https://converter.example.test');
        config()->set('presentation_previews.converter_token', str_repeat('a', 40));
        Http::fake(['converter.example.test/*' => Http::response(['status' => 'accepted'], 202)]);

        [$lesson] = $this->lessonAndGrade();
        $content = $this->presentation($lesson);

        $admin = User::factory()->create(['role' => 'admin']);
        DB::table('admin_role_user')->insert([
            'role_id' => DB::table('admin_roles')->where('slug', 'super-admin')->value('id'),
            'user_id' => $admin->id,
        ]);
        Sanctum::actingAs($admin);

        $this->postJson("/api/lesson-contents/{$content->id}/preview/retry")
            ->assertStatus(202);

        Http::assertSent(fn ($request) =>
            $request->url() === 'https://converter.example.test/convert' &&
            $request['content_id'] === $content->id &&
            str_starts_with($request['preview_prefix'], "lessons/{$lesson->id}/previews/")
        );
    }
}
