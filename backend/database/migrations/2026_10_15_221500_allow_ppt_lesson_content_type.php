<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The original column is a database ENUM (SQLite CHECK constraint).
        // Store an ordinary string so supported types can be extended safely,
        // while API validation continues to restrict accepted values.
        Schema::table('lesson_contents', function (Blueprint $table) {
            $table->string('content_type', 40)->change();
        });
    }

    public function down(): void
    {
        // Do not silently change or discard existing presentations.
        if (DB::table('lesson_contents')->where('content_type', 'ppt')->exists()) {
            throw new RuntimeException(
                'Remove or recategorize PPT lesson content before rolling this migration back.'
            );
        }

        Schema::table('lesson_contents', function (Blueprint $table) {
            $table->enum('content_type', [
                'text', 'video', 'pdf', 'image',
                'audio', 'quiz', 'worksheet', 'activity',
            ])->change();
        });
    }
};
