<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            $table->foreignId('actor_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * Actor snapshot.
             * These values remain useful even if the user
             * is renamed or later removed.
             */
            $table->string('actor_name')->nullable();
            $table->string('actor_email')->nullable();
            $table->string('actor_role', 50)->nullable();

            /*
             * What happened.
             */
            $table->string('action', 50);
            $table->string('target');
            $table->string('method', 10);
            $table->string('route_uri')->nullable();

            /*
             * We deliberately store field names rather than
             * submitted field values to avoid placing passwords,
             * tokens, secrets or private form data in the audit trail.
             */
            $table->json('route_parameters')->nullable();
            $table->json('changed_fields')->nullable();

            /*
             * Request / response context.
             */
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->unsignedSmallInteger('response_status');

            $table->timestamp('occurred_at')->useCurrent();

            $table->index([
                'actor_user_id',
                'occurred_at',
            ]);

            $table->index([
                'action',
                'occurred_at',
            ]);

            $table->index('occurred_at');
            $table->index('response_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};