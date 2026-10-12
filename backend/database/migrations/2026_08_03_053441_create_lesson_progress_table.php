<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_progress', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('lesson_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->boolean('is_completed')
                ->default(false);

            $table->timestamp('started_at')
                ->nullable();

            $table->timestamp('last_opened_at')
                ->nullable();

            $table->timestamp('completed_at')
                ->nullable();

            $table->timestamps();

            $table->unique(
                ['user_id', 'lesson_id'],
                'lesson_progress_user_lesson_unique'
            );

            $table->index(
                ['user_id', 'last_opened_at']
            );

            $table->index(
                ['user_id', 'is_completed']
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_progress');
    }
};