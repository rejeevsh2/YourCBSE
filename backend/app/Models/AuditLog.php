<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'actor_user_id',
        'actor_name',
        'actor_email',
        'actor_role',
        'action',
        'target',
        'method',
        'route_uri',
        'route_parameters',
        'changed_fields',
        'ip_address',
        'user_agent',
        'response_status',
        'occurred_at',
    ];

    protected function casts(): array
    {
        return [
            'actor_user_id' => 'integer',
            'route_parameters' => 'array',
            'changed_fields' => 'array',
            'response_status' => 'integer',
            'occurred_at' => 'datetime',
        ];
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'actor_user_id'
        );
    }
}