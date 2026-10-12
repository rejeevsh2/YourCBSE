<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();

            $table->string('ticket_number', 30)
                ->nullable()
                ->unique();

            $table->foreignId('requester_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('requester_name');
            $table->string('requester_email')->nullable();
            $table->string('requester_role', 30)->nullable();

            $table->string('subject');
            $table->text('message');

            $table->string('category', 50)
                ->default('general');

            $table->string('priority', 20)
                ->default('normal');

            $table->string('status', 30)
                ->default('open');

            $table->foreignId('assigned_to')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('first_responded_at')
                ->nullable();

            $table->timestamp('resolved_at')
                ->nullable();

            $table->timestamp('closed_at')
                ->nullable();

            $table->timestamps();

            $table->index('status');
            $table->index('priority');
            $table->index('category');
            $table->index('requester_id');
            $table->index('assigned_to');
            $table->index('created_at');
        });

        Schema::create('support_ticket_messages', function (Blueprint $table) {
            $table->id();

            $table->foreignId('support_ticket_id')
                ->constrained('support_tickets')
                ->cascadeOnDelete();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->string('sender_name');
            $table->string('sender_role', 30)->nullable();

            $table->text('message');

            $table->boolean('is_internal')
                ->default(false);

            $table->timestamps();

            $table->index([
                'support_ticket_id',
                'created_at'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_ticket_messages');
        Schema::dropIfExists('support_tickets');
    }
};