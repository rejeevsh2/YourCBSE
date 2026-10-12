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
        Schema::create('lessons', function (Blueprint $table) {
            $table->id();

            $table->foreignId('chapter_id')
                ->constrained('chapters')
                ->cascadeOnDelete();

            $table->string('title');
            $table->string('slug')->unique();

            $table->unsignedTinyInteger('lesson_number');

            $table->text('summary')->nullable();

            $table->unsignedTinyInteger('duration')->nullable();

            $table->unsignedTinyInteger('display_order')->default(1);

            $table->boolean('is_published')->default(false);

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->unique(['chapter_id', 'lesson_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lessons');
    }
};
