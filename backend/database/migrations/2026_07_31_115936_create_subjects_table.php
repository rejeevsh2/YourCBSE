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
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();

            $table->foreignId('grade_id')
                ->constrained('grades')
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('code')->nullable();

            $table->string('icon')->nullable();
            $table->string('color')->nullable();

            $table->unsignedTinyInteger('display_order')->default(1);

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->unique(['grade_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
