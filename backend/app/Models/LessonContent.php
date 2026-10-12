<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LessonContent extends Model
{
    protected $fillable = [
        'lesson_id',
        'title',
        'content_type',
        'resource_category',
        'content',
        'file_path',
        'external_url',
        'display_order',
        'is_free',
        'is_active',
    ];

    protected $casts = [
        'display_order' => 'integer',
        'is_free' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}