<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Unit extends Model
{
    protected $fillable = [
        'subject_id',
        'title',
        'code',
        'unit_number',
        'description',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'unit_number' => 'integer',
        'display_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function chapters()
    {
        return $this->hasMany(Chapter::class);
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
            'subject',
            fn ($subject) =>
                $subject->whereIn(
                    'subjects.grade_id',
                    $assignedGrades
                )
        );
    }
}
