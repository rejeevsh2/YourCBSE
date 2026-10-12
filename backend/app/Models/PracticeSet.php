<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PracticeSet extends Model
{
    protected $fillable = [
        'subject_id',
        'unit_id',
        'chapter_id',
        'lesson_id',
        'title',
        'slug',
        'description',
        'type',
        'duration_minutes',
        'marks_per_question',
        'negative_marks',
        'shuffle_questions',
        'shuffle_options',
        'show_answers_after_submit',
        'is_published',
        'is_active',
        'display_order',
    ];

    protected $casts = [
        'duration_minutes' => 'integer',
        'marks_per_question' => 'decimal:2',
        'negative_marks' => 'decimal:2',
        'shuffle_questions' => 'boolean',
        'shuffle_options' => 'boolean',
        'show_answers_after_submit' => 'boolean',
        'is_published' => 'boolean',
        'is_active' => 'boolean',
        'display_order' => 'integer',
    ];

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function chapter()
    {
        return $this->belongsTo(Chapter::class);
    }

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function questions()
    {
        return $this->hasMany(PracticeQuestion::class);
    }

    public function attempts()
    {
        return $this->hasMany(PracticeAttempt::class);
    }
}