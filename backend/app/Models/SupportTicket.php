<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupportTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'ticket_number',
        'requester_id',
        'requester_name',
        'requester_email',
        'requester_role',
        'subject',
        'message',
        'category',
        'priority',
        'status',
        'assigned_to',
        'first_responded_at',
        'resolved_at',
        'closed_at',
    ];

    protected function casts(): array
    {
        return [
            'first_responded_at' => 'datetime',
            'resolved_at' => 'datetime',
            'closed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::created(function (SupportTicket $ticket) {
            if ($ticket->ticket_number) {
                return;
            }

            $date = $ticket->created_at?->format('Ymd')
                ?? now()->format('Ymd');

            $ticket->forceFill([
                'ticket_number' => sprintf(
                    'YT-%s-%06d',
                    $date,
                    $ticket->id
                ),
            ])->saveQuietly();
        });
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'requester_id'
        );
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'assigned_to'
        );
    }

    public function messages(): HasMany
    {
        return $this->hasMany(
            SupportTicketMessage::class
        )->orderBy('created_at');
    }
}