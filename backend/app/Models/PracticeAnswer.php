<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PracticeAnswer extends Model
{
    protected $fillable = [
        'practice_attempt_id',
        'practice_question_id',
        'practice_option_id',
        'is_correct',
        'marks_awarded',
        'time_spent_seconds',
        'answered_at',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'marks_awarded' => 'decimal:2',
        'time_spent_seconds' => 'integer',
        'answered_at' => 'datetime',
    ];

    public function attempt()
    {
        return $this->belongsTo(
            PracticeAttempt::class,
            'practice_attempt_id'
        );
    }

    public function question()
    {
        return $this->belongsTo(
            PracticeQuestion::class,
            'practice_question_id'
        );
    }

    public function option()
    {
        return $this->belongsTo(
            PracticeOption::class,
            'practice_option_id'
        );
    }
}