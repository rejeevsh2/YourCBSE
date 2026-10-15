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
            'legacy_class_access' => 'boolean',
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

    /**
     * Temporary compatibility for approved users present before
     * class assignments were introduced.
     *
     * Any real class assignment restores normal class scoping.
     */
    public function hasLegacyClassAccess(): bool
    {
        return in_array($this->role, ['student', 'teacher'], true)
            && $this->approval_status === 'approved'
            && $this->legacy_class_access === true
            && ! $this->grades()->exists();
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(
            self::class,
            'approved_by'
        );
    }
}
