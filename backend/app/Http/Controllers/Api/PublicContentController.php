<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Chapter;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\Subject;
use App\Models\Unit;
use Illuminate\Http\Request;

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
     *
     * Students and teachers only receive their assigned classes.
     * Admin/parent accounts keep unrestricted curriculum visibility.
     */
    public function grades(
        Request $request,
        $boardId
    ) {
        Board::where(
            'is_active',
            true
        )->findOrFail($boardId);

        $grades = Grade::query()
            ->accessibleTo(
                $request->user()
            )
            ->where(
                'board_id',
                $boardId
            )
            ->where(
                'is_active',
                true
            )
            ->with([
                'subjects' => function ($query) {
                    $query
                        ->where(
                            'is_active',
                            true
                        )
                        ->with([
                            'units' => function ($query) {
                                $query
                                    ->where(
                                        'is_active',
                                        true
                                    )
                                    ->with([
                                        'chapters' => function ($query) {
                                            $query->where(
                                                'is_active',
                                                true
                                            );
                                        },
                                    ]);
                            },
                        ]);
                },
            ])
            ->orderBy(
                'grade_number'
            )
            ->get();

        return $grades
            ->map(function ($grade) {
                $chapterCount =
                    $grade->subjects
                        ->flatMap->units
                        ->flatMap->chapters
                        ->count();

                $number =
                    (int) $grade->grade_number;

                $level = match (true) {
                    $number <= 5 =>
                        'Primary',
                    $number <= 8 =>
                        'Middle',
                    $number <= 10 =>
                        'Secondary',
                    default =>
                        'Senior Secondary',
                };

                return [
                    'id' =>
                        (string) $grade->id,
                    'slug' =>
                        'class-' . $number,
                    'name' =>
                        'Class ' . $number,
                    'level' => $level,

                    'subjectCount' =>
                        $grade
                            ->subjects
                            ->count(),

                    'chapterCount' =>
                        $chapterCount,

                    'videoCount' => 0,
                    'questionCount' => 0,

                    'description' =>
                        'CBSE Class ' .
                        $number .
                        ' learning resources.',
                ];
            })
            ->values();
    }

    /**
     * Get active subjects for an accessible grade.
     */
    public function subjects(
        Request $request,
        $gradeId
    ) {
        Grade::query()
            ->accessibleTo(
                $request->user()
            )
            ->where(
                'is_active',
                true
            )
            ->findOrFail($gradeId);

        $subjects = Subject::query()
            ->accessibleTo(
                $request->user()
            )
            ->where(
                'grade_id',
                $gradeId
            )
            ->where(
                'is_active',
                true
            )
            ->with([
                'grade',
                'units' => function ($query) {
                    $query
                        ->where(
                            'is_active',
                            true
                        )
                        ->with([
                            'chapters' => function ($query) {
                                $query->where(
                                    'is_active',
                                    true
                                );
                            },
                        ]);
                },
            ])
            ->orderBy(
                'display_order'
            )
            ->get();

        return $subjects
            ->map(function ($subject) {
                $chapterCount =
                    $subject->units
                        ->flatMap->chapters
                        ->count();

                $gradeNumber =
                    (int) $subject
                        ->grade
                        ->grade_number;

                return [
                    'id' =>
                        (string) $subject->id,

                    'slug' => strtolower(
                        str_replace(
                            ' ',
                            '-',
                            $subject->name
                        )
                    ),

                    'name' =>
                        $subject->name,

                    'grades' => [
                        'Class ' .
                            $gradeNumber,
                    ],

                    'chapterCount' =>
                        $chapterCount,

                    'colorToken' =>
                        'primary',

                    'videoCount' => 0,
                    'questionCount' => 0,

                    'description' =>
                        'CBSE Class ' .
                        $gradeNumber .
                        ' ' .
                        $subject->name .
                        ' learning resources.',
                ];
            })
            ->values();
    }

    /**
     * Get active units for an accessible subject.
     */
    public function units(
        Request $request,
        $subjectId
    ) {
        Subject::query()
            ->accessibleTo(
                $request->user()
            )
            ->where(
                'is_active',
                true
            )
            ->findOrFail($subjectId);

        return Unit::query()
            ->accessibleTo(
                $request->user()
            )
            ->where(
                'subject_id',
                $subjectId
            )
            ->where(
                'is_active',
                true
            )
            ->orderBy(
                'display_order'
            )
            ->get();
    }

    /**
     * Get active chapters for an accessible unit.
     */
    public function chapters(
        Request $request,
        $unitId
    ) {
        Unit::query()
            ->accessibleTo(
                $request->user()
            )
            ->where(
                'is_active',
                true
            )
            ->findOrFail($unitId);

        return Chapter::query()
            ->accessibleTo(
                $request->user()
            )
            ->where(
                'unit_id',
                $unitId
            )
            ->where(
                'is_active',
                true
            )
            ->orderBy(
                'display_order'
            )
            ->get();
    }

    /**
     * Get published lessons for an accessible chapter.
     */
    public function lessons(
        Request $request,
        $chapterId
    ) {
        Chapter::query()
            ->accessibleTo(
                $request->user()
            )
            ->where(
                'is_active',
                true
            )
            ->findOrFail($chapterId);

        return Lesson::published()
            ->accessibleTo(
                $request->user()
            )
            ->where(
                'chapter_id',
                $chapterId
            )
            ->orderBy(
                'display_order'
            )
            ->get();
    }

    /**
     * Get one accessible published lesson with active contents
     * and published interactive apps.
     */
    public function lesson(
        Request $request,
        $id
    ) {
        return Lesson::published()
            ->accessibleTo(
                $request->user()
            )
            ->where(
                'id',
                $id
            )
            ->with([
                'contents' => function ($query) {
                    $query
                        ->where(
                            'is_active',
                            true
                        )
                        ->orderBy(
                            'display_order'
                        );
                },

                'interactiveApps' => function ($query) {
                    $query
                        ->where(
                            'is_active',
                            true
                        )
                        ->where(
                            'is_published',
                            true
                        )
                        ->orderBy(
                            'display_order'
                        )
                        ->orderBy('id');
                },
            ])
            ->firstOrFail();
    }
}
