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
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LessonSlideViewerAccessTest extends TestCase
{
    use RefreshDatabase;

    private function sample(bool $published = true): array
    {
        Storage::fake('public');

        $board = Board::create(['name' => 'CBSE', 'code' => 'CBSE']);
        $grade = Grade::create([
            'board_id' => $board->id,
            'name' => 'Class 7',
            'grade_number' => 7,
        ]);
        $subject = Subject::create(['grade_id' => $grade->id, 'name' => 'Science', 'code' => 'SCI7']);
        $unit = Unit::create(['subject_id' => $subject->id, 'title' => 'Light', 'unit_number' => 1]);
        $chapter = Chapter::create(['unit_id' => $unit->id, 'title' => 'Mirrors', 'chapter_number' => 1]);
        $lesson = Lesson::create([
            'chapter_id' => $chapter->id,
            'title' => 'Reflecting light',
            'slug' => 'reflecting-light',
            'lesson_number' => 1,
            'is_published' => $published,
            'is_active' => true,
        ]);

        $path = 'lesson-content/Presentation_99.pptx';
        Storage::disk('public')->put($path, 'fake pptx bytes');
        $content = LessonContent::create([
            'lesson_id' => $lesson->id,
            'title' => 'Mirror slides',
            'content_type' => 'ppt',
            'file_path' => asset('storage/' . $path),
            'is_active' => true,
            'is_free' => true,
        ]);

        return [$content, $lesson, $grade, $path];
    }

    private function student(Grade $grade, bool $assign = true): User
    {
        $user = User::factory()->create([
            'role' => 'student',
            'approval_status' => 'approved',
            'legacy_class_access' => false,
        ]);

        if ($assign) $user->grades()->attach($grade);
        return $user;
    }

    public function test_anonymous_user_cannot_fetch_presentation_bytes(): void
    {
        [$content] = $this->sample();
        $this->getJson("/api/lesson-contents/{$content->id}/presentation-file")
            ->assertUnauthorized();
    }

    public function test_assigned_student_can_view_pptx_slides_inline(): void
    {
        [$content, , $grade] = $this->sample();
        Sanctum::actingAs($this->student($grade));

        $this->get("/api/lesson-contents/{$content->id}/presentation-file")
            ->assertOk()
            ->assertHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            )
            ->assertHeader('Cache-Control', 'private, no-store');
    }

    public function test_students_outside_assigned_class_cannot_fetch_decks(): void
    {
        [$content, , $grade] = $this->sample();
        Sanctum::actingAs($this->student($grade, false));

        $this->getJson("/api/lesson-contents/{$content->id}/presentation-file")
            ->assertForbidden();
    }

    public function test_an_unpublished_lesson_cannot_be_served_to_students(): void
    {
        [$content, , $grade] = $this->sample(false);
        Sanctum::actingAs($this->student($grade));

        $this->getJson("/api/lesson-contents/{$content->id}/presentation-file")
            ->assertForbidden();
    }

    public function test_paused_user_is_denied_even_when_token_still_exists(): void
    {
        [$content, , $grade] = $this->sample();
        $student = $this->student($grade);
        $student->forceFill(['paused_at' => now()])->save();
        Sanctum::actingAs($student);

        $this->getJson("/api/lesson-contents/{$content->id}/presentation-file")
            ->assertForbidden();
    }

    public function test_admin_can_preview_a_draft(): void
    {
        [$content] = $this->sample(false);
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $this->get("/api/lesson-contents/{$content->id}/presentation-file")
            ->assertOk();
    }

    public function test_gateway_refuses_external_urls_and_other_file_types(): void
    {
        [$content, , $grade] = $this->sample();
        Sanctum::actingAs($this->student($grade));

        $content->update(['file_path' => 'https://malicious.example/private.pptx']);
        $this->getJson("/api/lesson-contents/{$content->id}/presentation-file")
            ->assertNotFound();

        $content->update([
            'file_path' => asset('storage/lesson-content/Presentation_99.pptx'),
            'content_type' => 'pdf',
        ]);
        $this->getJson("/api/lesson-contents/{$content->id}/presentation-file")
            ->assertNotFound();
    }
}
