<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MediaAsset extends Model
{
    protected $fillable = [
        'uploaded_by',
        'name',
        'original_name',
        'file_name',
        'kind',
        'mime_type',
        'extension',
        'disk',
        'path',
        'size_bytes',
        'alt_text',
        'usage_count',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'uploaded_by' => 'integer',
        'size_bytes' => 'integer',
        'usage_count' => 'integer',
        'is_active' => 'boolean',
        'metadata' => 'array',
    ];

    protected $appends = [
        'url',
    ];

    public function uploader()
    {
        return $this->belongsTo(
            User::class,
            'uploaded_by'
        );
    }

    public function getUrlAttribute(): ?string
    {
        if (!$this->path) {
            return null;
        }

        if ($this->disk === 'public') {
            return asset(
                'storage/' . ltrim(
                    $this->path,
                    '/'
                )
            );
        }

        return null;
    }
}