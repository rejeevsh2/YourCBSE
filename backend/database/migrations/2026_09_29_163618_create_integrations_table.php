<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('integrations', function (Blueprint $table) {
            $table->id();

            $table->string('slug', 80)->unique();
            $table->string('name');
            $table->string('category', 50);
            $table->string('provider', 80)->nullable();
            $table->text('description')->nullable();

            $table->boolean('is_enabled')->default(false);

            $table->string(
                'connection_status',
                30
            )->default('not_configured');

            $table->json('settings')->nullable();

            /*
             * Sensitive credentials are stored encrypted
             * by the Integration model.
             */
            $table->longText('credentials')->nullable();

            $table->string(
                'last_test_status',
                30
            )->nullable();

            $table->text(
                'last_test_message'
            )->nullable();

            $table->timestamp(
                'last_tested_at'
            )->nullable();

            $table->timestamp(
                'connected_at'
            )->nullable();

            $table->foreignId(
                'updated_by'
            )
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamps();

            $table->index([
                'category',
                'is_enabled',
            ]);

            $table->index(
                'connection_status'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('integrations');
    }
};