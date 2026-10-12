<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RevisionItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'lesson_id',
        'type',
        'title',
        'content',
        'strength',
        'review_count',
        'last_reviewed_at',
        'next_review_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'strength' => 'integer',
            'review_count' => 'integer',
            'last_reviewed_at' => 'datetime',
            'next_review_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lesson(): BelongsTo
    {
        return $this->belongsTo(Lesson::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(RevisionReview::class);
    }
}