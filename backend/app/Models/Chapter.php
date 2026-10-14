<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Chapter extends Model
{
    protected $fillable = [
        'unit_id',
        'title',
        'code',
        'chapter_number',
        'description',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'chapter_number' => 'integer',
        'display_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function lessons()
    {
        return $this->hasMany(Lesson::class);
    }

    public function scopeAccessibleTo($query, User $user)
    {
        if (!in_array($user->role, ['student', 'teacher'], true)) {
            return $query;
        }

        if ($user->approval_status !== 'approved') {
            return $query->whereRaw('1 = 0');
        }

        $assignedGrades = \Illuminate\Support\Facades\DB::table('grade_user')
            ->select('grade_id')
            ->where('user_id', $user->id);

        return $query->whereHas(
            'unit.subject',
            fn ($subject) =>
                $subject->whereIn(
                    'subjects.grade_id',
                    $assignedGrades
                )
        );
    }
}
