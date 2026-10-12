<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void {
        Schema::table('revision_sessions', function (Blueprint $table) {
            $table->json('card_ids')->nullable();
            $table->json('reviewed_ids')->nullable();
        });
    }
    public function down(): void {
        Schema::table('revision_sessions', fn (Blueprint $table) => $table->dropColumn(['card_ids', 'reviewed_ids']));
    }
};
