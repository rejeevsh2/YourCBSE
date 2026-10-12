<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::table('users',fn(Blueprint $t)=>$t->text('bio')->nullable());
        Schema::create('planner_tasks',function(Blueprint $t){
            $t->id();$t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->string('title');$t->text('notes')->nullable();$t->date('due_date');
            $t->unsignedSmallInteger('minutes')->default(30);$t->string('category',20)->default('Learn');
            $t->boolean('done')->default(false);$t->timestamps();$t->index(['user_id','due_date']);
        });
        Schema::create('resource_states',function(Blueprint $t){
            $t->id();$t->foreignId('user_id')->constrained()->cascadeOnDelete();
            $t->foreignId('lesson_content_id')->constrained()->cascadeOnDelete();
            $t->boolean('bookmarked')->default(false);$t->timestamp('downloaded_at')->nullable();
            $t->timestamp('viewed_at')->nullable();$t->timestamps();
            $t->unique(['user_id','lesson_content_id']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('resource_states');Schema::dropIfExists('planner_tasks');
        Schema::table('users',fn(Blueprint $t)=>$t->dropColumn('bio'));
    }
};
