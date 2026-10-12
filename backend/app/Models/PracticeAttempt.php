<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PracticeAttempt extends Model
{
    protected $fillable = [
        'user_id',
        'practice_set_id',
        'status',
        'total_questions',
        'answered_questions',
        'correct_answers',
        'wrong_answers',
        'score',
        'max_score',
        'percentage',
        'started_at',
        'submitted_at',
        'time_spent_seconds',
    ];

    protected $casts = [
        'total_questions' => 'integer',
        'answered_questions' => 'integer',
        'correct_answers' => 'integer',
        'wrong_answers' => 'integer',
        'score' => 'decimal:2',
        'max_score' => 'decimal:2',
        'percentage' => 'decimal:2',
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'time_spent_seconds' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function practiceSet()
    {
        return $this->belongsTo(PracticeSet::class);
    }

    public function answers()
    {
        return $this->hasMany(PracticeAnswer::class);
    }
}