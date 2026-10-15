<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lesson extends Model
{
    public function scopePublished($query)
    {
        return $query->where('is_active', true)
            ->where('is_published', true)
            ->whereHas('chapter', fn ($q) => $q->where('is_active', true)
                ->whereHas('unit', fn ($q) => $q->where('is_active', true)
                    ->whereHas('subject', fn ($q) => $q->where('is_active', true)
                        ->whereHas('grade', fn ($q) => $q->where('is_active', true)
                            ->whereHas('board', fn ($q) => $q->where('is_active', true))))));
    }

    public function scopeAccessibleTo($query, User $user)
    {
        if (!in_array($user->role, ['student', 'teacher'], true)) {
            return $query;
        }

        if ($user->approval_status !== 'approved') {
            return $query->whereRaw('1 = 0');
        }

        if ($user->hasLegacyClassAccess()) {
            return $query;
        }

        $assignedGrades = \Illuminate\Support\Facades\DB::table('grade_user')
            ->select('grade_id')
            ->where('user_id', $user->id);

        return $query->whereHas(
            'chapter.unit.subject',
            fn ($subject) =>
                $subject->whereIn(
                    'subjects.grade_id',
                    $assignedGrades
                )
        );
    }

    protected $fillable = [
        'created_by',
        'chapter_id',
        'title',
        'slug',
        'lesson_number',
        'summary',
        'duration',
        'display_order',
        'is_published',
        'is_active',
    ];

    protected $casts = [
        'lesson_number' => 'integer',
        'duration' => 'integer',
        'display_order' => 'integer',
        'is_published' => 'boolean',
        'is_active' => 'boolean',
    ];

    /**
     * Lesson belongs to a chapter.
     */
    public function chapter()
    {
        return $this->belongsTo(Chapter::class);
    }

    /**
     * Lesson has many lesson contents.
     */
    public function contents()
    {
        return $this->hasMany(LessonContent::class);
    }

    /**
     * Lesson has many interactive apps.
     */
    public function interactiveApps()
    {
        return $this->hasMany(InteractiveApp::class);
    }

    /**
     * Lesson has many curriculum flashcard decks.
     */
    public function flashcardDecks()
    {
        return $this->hasMany(FlashcardDeck::class);
    }
}
