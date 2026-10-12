<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InteractiveApp extends Model
{
    protected $fillable = [
        'lesson_id',
        'title',
        'description',
        'source_type',
        'file_path',
        'external_url',
        'entry_url',
        'version',
        'display_order',
        'is_published',
        'is_active',
    ];

    protected $casts = [
        'display_order' => 'integer',
        'is_published' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Interactive app belongs to a lesson.
     */
    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
