<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RevisionSession extends Model
{
    protected $fillable = [
        'card_ids',
        'reviewed_ids',
        'user_id',
        'subject_id',
        'chapter_id',
        'mode',
        'difficulty',
        'total_cards',
        'completed_cards',
        'score',
        'status',
        'started_at',
        'finished_at',
    ];

    protected function casts(): array
    {
        return [
            'card_ids' => 'array',
            'reviewed_ids' => 'array',
            'started_at' => 'datetime',
            'finished_at' => 'datetime',
        ];
    }

    /**
     * Student who owns this revision session.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Subject being revised.
     */
    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    /**
     * Chapter being revised.
     */
    public function chapter(): BelongsTo
    {
        return $this->belongsTo(Chapter::class);
    }
}