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
            $table->string('approval_status', 20)
                ->default('approved')
                ->after('role');

            $table->timestamp('approved_at')
                ->nullable()
                ->after('approval_status');

            $table->foreignId('approved_by')
                ->nullable()
                ->after('approved_at')
                ->constrained('users')
                ->nullOnDelete();
        });

        // Preserve access for every account that existed before approval
        // workflow was introduced. New public registrations explicitly set
        // approval_status to pending in the application layer.
        DB::table('users')
            ->where('approval_status', 'approved')
            ->whereNull('approved_at')
            ->update([
                'approved_at' => now(),
            ]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('approved_by');
            $table->dropColumn([
                'approved_at',
                'approval_status',
            ]);
        });
    }
};
