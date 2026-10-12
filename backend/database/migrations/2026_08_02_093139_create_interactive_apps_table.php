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
        Schema::create('interactive_apps', function (Blueprint $table) {
            $table->id();

            // Each interactive app belongs to a lesson.
            $table->foreignId('lesson_id')
                ->constrained('lessons')
                ->cascadeOnDelete();

            $table->string('title');
            $table->text('description')->nullable();

            // html, zip or external
            $table->enum('source_type', [
                'html',
                'zip',
                'external',
            ]);

            // Uploaded HTML/ZIP path
            $table->string('file_path')->nullable();

            // URL for external interactive apps
            $table->string('external_url')->nullable();

            // Entry point after extracting/building an app
            $table->string('entry_url')->nullable();

            // Version information
            $table->string('version')->default('1.0');

            $table->unsignedSmallInteger('display_order')->default(1);

            // Draft / published state
            $table->boolean('is_published')->default(false);

            // Enable / disable without deleting
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index(['lesson_id', 'display_order']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interactive_apps');
    }
};
