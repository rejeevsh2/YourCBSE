<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('revision_items', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('lesson_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('type', 50)
                ->default('flashcard');

            $table->string('title');

            $table->text('content')
                ->nullable();

            $table->unsignedTinyInteger('strength')
                ->default(0);

            $table->unsignedInteger('review_count')
                ->default(0);

            $table->timestamp('last_reviewed_at')
                ->nullable();

            $table->timestamp('next_review_at')
                ->nullable();

            $table->boolean('is_active')
                ->default(true);

            $table->timestamps();

            $table->index(
                [
                    'user_id',
                    'is_active',
                    'next_review_at',
                ],
                'revision_items_user_due_idx'
            );

            $table->index(
                [
                    'lesson_id',
                    'type',
                ],
                'revision_items_lesson_type_idx'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revision_items');
    }
};