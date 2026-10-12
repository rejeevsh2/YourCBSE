<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Integration extends Model
{
    protected $fillable = [
        'slug',
        'name',
        'category',
        'provider',
        'description',
        'is_enabled',
        'connection_status',
        'settings',
        'credentials',
        'last_test_status',
        'last_test_message',
        'last_tested_at',
        'connected_at',
        'updated_by',
    ];

    protected $hidden = [
        'credentials',
    ];

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'settings' => 'array',
            'credentials' => 'encrypted:array',
            'last_tested_at' => 'datetime',
            'connected_at' => 'datetime',
        ];
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'updated_by'
        );
    }
}