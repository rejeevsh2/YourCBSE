<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up():void{Schema::table('users',fn(Blueprint $t)=>$t->json('notification_preferences')->nullable());}
 public function down():void{Schema::table('users',fn(Blueprint $t)=>$t->dropColumn('notification_preferences'));}
};
