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
        Schema::create('practice_questions', function (Blueprint $table) {
            $table->id();

            /*
             * Parent practice set
             */
            $table->foreignId('practice_set_id')
                ->constrained()
                ->cascadeOnDelete();

            /*
             * Question content
             */
            $table->text('question_text');

            /*
             * Examples:
             * mcq_single
             * mcq_multiple
             * true_false
             *
             * We will start with mcq_single.
             */
            $table->string('question_type')
                ->default('mcq_single');

            /*
             * Optional explanation shown after
             * submission/review.
             */
            $table->text('explanation')
                ->nullable();

            /*
             * Optional image for diagrams,
             * graphs, geometry, science etc.
             */
            $table->string('image_url')
                ->nullable();

            /*
             * Difficulty:
             * easy / medium / hard
             */
            $table->string('difficulty')
                ->default('medium');

            /*
             * Marks can override the
             * practice-set default.
             */
            $table->decimal('marks', 8, 2)
                ->nullable();

            $table->decimal(
                'negative_marks',
                8,
                2
            )->nullable();

            /*
             * Question ordering.
             */
            $table->unsignedInteger('display_order')
                ->default(0);

            /*
             * Allows a question to be hidden
             * without deleting historical data.
             */
            $table->boolean('is_active')
                ->default(true);

            $table->timestamps();

            $table->index([
                'practice_set_id',
                'is_active',
                'display_order',
            ]);

            $table->index('question_type');
            $table->index('difficulty');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('practice_questions');
    }
};