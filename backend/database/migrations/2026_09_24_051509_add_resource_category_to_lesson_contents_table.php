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
        Schema::table('lesson_contents', function (Blueprint $table) {
            $table->string('resource_category', 50)
                ->nullable()
                ->after('content_type')
                ->index();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lesson_contents', function (Blueprint $table) {
            $table->dropIndex(['resource_category']);
            $table->dropColumn('resource_category');
        });
    }
};