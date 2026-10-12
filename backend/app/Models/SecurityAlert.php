<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SecurityAlert extends Model
{
    protected $fillable = [
        'type',
        'title',
        'severity',
        'detail',
        'ip_address',
        'user_id',
        'login_event_id',
        'metadata',
        'status',
        'resolved_at',
        'resolved_by',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'resolved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function loginEvent(): BelongsTo
    {
        return $this->belongsTo(LoginEvent::class);
    }

    public function resolvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }
}