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
        Schema::create('units', function (Blueprint $table) {
            $table->id();

            $table->foreignId('subject_id')
                ->constrained('subjects')
                ->cascadeOnDelete();

            $table->string('title');
            $table->string('code')->nullable();

            $table->unsignedTinyInteger('unit_number');

            $table->text('description')->nullable();

            $table->unsignedTinyInteger('display_order')->default(1);

            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->unique(['subject_id', 'unit_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
