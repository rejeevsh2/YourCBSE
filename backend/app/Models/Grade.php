<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Grade extends Model
{
    protected $fillable = [
        'board_id',
        'name',
        'code',
        'grade_number',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function board()
    {
        return $this->belongsTo(Board::class);
    }

    public function subjects()
    {
        return $this->hasMany(Subject::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withTimestamps();
    }

    public function scopeAccessibleTo($query, User $user)
    {
        if (!in_array($user->role, ['student', 'teacher'], true)) {
            return $query;
        }

        if ($user->approval_status !== 'approved') {
            return $query->whereRaw('1 = 0');
        }

        if ($user->hasLegacyClassAccess()) {
            return $query;
        }

        $assignedGrades = \Illuminate\Support\Facades\DB::table('grade_user')
            ->select('grade_id')
            ->where('user_id', $user->id);

        return $query->whereIn('grades.id', $assignedGrades);
    }
}
