<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('seo_pages', function (Blueprint $table) {
            $table->id();
            $table->string('path', 255)->unique();
            $table->string('title', 255);
            $table->text('meta_description')->nullable();
            $table->string('canonical_url', 500)->nullable();
            $table->boolean('is_indexed')->default(true);
            $table->timestamps();
        });

        $now = now();

        DB::table('seo_pages')->insert([
            [
                'path' => '/',
                'title' => 'YourTeacher - CBSE Learning Made Interactive',
                'meta_description' => 'Learn CBSE subjects with chapter-wise notes, lessons, worksheets, practice questions and interactive learning resources for Classes 6 to 12.',
                'canonical_url' => 'https://yourteacher.co.in/',
                'is_indexed' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'path' => '/grades',
                'title' => 'CBSE Classes 6 to 12 - YourTeacher',
                'meta_description' => 'Browse CBSE learning resources for Classes 6 to 12, including lessons, notes, worksheets, questions and interactive activities.',
                'canonical_url' => 'https://yourteacher.co.in/grades',
                'is_indexed' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'path' => '/subjects',
                'title' => 'CBSE Subjects and Chapters - YourTeacher',
                'meta_description' => 'Explore CBSE subjects, units, chapters and lessons with structured learning resources designed for students from Classes 6 to 12.',
                'canonical_url' => 'https://yourteacher.co.in/subjects',
                'is_indexed' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'path' => '/practice',
                'title' => 'CBSE Practice Questions and Tests - YourTeacher',
                'meta_description' => 'Practice CBSE questions, revision activities and assessments organised by class, subject and chapter on YourTeacher.',
                'canonical_url' => 'https://yourteacher.co.in/practice',
                'is_indexed' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'path' => '/resources',
                'title' => 'CBSE Notes, Worksheets and Resources - YourTeacher',
                'meta_description' => 'Access chapter-wise CBSE notes, worksheets, mind maps, flashcards and study resources for Classes 6 to 12.',
                'canonical_url' => 'https://yourteacher.co.in/resources',
                'is_indexed' => true,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('seo_pages');
    }
};