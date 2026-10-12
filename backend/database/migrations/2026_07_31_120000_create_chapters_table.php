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
        Schema::create('chapters', function (Blueprint $table) {
            $table->id();

            $table->foreignId('unit_id')
                ->constrained('units')
                ->cascadeOnDelete();

            $table->string('title');
            $table->string('code')->nullable();

            $table->unsignedTinyInteger('chapter_number');

            $table->text('description')->nullable();

            $table->unsignedTinyInteger('display_order')->default(1);

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->unique(['unit_id', 'chapter_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chapters');
    }
};
