<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blog_posts', function (Blueprint $table) {
            $table->id();

            $table->foreignId('author_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('title');

            $table->string('slug')
                ->unique();

            $table->text('excerpt')
                ->nullable();

            $table->longText('content');

            $table->string('category')
                ->nullable();

            $table->string('featured_image')
                ->nullable();

            $table->string('status', 30)
                ->default('draft');

            $table->unsignedSmallInteger('read_minutes')
                ->default(5);

            $table->boolean('is_featured')
                ->default(false);

            $table->timestamp('published_at')
                ->nullable();

            $table->timestamps();

            $table->index([
                'status',
                'published_at',
            ]);

            $table->index('category');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blog_posts');
    }
};
