<?php
namespace Tests\Feature;

use App\Models\{Board, Grade, Subject, Unit, Chapter, Lesson, User, RevisionItem, RevisionSession};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LearningWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private function lesson(): Lesson {
        $board=Board::create(['name'=>'CBSE','code'=>'CBSE']);
        $grade=Grade::create(['board_id'=>$board->id,'name'=>'Class 7','grade_number'=>7]);
        $subject=Subject::create(['grade_id'=>$grade->id,'name'=>'Science','code'=>'SCI']);
        $unit=Unit::create(['subject_id'=>$subject->id,'title'=>'Motion','unit_number'=>1]);
        $chapter=Chapter::create(['unit_id'=>$unit->id,'title'=>'Time and motion','chapter_number'=>1]);
        return Lesson::create(['chapter_id'=>$chapter->id,'title'=>'Speed','slug'=>'speed','lesson_number'=>1,'is_published'=>true,'is_active'=>true]);
    }

    public function test_registration_accepts_frontend_fields_without_granting_admin(): void {
        $this->postJson('/api/register', ['name'=>'New Student','email'=>'student@example.test','password'=>'SecurePassword123!','password_confirmation'=>'SecurePassword123!','role'=>'admin'])
            ->assertCreated()->assertJsonPath('user.role','student');
        $this->assertDatabaseHas('users',['email'=>'student@example.test','role'=>'student']);
    }

    public function test_inactive_ancestor_hides_lesson_and_blocks_progress(): void {
        $lesson=$this->lesson();
        Sanctum::actingAs(User::factory()->create(['role'=>'student']));
        $this->getJson('/api/public/lessons/'.$lesson->id)->assertOk();
        $lesson->chapter->unit->subject->grade->board->update(['is_active'=>false]);
        $this->getJson('/api/public/lessons/'.$lesson->id)->assertNotFound();
        $this->postJson('/api/lessons/'.$lesson->id.'/progress/complete')->assertNotFound();
        $this->assertDatabaseCount('lesson_progress',0);
    }

    public function test_revision_is_student_accessible_and_reviews_are_idempotent(): void {
        $lesson=$this->lesson();$user=User::factory()->create(['role'=>'student']);Sanctum::actingAs($user);
        $card=RevisionItem::create(['user_id'=>$user->id,'lesson_id'=>$lesson->id,'title'=>'Speed?','content'=>'Distance divided by time.']);
        $this->getJson('/api/interactive-revision')->assertOk()->assertJsonPath('due',1);
        $session=$this->postJson('/api/interactive-revision/start')->assertOk()->json('session.id');
        $this->postJson('/api/interactive-revision/start')->assertJsonPath('session.id',$session);
        foreach(range(1,2) as $_) $this->postJson("/api/interactive-revision/$session/review",['card_id'=>$card->id,'rating'=>'good'])->assertOk()->assertJsonPath('session.completed_cards',1);
        $this->assertDatabaseCount('revision_reviews',1);
        $this->postJson("/api/interactive-revision/$session/finish")->assertOk()->assertJsonPath('session.status','completed');
        $this->getJson('/api/interactive-revision')->assertJsonPath('due',0);
    }

    public function test_students_cannot_read_or_finish_someone_elses_revision(): void {
        $owner=User::factory()->create();$other=User::factory()->create();
        $session=RevisionSession::create(['user_id'=>$owner->id,'mode'=>'flashcards','status'=>'active']);
        Sanctum::actingAs($other);
        $this->getJson('/api/interactive-revision/'.$session->id)->assertNotFound();
        $this->postJson('/api/interactive-revision/'.$session->id.'/finish')->assertNotFound();
        $this->assertDatabaseHas('revision_sessions',['id'=>$session->id,'status'=>'active']);
    }

    public function test_teacher_drafts_cannot_self_publish_or_modify_another_authors_lesson(): void {
        $lesson=$this->lesson();$teacher=User::factory()->create(['role'=>'teacher']);Sanctum::actingAs($teacher);
        $id=$this->postJson('/api/teacher/lessons',['chapter_id'=>$lesson->chapter_id,'title'=>'Teacher draft','is_published'=>true])->assertCreated()->assertJsonPath('lesson.is_published',false)->json('lesson.id');
        $this->postJson("/api/teacher/lessons/$id/contents",['title'=>'Notes','content_type'=>'text','content'=>'Lesson notes'])->assertCreated();
        Sanctum::actingAs(User::factory()->create(['role'=>'teacher']));
        $this->putJson('/api/teacher/lessons/'.$id,['title'=>'Tampered'])->assertNotFound();
        $this->postJson('/api/admin/users',['name'=>'Invalid'])->assertForbidden();
    }

    public function test_admin_can_publish_practice_but_students_cannot_see_correct_options_before_submit(): void {
        $lesson=$this->lesson();Sanctum::actingAs(User::factory()->create(['role'=>'admin']));
        $id=$this->postJson('/api/admin/practice-sets',[
            'title'=>'Speed practice','subject_id'=>$lesson->chapter->unit->subject_id,'is_published'=>true,
            'questions'=>[['question_text'=>'10 metres in 2 seconds?','options'=>['5 m/s','2 m/s','10 m/s','20 m/s'],'correct'=>0,'explanation'=>'10 / 2 = 5.']],
        ])->assertCreated()->json('set.id');
        Sanctum::actingAs(User::factory()->create(['role'=>'student']));
        $response=$this->getJson('/api/practice-sets/'.$id)->assertOk();
        $this->assertStringNotContainsString('is_correct',$response->getContent());
        $this->assertStringNotContainsString('10 / 2 = 5.',$response->getContent());
        $this->postJson('/api/admin/practice-sets',[])->assertForbidden();
    }
}
