<?php
namespace Tests\Feature;
use App\Models\{User,Board,Grade,Subject,Unit,Chapter,Lesson,LessonContent,PlannerTask};
use App\Notifications\StudentNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class StudentToolsTest extends TestCase {
 use RefreshDatabase;
 private function resource():LessonContent {
  $b=Board::create(['name'=>'CBSE','code'=>'CBSE']);
  $g=Grade::create(['board_id'=>$b->id,'name'=>'Class 7','grade_number'=>7]);
  $s=Subject::create(['grade_id'=>$g->id,'name'=>'Science','code'=>'SCI']);
  $u=Unit::create(['subject_id'=>$s->id,'title'=>'Motion','unit_number'=>1]);
  $c=Chapter::create(['unit_id'=>$u->id,'title'=>'Time','chapter_number'=>1]);
  $l=Lesson::create(['chapter_id'=>$c->id,'title'=>'Speed','slug'=>'speed','lesson_number'=>1,'is_published'=>true,'is_active'=>true]);
  return LessonContent::create(['lesson_id'=>$l->id,'title'=>'Speed notes','content_type'=>'text','content'=>'Speed = distance / time','is_active'=>true,'is_free'=>true]);
 }
 public function test_planner_is_persistent_and_private():void {
  $owner=User::factory()->create();Sanctum::actingAs($owner);
  $id=$this->postJson('/api/student/planner/tasks',['title'=>'Revise speed','due_date'=>'2026-09-20','minutes'=>30,'category'=>'Revise'])->assertCreated()->json('task.id');
  $this->patchJson('/api/student/planner/tasks/'.$id,['done'=>true])->assertOk()->assertJsonPath('task.done',true);
  $this->getJson('/api/student/planner/tasks')->assertOk()->assertJsonPath('tasks.0.title','Revise speed');
  Sanctum::actingAs(User::factory()->create());
  $this->getJson('/api/student/planner/tasks')->assertJsonCount(0,'tasks');
  $this->patchJson('/api/student/planner/tasks/'.$id,['done'=>false])->assertNotFound();
  $this->deleteJson('/api/student/planner/tasks/'.$id)->assertNotFound();
  $this->assertDatabaseHas('planner_tasks',['id'=>$id,'done'=>true]);
 }
 public function test_profile_cannot_change_role_or_email():void {
  $u=User::factory()->create(['role'=>'student','email'=>'original@example.test']);Sanctum::actingAs($u);
  $this->putJson('/api/profile',['name'=>'Updated name','bio'=>'I like science','mobile'=>'1234567890','role'=>'admin','email'=>'changed@example.test'])->assertOk();
  $this->assertDatabaseHas('users',['id'=>$u->id,'name'=>'Updated name','role'=>'student','email'=>'original@example.test']);
 }
 public function test_catalog_hides_drafts_and_premium_resources():void {
  $c=$this->resource();
  $this->getJson('/api/library/catalog?q=Speed')->assertOk()->assertJsonPath('total',1);
  $c->lesson->update(['is_published'=>false]);
  $this->getJson('/api/library/resources/'.$c->id)->assertNotFound();
  $this->getJson('/api/library/resources/'.$c->id.'/file')->assertNotFound();
  $c->lesson->update(['is_published'=>true]);$c->update(['is_free'=>false]);
  $this->getJson('/api/library/catalog')->assertJsonPath('total',0);
  $this->getJson('/api/library/resources/'.$c->id.'/file')->assertNotFound();
 }
 public function test_resource_state_is_owned_and_text_download_is_real():void {
  $c=$this->resource();$user=User::factory()->create();Sanctum::actingAs($user);
  $this->patchJson('/api/library/resources/'.$c->id.'/state',['bookmarked'=>true])->assertOk()->assertJsonPath('items.0.bookmarked',true);
  $this->get('/api/library/resources/'.$c->id.'/file')->assertOk()->assertDownload('speed-notes.txt');
  Sanctum::actingAs(User::factory()->create());
  $this->getJson('/api/library/account-state')->assertJsonCount(0,'items');
 }
 public function test_notification_preferences_are_respected_and_private():void {
  $student=User::factory()->create(['role'=>'student']);Sanctum::actingAs($student);
  $this->patchJson('/api/notifications/preferences',['id'=>'announcements','enabled'=>false])->assertOk();
  Sanctum::actingAs(User::factory()->create(['role'=>'admin']));
  $this->postJson('/api/admin/announcements',['title'=>'Notice','message'=>'New resource','role'=>'student'])->assertOk()->assertJsonPath('recipients',0);
  $student->notify(new StudentNotification('Private notice','For owner only'));
  $notice=$student->notifications()->first();
  $this->deleteJson('/api/notifications/'.$notice->id)->assertNotFound();
  $this->patchJson('/api/notifications/'.$notice->id.'/read')->assertNotFound();
  Sanctum::actingAs($student);
  $this->patchJson('/api/notifications/'.$notice->id.'/read')->assertOk()->assertJsonPath('unreadCount',0);
  $this->deleteJson('/api/notifications/'.$notice->id)->assertOk();
 }
 public function test_password_change_requires_current_password_and_revokes_other_tokens():void {
  $u=User::factory()->create(['password'=>'oldPassword123!']);
  $first=$u->createToken('current');$u->createToken('other');
  $this->withToken($first->plainTextToken)->putJson('/api/profile/password',['current_password'=>'wrong','password'=>'newPassword123!','password_confirmation'=>'newPassword123!'])->assertUnprocessable();
  $this->withToken($first->plainTextToken)->putJson('/api/profile/password',['current_password'=>'oldPassword123!','password'=>'newPassword123!','password_confirmation'=>'newPassword123!'])->assertOk();
  $this->assertEquals(1,$u->tokens()->count());
  $this->assertTrue(\Illuminate\Support\Facades\Hash::check('newPassword123!',$u->fresh()->password));
 }
}
