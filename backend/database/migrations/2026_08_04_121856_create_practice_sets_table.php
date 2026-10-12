<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('practice_sets', function (Blueprint $table) {
            $table->id();

            /*
             * Learning hierarchy
             */
            $table->foreignId('subject_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('unit_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('chapter_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            $table->foreignId('lesson_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            /*
             * Practice set information
             */
            $table->string('title');

            $table->string('slug')
                ->unique();

            $table->text('description')
                ->nullable();

            /*
             * Supported examples:
             * mcq
             * quiz
             * timed_quiz
             * mock_exam
             * previous_year
             */
            $table->string('type')
                ->default('mcq');

            /*
             * Optional timer in minutes.
             * Null means untimed.
             */
            $table->unsignedInteger('duration_minutes')
                ->nullable();

            /*
             * Marks configuration.
             */
            $table->decimal(
                'marks_per_question',
                8,
                2
            )->default(1);

            $table->decimal(
                'negative_marks',
                8,
                2
            )->default(0);

            /*
             * Behaviour
             */
            $table->boolean('shuffle_questions')
                ->default(false);

            $table->boolean('shuffle_options')
                ->default(false);

            $table->boolean('show_answers_after_submit')
                ->default(true);

            /*
             * Publishing
             */
            $table->boolean('is_published')
                ->default(false);

            $table->boolean('is_active')
                ->default(true);

            $table->unsignedInteger('display_order')
                ->default(0);

            $table->timestamps();

            /*
             * Helpful indexes for student queries.
             */
            $table->index([
                'subject_id',
                'is_published',
                'is_active',
            ]);

            $table->index([
                'chapter_id',
                'is_published',
            ]);

            $table->index([
                'lesson_id',
                'is_published',
            ]);

            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('practice_sets');
    }
};