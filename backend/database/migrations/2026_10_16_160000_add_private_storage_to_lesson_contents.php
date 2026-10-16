<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lesson_contents', function (Blueprint $table) {
            $table->string('file_disk', 20)->nullable();
            $table->string('file_object_key', 512)->nullable();
            $table->string('file_mime_type', 150)->nullable();
            $table->unsignedBigInteger('file_size_bytes')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('lesson_contents', function (Blueprint $table) {
            $table->dropColumn([
                'file_disk', 'file_object_key', 'file_mime_type',
                'file_size_bytes',
            ]);
        });
    }
};
