<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media_assets', function (Blueprint $table) {
            $table->id();

            $table->foreignId('uploaded_by')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('name');

            $table->string('original_name');

            $table->string('file_name');

            $table->string('kind', 30);

            $table->string('mime_type', 150)
                ->nullable();

            $table->string('extension', 20)
                ->nullable();

            $table->string('disk', 50)
                ->default('public');

            $table->string('path');

            $table->unsignedBigInteger('size_bytes')
                ->default(0);

            $table->string('alt_text')
                ->nullable();

            $table->unsignedInteger('usage_count')
                ->default(0);

            $table->boolean('is_active')
                ->default(true);

            $table->json('metadata')
                ->nullable();

            $table->timestamps();

            $table->index('kind');
            $table->index('uploaded_by');
            $table->index('is_active');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('media_assets');
    }
};