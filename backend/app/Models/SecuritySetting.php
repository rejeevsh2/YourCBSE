<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SecuritySetting extends Model
{
    protected $fillable = [
        'failed_login_lockout_enabled',
        'failed_login_max_attempts',
        'failed_login_window_minutes',
        'failed_login_lockout_minutes',
        'admin_ip_restriction_enabled',
        'allowed_admin_ips',
        'security_alerts_enabled',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'failed_login_lockout_enabled' => 'boolean',
            'failed_login_max_attempts' => 'integer',
            'failed_login_window_minutes' => 'integer',
            'failed_login_lockout_minutes' => 'integer',
            'admin_ip_restriction_enabled' => 'boolean',
            'allowed_admin_ips' => 'array',
            'security_alerts_enabled' => 'boolean',
        ];
    }

    public function updatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public static function current(): self
    {
        return static::query()->firstOrCreate(
            ['id' => 1],
            [
                'failed_login_lockout_enabled' => true,
                'failed_login_max_attempts' => 5,
                'failed_login_window_minutes' => 15,
                'failed_login_lockout_minutes' => 1440,
                'admin_ip_restriction_enabled' => false,
                'allowed_admin_ips' => null,
                'security_alerts_enabled' => true,
            ]
        );
    }
}