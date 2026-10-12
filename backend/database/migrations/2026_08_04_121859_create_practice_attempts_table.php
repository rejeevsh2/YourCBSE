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
        Schema::create('practice_attempts', function (Blueprint $table) {
            $table->id();

            /*
             * Student taking the practice set.
             */
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            /*
             * Practice set being attempted.
             */
            $table->foreignId('practice_set_id')
                ->constrained()
                ->cascadeOnDelete();

            /*
             * Attempt state:
             * in_progress / submitted
             */
            $table->string('status')
                ->default('in_progress');

            /*
             * Question counts.
             */
            $table->unsignedInteger('total_questions')
                ->default(0);

            $table->unsignedInteger('answered_questions')
                ->default(0);

            $table->unsignedInteger('correct_answers')
                ->default(0);

            $table->unsignedInteger('wrong_answers')
                ->default(0);

            /*
             * Marks and percentage.
             */
            $table->decimal('score', 10, 2)
                ->default(0);

            $table->decimal('max_score', 10, 2)
                ->default(0);

            $table->decimal('percentage', 5, 2)
                ->default(0);

            /*
             * Timing.
             */
            $table->timestamp('started_at')
                ->nullable();

            $table->timestamp('submitted_at')
                ->nullable();

            /*
             * Total time spent in seconds.
             * Useful later for analytics.
             */
            $table->unsignedInteger('time_spent_seconds')
                ->nullable();

            $table->timestamps();

            $table->index([
                'user_id',
                'status',
            ]);

            $table->index([
                'user_id',
                'practice_set_id',
            ]);

            $table->index([
                'user_id',
                'submitted_at',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('practice_attempts');
    }
};