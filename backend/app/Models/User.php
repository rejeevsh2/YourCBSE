<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'mobile',
        'email',
        'role',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'approved_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if (
                in_array(
                    $user->role,
                    ['student', 'teacher'],
                    true
                ) &&
                empty($user->approval_status)
            ) {
                $user->approval_status =
                    'pending';
                $user->approved_at = null;
                $user->approved_by = null;
            }
        });
    }

    public function grades(): BelongsToMany
    {
        return $this->belongsToMany(Grade::class)
            ->withTimestamps();
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(
            self::class,
            'approved_by'
        );
    }
}
