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
        Schema::create('grades', function (Blueprint $table) {
            $table->id();

            $table->foreignId('board_id')
                ->constrained('boards')
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('code')->nullable();

            $table->unsignedTinyInteger('grade_number');

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->unique(['board_id', 'grade_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('grades');
    }
};
