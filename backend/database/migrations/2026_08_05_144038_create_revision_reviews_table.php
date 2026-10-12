<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('revision_reviews', function (Blueprint $table) {
            $table->id();

            $table->foreignId('revision_item_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('rating', 20);

            $table->unsignedTinyInteger('strength_before')
                ->default(0);

            $table->unsignedTinyInteger('strength_after')
                ->default(0);

            $table->unsignedInteger('time_spent_seconds')
                ->nullable();

            $table->timestamp('reviewed_at');

            $table->timestamp('next_review_at')
                ->nullable();

            $table->timestamps();

            $table->index(
                [
                    'user_id',
                    'reviewed_at',
                ],
                'revision_reviews_user_date_idx'
            );

            $table->index(
                [
                    'revision_item_id',
                    'reviewed_at',
                ],
                'revision_reviews_item_date_idx'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('revision_reviews');
    }
};