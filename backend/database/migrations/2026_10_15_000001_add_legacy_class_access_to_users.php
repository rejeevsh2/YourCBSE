<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('legacy_class_access')
                ->default(false);
        });

        // Preserve historical access only for approved
        // student/teacher accounts without any class assignment
        // at the time this migration is run.
        DB::table('users')
            ->whereIn('role', ['student', 'teacher'])
            ->where('approval_status', 'approved')
            ->whereNotExists(function ($query) {
                $query->selectRaw('1')
                    ->from('grade_user')
                    ->whereColumn('grade_user.user_id', 'users.id');
            })
            ->update([
                'legacy_class_access' => true,
            ]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('legacy_class_access');
        });
    }
};