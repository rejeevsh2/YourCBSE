<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RevisionReview extends Model
{
    use HasFactory;

    protected $fillable = [
        'revision_item_id',
        'user_id',
        'rating',
        'strength_before',
        'strength_after',
        'time_spent_seconds',
        'reviewed_at',
        'next_review_at',
    ];

    protected function casts(): array
    {
        return [
            'strength_before' => 'integer',
            'strength_after' => 'integer',
            'time_spent_seconds' => 'integer',
            'reviewed_at' => 'datetime',
            'next_review_at' => 'datetime',
        ];
    }

    public function revisionItem(): BelongsTo
    {
        return $this->belongsTo(RevisionItem::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}