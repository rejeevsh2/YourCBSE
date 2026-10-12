<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Flashcard extends Model
{
    protected $fillable = [
        'flashcard_deck_id',
        'front',
        'back',
        'display_order',
        'is_active',
    ];

    protected $casts = [
        'display_order' => 'integer',
        'is_active' => 'boolean',
    ];

    public function deck()
    {
        return $this->belongsTo(
            FlashcardDeck::class,
            'flashcard_deck_id'
        );
    }
}