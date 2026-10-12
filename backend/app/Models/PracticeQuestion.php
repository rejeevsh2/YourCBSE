<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PracticeQuestion extends Model
{
    protected $fillable = [
        'practice_set_id',
        'question_text',
        'question_type',
        'explanation',
        'image_url',
        'difficulty',
        'marks',
        'negative_marks',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'marks' => 'decimal:2',
        'negative_marks' => 'decimal:2',
        'display_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function practiceSet()
    {
        return $this->belongsTo(PracticeSet::class);
    }

    public function options()
    {
        return $this->hasMany(PracticeOption::class)
            ->orderBy('display_order');
    }

    public function answers()
    {
        return $this->hasMany(PracticeAnswer::class);
    }
}