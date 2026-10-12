<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FlashcardDeck extends Model
{
    protected $fillable = [
        'lesson_id',
        'created_by',
        'title',
        'description',
        'display_order',
        'is_published',
        'is_active',
    ];

    protected $casts = [
        'display_order' => 'integer',
        'is_published' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function cards()
    {
        return $this->hasMany(Flashcard::class)
            ->orderBy('display_order')
            ->orderBy('id');
    }
}
