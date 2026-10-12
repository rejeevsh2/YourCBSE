<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BlockedIp extends Model
{
    protected $fillable = [
        'ip_address',
        'source',
        'reason',
        'is_active',
        'blocked_until',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'blocked_until' => 'datetime',
        ];
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function isCurrentlyBlocked(): bool
    {
        if (!$this->is_active) {
            return false;
        }

        return $this->blocked_until === null
            || $this->blocked_until->isFuture();
    }
}