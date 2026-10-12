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
        Schema::create('lesson_contents', function (Blueprint $table) {
            $table->id();

            $table->foreignId('lesson_id')
                ->constrained('lessons')
                ->cascadeOnDelete();

            $table->string('title');

            $table->enum('content_type', [
                'text',
                'video',
                'pdf',
                'image',
                'audio',
                'quiz',
                'worksheet',
                'activity'
            ]);

            $table->longText('content')->nullable();

            $table->string('file_path')->nullable();

            $table->string('external_url')->nullable();

            $table->unsignedSmallInteger('display_order')->default(1);

            $table->boolean('is_free')->default(true);

            $table->boolean('is_active')->default(true);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lesson_contents');
    }
};
