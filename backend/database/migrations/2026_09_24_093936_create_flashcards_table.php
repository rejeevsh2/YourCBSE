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
        Schema::create('flashcards', function (Blueprint $table) {
            $table->id();

            $table->foreignId('flashcard_deck_id')
                ->constrained('flashcard_decks')
                ->cascadeOnDelete();

            $table->text('front');

            $table->text('back');

            $table->unsignedSmallInteger('display_order')
                ->default(1);

            $table->boolean('is_active')
                ->default(true);

            $table->timestamps();

            $table->index([
                'flashcard_deck_id',
                'is_active',
                'display_order',
            ]);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flashcards');
    }
};
