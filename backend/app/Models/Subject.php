<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    protected $fillable = [
        'grade_id',
        'name',
        'code',
        'icon',
        'color',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function grade()
    {
        return $this->belongsTo(Grade::class);
    }

    public function units()
    {
        return $this->hasMany(Unit::class);
    }

    public function scopeAccessibleTo($query, User $user)
    {
        if (!in_array($user->role, ['student', 'teacher'], true)) {
            return $query;
        }

        if ($user->approval_status !== 'approved') {
            return $query->whereRaw('1 = 0');
        }

        return $query->whereHas(
            'grade.users',
            fn ($users) =>
                $users->where('users.id', $user->id)
        );
    }
}
