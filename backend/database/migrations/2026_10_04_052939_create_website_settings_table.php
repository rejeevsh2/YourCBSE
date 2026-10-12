<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('website_settings', function (Blueprint $table) {
            $table->id();
            $table->string('site_name', 120)->default('YourSchool');
            $table->string('site_domain', 255)->default('yourschool.co.in');
            $table->string('tagline', 255)->nullable();
            $table->text('default_meta_description')->nullable();
            $table->boolean('open_registration')->default(true);
            $table->boolean('chapter_comments')->default(false);
            $table->boolean('maintenance_mode')->default(false);
            $table->timestamps();
        });

        DB::table('website_settings')->insert([
            'id' => 1,
            'site_name' => 'YourSchool',
            'site_domain' => 'yourschool.co.in',
            'tagline' => 'Everything You Need to Succeed in CBSE.',
            'default_meta_description' => 'Chapter-wise CBSE notes, video lessons, worksheets and interactive practice for Classes 6 to 12.',
            'open_registration' => true,
            'chapter_comments' => false,
            'maintenance_mode' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('website_settings');
    }
};