<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PracticeOption extends Model
{
    protected $fillable = [
        'practice_question_id',
        'option_text',
        'image_url',
        'is_correct',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'display_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function question()
    {
        return $this->belongsTo(
            PracticeQuestion::class,
            'practice_question_id'
        );
    }

    public function answers()
    {
        return $this->hasMany(
            PracticeAnswer::class,
            'practice_option_id'
        );
    }
}