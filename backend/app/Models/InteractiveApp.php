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
     * An uploaded app launches through YourSchool auth, never a public
     * /storage link. The raw value still identifies its internal index.
     */
    public function getEntryUrlAttribute(?string $value): ?string
    {
        if (in_array($this->source_type, ['html', 'zip'], true) && $this->exists) {
            return '/interactive-app/' . $this->getKey();
        }

        return $value;
    }

    /**
     * Interactive app belongs to a lesson.
     */
    public function lesson()
    {
        return $this->belongsTo(Lesson::class);
    }
}
