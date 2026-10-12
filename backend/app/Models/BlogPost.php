<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class BlogPost extends Model
{
    protected $fillable = [
        'author_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'category',
        'featured_image',
        'status',
        'read_minutes',
        'is_featured',
        'published_at',
    ];

    protected $casts = [
        'author_id' => 'integer',
        'read_minutes' => 'integer',
        'is_featured' => 'boolean',
        'published_at' => 'datetime',
    ];

    public function author()
    {
        return $this->belongsTo(
            User::class,
            'author_id'
        );
    }

    public function scopePublished(
        Builder $query
    ): Builder {
        return $query
            ->where(
                'status',
                'published'
            )
            ->whereNotNull(
                'published_at'
            )
            ->where(
                'published_at',
                '<=',
                now()
            );
    }
}