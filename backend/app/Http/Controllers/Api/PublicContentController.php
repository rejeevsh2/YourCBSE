<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Grade;
use App\Models\Subject;
use App\Models\Unit;
use App\Models\Chapter;
use App\Models\Lesson;

class PublicContentController extends Controller
{
    /**
     * Get all active boards.
     */
    public function boards()
    {
        return Board::where('is_active', true)
            ->orderBy('name')
            ->get();
    }

    /**
     * Get active grades for a board.
     */
    public function grades($boardId)
    {
        Board::where('is_active', true)->findOrFail($boardId);
        $grades = Grade::where('board_id', $boardId)
            ->where('is_active', true)
            ->with([
                'subjects' => function ($query) {
                    $query->where('is_active', true)
                        ->with([
                            'units' => function ($query) {
                                $query->where('is_active', true)
                                    ->with([
                                        'chapters' => function ($query) {
                                            $query->where('is_active', true);
                                        }
                                    ]);
                            }
                        ]);
                }
            ])
            ->orderBy('grade_number')
            ->get();

        return $grades->map(function ($grade) {

            $chapterCount = $grade->subjects
                ->flatMap->units
                ->flatMap->chapters
                ->count();

            $number = (int) $grade->grade_number;

            $level = match (true) {
                $number <= 5 => 'Primary',
                $number <= 8 => 'Middle',
                $number <= 10 => 'Secondary',
                default => 'Senior Secondary',
            };

            return [
                'id' => (string) $grade->id,
                'slug' => 'class-' . $number,
                'name' => 'Class ' . $number,
                'level' => $level,

                'subjectCount' => $grade->subjects->count(),
                'chapterCount' => $chapterCount,

                'videoCount' => 0,
                'questionCount' => 0,

                'description' =>
                    'CBSE Class ' . $number . ' learning resources.',
            ];
        })->values();
    }

    /**
     * Get active subjects for a grade.
     */
    public function subjects($gradeId)
    {
        Grade::where('is_active', true)->findOrFail($gradeId);
        $subjects = Subject::where('grade_id', $gradeId)
            ->where('is_active', true)
            ->with([
                'grade',
                'units' => function ($query) {
                    $query->where('is_active', true)
                        ->with([
                            'chapters' => function ($query) {
                                $query->where('is_active', true);
                            }
                        ]);
                }
            ])
            ->orderBy('display_order')
            ->get();

        return $subjects->map(function ($subject) {

            $chapterCount = $subject->units
                ->flatMap->chapters
                ->count();

            $gradeNumber =
                (int) $subject->grade->grade_number;

            return [
                'id' => (string) $subject->id,

                'slug' => strtolower(
                    str_replace(' ', '-', $subject->name)
                ),

                'name' => $subject->name,

                'grades' => [
                    'Class ' . $gradeNumber
                ],

                'chapterCount' => $chapterCount,

                'colorToken' => 'primary',

                'videoCount' => 0,
                'questionCount' => 0,

                'description' =>
                    'CBSE Class ' .
                    $gradeNumber .
                    ' ' .
                    $subject->name .
                    ' learning resources.',
            ];
        })->values();
    }

    /**
     * Get active units for a subject.
     */
    public function units($subjectId)
    {
        Subject::where('is_active', true)->findOrFail($subjectId);
        return Unit::where('subject_id', $subjectId)
            ->where('is_active', true)
            ->orderBy('display_order')
            ->get();
    }

    /**
     * Get active chapters for a unit.
     */
    public function chapters($unitId)
    {
        Unit::where('is_active', true)->findOrFail($unitId);
        return Chapter::where('unit_id', $unitId)
            ->where('is_active', true)
            ->orderBy('display_order')
            ->get();
    }

    /**
     * Get published lessons for a chapter.
     */
    public function lessons($chapterId)
    {
        Chapter::where('is_active', true)->findOrFail($chapterId);
        return Lesson::published()->where('chapter_id', $chapterId)
            ->where('is_active', true)
            ->where('is_published', true)
            ->orderBy('display_order')
            ->get();
    }

    /**
     * Get one published lesson with its active contents
     * and published interactive apps.
     */
    public function lesson($id)
    {
        return Lesson::published()->where('id', $id)
            ->where('is_active', true)
            ->where('is_published', true)
            ->with([
                'contents' => function ($query) {
                    $query->where('is_active', true)
                        ->orderBy('display_order');
                },

                'interactiveApps' => function ($query) {
                    $query->where('is_active', true)
                        ->where('is_published', true)
                        ->orderBy('display_order')
                        ->orderBy('id');
                }
            ])
            ->firstOrFail();
    }
}
