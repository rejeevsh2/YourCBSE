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
        Schema::create('practice_options', function (Blueprint $table) {
            $table->id();

            /*
             * Parent question
             */
            $table->foreignId('practice_question_id')
                ->constrained()
                ->cascadeOnDelete();

            /*
             * Option text
             */
            $table->text('option_text');

            /*
             * Optional image for image-based
             * answer choices.
             */
            $table->string('image_url')
                ->nullable();

            /*
             * Marks the correct option.
             *
             * For mcq_single, normally exactly
             * one option will be correct.
             *
             * Future mcq_multiple questions may
             * have more than one correct option.
             */
            $table->boolean('is_correct')
                ->default(false);

            /*
             * Controls option ordering.
             */
            $table->unsignedInteger('display_order')
                ->default(0);

            /*
             * Allows an option to be disabled
             * without deleting historical data.
             */
            $table->boolean('is_active')
                ->default(true);

            $table->timestamps();

            $table->index(
    [
        'practice_question_id',
        'is_active',
        'display_order',
    ],
    'po_question_active_order_idx'
);

$table->index(
    [
        'practice_question_id',
        'is_correct',
    ],
    'po_question_correct_idx'
);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('practice_options');
    }
};