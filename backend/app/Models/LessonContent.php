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
        'file_disk',
        'file_object_key',
        'file_mime_type',
        'file_size_bytes',
        'external_url',
        'display_order',
        'is_free',
        'is_active',
    ];

    protected $hidden = ['file_disk', 'file_object_key'];

    protected $appends = ['has_uploaded_file'];

    public function getHasUploadedFileAttribute(): bool
    {
        return (bool) ($this->file_path || $this->file_object_key);
    }

    protected $casts = [
        'display_order' => 'integer',
        'is_free' => 'boolean',
        'is_active' => 'boolean',
        'file_size_bytes' => 'integer',
    ];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}