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
        Schema::create('practice_answers', function (Blueprint $table) {
            $table->id();

            /*
             * The student's overall attempt.
             */
            $table->foreignId('practice_attempt_id')
                ->constrained()
                ->cascadeOnDelete();

            /*
             * Question being answered.
             */
            $table->foreignId('practice_question_id')
                ->constrained()
                ->cascadeOnDelete();

            /*
             * Selected option.
             *
             * Nullable because the student may
             * leave a question unanswered.
             */
            $table->foreignId('practice_option_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            /*
             * Whether the submitted answer
             * was correct.
             */
            $table->boolean('is_correct')
                ->default(false);

            /*
             * Marks actually awarded.
             * Can include negative marking.
             */
            $table->decimal('marks_awarded', 8, 2)
                ->default(0);

            /*
             * Useful for analytics and review.
             */
            $table->unsignedInteger('time_spent_seconds')
                ->nullable();

            $table->timestamp('answered_at')
                ->nullable();

            $table->timestamps();

            /*
             * One answer record per question
             * inside an attempt.
             */
            $table->unique(
    [
        'practice_attempt_id',
        'practice_question_id',
    ],
    'pa_attempt_question_unique'
);

$table->index(
    [
        'practice_attempt_id',
        'is_correct',
    ],
    'pa_attempt_correct_idx'
);

$table->index(
    'practice_question_id',
    'pa_question_idx'
);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('practice_answers');
    }
};