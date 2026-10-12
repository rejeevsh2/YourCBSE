<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parent_student', function (Blueprint $table) {
            $table->id();

            $table->foreignId('parent_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('student_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->string('relationship', 50)
                ->nullable();

            $table->boolean('is_primary')
                ->default(false);

            $table->timestamps();

            $table->unique([
                'parent_id',
                'student_id',
            ]);

            $table->index([
                'student_id',
                'is_primary',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parent_student');
    }
};