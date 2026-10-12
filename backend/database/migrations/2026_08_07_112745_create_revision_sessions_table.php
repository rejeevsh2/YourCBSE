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
        Schema::create('revision_sessions', function (Blueprint $table) {

            $table->id();

            /*
             * Student taking the revision session.
             */
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            /*
             * Subject being revised.
             */
            $table->foreignId('subject_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            /*
             * Optional chapter focus.
             */
            $table->foreignId('chapter_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();

            /*
             * Revision mode.
             *
             * flashcards
             * questions
             * mixed
             * definitions
             * formulas
             */
            $table->string('mode', 30);

            /*
             * Difficulty selected.
             */
            $table->string('difficulty', 20)
                ->default('adaptive');

            /*
             * Session progress.
             */
            $table->unsignedInteger('total_cards')
                ->default(0);

            $table->unsignedInteger('completed_cards')
                ->default(0);

            /*
             * Student score.
             */
            $table->unsignedInteger('score')
                ->default(0);

            /*
             * Session status.
             */
            $table->string('status', 20)
                ->default('active');

            /*
             * Timing.
             */
            $table->timestamp('started_at')
                ->nullable();

            $table->timestamp('finished_at')
                ->nullable();

            $table->timestamps();

            $table->index(
                ['user_id', 'status'],
                'revision_sessions_user_status_idx'
            );

            $table->index(
                ['user_id', 'started_at'],
                'revision_sessions_user_started_idx'
            );
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('revision_sessions');
    }
};