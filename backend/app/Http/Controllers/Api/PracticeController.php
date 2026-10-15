<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PracticeAnswer;
use App\Models\PracticeAttempt;
use App\Models\PracticeOption;
use App\Models\PracticeQuestion;
use App\Models\PracticeSet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PracticeController extends Controller
{
    /**
     * Return published and active practice sets
     * available to the logged-in student.
     */
    public function index(Request $request): JsonResponse
    {
        $practiceSets = PracticeSet::query()
            ->accessibleTo($request->user())
            ->with([
                'subject:id,grade_id,name,code',
                'unit:id,subject_id,title,code',
                'chapter:id,unit_id,title,code',
                'lesson:id,chapter_id,title,slug',
            ])
            ->withCount([
                'questions' => function ($query) {
                    $query->where('is_active', true);
                },
            ])
            ->where('is_published', true)
            ->where('is_active', true)
            ->orderBy('display_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'practice_sets' => $practiceSets,
            'count' => $practiceSets->count(),
        ]);
    }

    /**
     * Return one published practice set with student-safe
     * questions and options.
     *
     * Correct-answer information is never exposed here.
     */
    public function show(
        Request $request,
        PracticeSet $practiceSet
    ): JsonResponse {
        if (
            !$practiceSet->is_published ||
            !$practiceSet->is_active ||
            !PracticeSet::query()
                ->accessibleTo($request->user())
                ->whereKey($practiceSet->id)
                ->exists()
        ) {
            return response()->json([
                'message' => 'Practice set not found.',
            ], 404);
        }

        $practiceSet->load([
            'subject:id,grade_id,name,code',
            'unit:id,subject_id,title,code',
            'chapter:id,unit_id,title,code',
            'lesson:id,chapter_id,title,slug',

            'questions' => function ($query) {
                $query
                    ->where('is_active', true)
                    ->orderBy('display_order')
                    ->select([
                        'id',
                        'practice_set_id',
                        'question_text',
                        'question_type',
                        'image_url',
                        'difficulty',
                        'marks',
                        'negative_marks',
                        'display_order',
                    ]);
            },

            'questions.options' => function ($query) {
                $query
                    ->where('is_active', true)
                    ->orderBy('display_order')
                    ->select([
                        'id',
                        'practice_question_id',
                        'option_text',
                        'image_url',
                        'display_order',
                    ]);
            },
        ]);

        return response()->json([
            'practice_set' => $practiceSet,
        ]);
    }

    /**
     * Start a new practice attempt for the logged-in student.
     */
    public function start(
        Request $request,
        PracticeSet $practiceSet
    ): JsonResponse {
        if (
            !$practiceSet->is_published ||
            !$practiceSet->is_active ||
            !PracticeSet::query()
                ->accessibleTo($request->user())
                ->whereKey($practiceSet->id)
                ->exists()
        ) {
            return response()->json([
                'message' => 'Practice set not found.',
            ], 404);
        }

        $totalQuestions = $practiceSet
            ->questions()
            ->where('is_active', true)
            ->count();

        if ($totalQuestions === 0) {
            return response()->json([
                'message' => 'This practice set has no active questions.',
            ], 422);
        }

        $maxScore = $practiceSet
            ->questions()
            ->where('is_active', true)
            ->sum('marks');

        $attempt = PracticeAttempt::create([
            'user_id' => $request->user()->id,
            'practice_set_id' => $practiceSet->id,
            'status' => 'in_progress',

            'total_questions' => $totalQuestions,
            'answered_questions' => 0,
            'correct_answers' => 0,
            'wrong_answers' => 0,

            'score' => 0,
            'max_score' => $maxScore,
            'percentage' => 0,

            'started_at' => now(),
            'time_spent_seconds' => 0,
        ]);

        return response()->json([
            'message' => 'Practice attempt started.',
            'attempt' => $attempt,
        ], 201);
    }

    /**
     * Submit answers and automatically score a practice attempt.
     */
    public function submit(
        Request $request,
        PracticeAttempt $attempt
    ): JsonResponse {
        if (
            (int) $attempt->user_id !==
            (int) $request->user()->id
        ) {
            return response()->json([
                'message' => 'Practice attempt not found.',
            ], 404);
        }

        if ($attempt->status !== 'in_progress') {
            return response()->json([
                'message' => 'This practice attempt has already been submitted.',
            ], 422);
        }

        $validated = $request->validate([
            'answers' => [
                'required',
                'array',
            ],

            'answers.*.question_id' => [
    'required',
    'integer',
    'distinct',
],

            'answers.*.option_id' => [
                'required',
                'integer',
            ],

            'answers.*.time_spent_seconds' => [
                'nullable',
                'integer',
                'min:0',
            ],

            'time_spent_seconds' => [
                'nullable',
                'integer',
                'min:0',
            ],
        ]);

        $practiceSet = PracticeSet::query()
            ->accessibleTo($request->user())
            ->findOrFail($attempt->practice_set_id);

        $result = DB::transaction(function () use (
            $validated,
            $attempt,
            $practiceSet
        ) {
            $attempt = PracticeAttempt::whereKey($attempt->id)->lockForUpdate()->firstOrFail();
            abort_if($attempt->status !== 'in_progress', 409, 'This attempt has already been submitted.');
            $answeredQuestions = 0;
            $correctAnswers = 0;
            $wrongAnswers = 0;
            $score = 0;

            foreach ($validated['answers'] as $answerData) {
                $question = PracticeQuestion::query()
                    ->where('id', $answerData['question_id'])
                    ->where(
                        'practice_set_id',
                        $practiceSet->id
                    )
                    ->where('is_active', true)
                    ->first();

                if (!$question) {
                    abort(
                        422,
                        'One of the submitted questions is invalid.'
                    );
                }

                $option = PracticeOption::query()
                    ->where('id', $answerData['option_id'])
                    ->where(
                        'practice_question_id',
                        $question->id
                    )
                    ->where('is_active', true)
                    ->first();

                if (!$option) {
                    abort(
                        422,
                        'One of the submitted options is invalid.'
                    );
                }

                $isCorrect = (bool) $option->is_correct;

                $marksAwarded = $isCorrect
                    ? (float) $question->marks
                    : -1 * (float) $question->negative_marks;

                PracticeAnswer::updateOrCreate(
                    [
                        'practice_attempt_id' => $attempt->id,
                        'practice_question_id' => $question->id,
                    ],
                    [
                        'practice_option_id' => $option->id,
                        'is_correct' => $isCorrect,
                        'marks_awarded' => $marksAwarded,
                        'time_spent_seconds' =>
                            $answerData['time_spent_seconds']
                            ?? 0,
                        'answered_at' => now(),
                    ]
                );

                $answeredQuestions++;

                if ($isCorrect) {
                    $correctAnswers++;
                } else {
                    $wrongAnswers++;
                }

                $score += $marksAwarded;
            }

            $maxScore = (float) $attempt->max_score;

            $percentage = $maxScore > 0
                ? round(($score / $maxScore) * 100, 2)
                : 0;

            $attempt->update([
                'status' => 'completed',
                'answered_questions' => $answeredQuestions,
                'correct_answers' => $correctAnswers,
                'wrong_answers' => $wrongAnswers,
                'score' => $score,
                'percentage' => $percentage,
                'submitted_at' => now(),
                'time_spent_seconds' =>
                    $validated['time_spent_seconds']
                    ?? 0,
            ]);

            return $attempt->fresh();
        });

        return response()->json([
            'message' => 'Practice attempt submitted successfully.',
            'attempt' => $result,
        ]);
    }

    /**
     * Review a completed practice attempt.
     *
     * Correct answers and explanations are exposed only
     * after the attempt has been submitted.
     */
    public function review(
        Request $request,
        PracticeAttempt $attempt
    ): JsonResponse {
        if (
            (int) $attempt->user_id !==
            (int) $request->user()->id
        ) {
            return response()->json([
                'message' => 'Practice attempt not found.',
            ], 404);
        }

        if ($attempt->status !== 'completed') {
            return response()->json([
                'message' => 'Submit this practice attempt before reviewing it.',
            ], 422);
        }

        $practiceSet = PracticeSet::query()
            ->accessibleTo($request->user())
            ->with([
                'subject:id,grade_id,name,code',
                'unit:id,subject_id,title,code',
                'chapter:id,unit_id,title,code',
                'lesson:id,chapter_id,title,slug',
            ])
            ->findOrFail($attempt->practice_set_id);

        $answers = PracticeAnswer::query()
            ->where('practice_attempt_id', $attempt->id)
            ->with([
                'question' => function ($query) {
                    $query->select([
                        'id',
                        'practice_set_id',
                        'question_text',
                        'question_type',
                        'explanation',
                        'image_url',
                        'difficulty',
                        'marks',
                        'negative_marks',
                        'display_order',
                    ]);
                },

                'option' => function ($query) {
                    $query->select([
                        'id',
                        'practice_question_id',
                        'option_text',
                        'image_url',
                    ]);
                },
            ])
            ->get();

        $review = $answers->map(function ($answer) {
            $correctOption = PracticeOption::query()
                ->where(
                    'practice_question_id',
                    $answer->practice_question_id
                )
                ->where('is_correct', true)
                ->where('is_active', true)
                ->select([
                    'id',
                    'practice_question_id',
                    'option_text',
                    'image_url',
                ])
                ->first();

            return [
                'question_id' => $answer->practice_question_id,
                'question' => $answer->question?->question_text,
                'question_type' => $answer->question?->question_type,

                'selected_option' => $answer->option
                    ? [
                        'id' => $answer->option->id,
                        'text' => $answer->option->option_text,
                    ]
                    : null,

                'correct_option' => $correctOption
                    ? [
                        'id' => $correctOption->id,
                        'text' => $correctOption->option_text,
                    ]
                    : null,

                'is_correct' => (bool) $answer->is_correct,
                'marks_awarded' => $answer->marks_awarded,
                'explanation' => $answer->question?->explanation,
                'time_spent_seconds' => $answer->time_spent_seconds,
            ];
        });

        return response()->json([
            'attempt' => [
                'id' => $attempt->id,
                'status' => $attempt->status,
                'total_questions' => $attempt->total_questions,
                'answered_questions' => $attempt->answered_questions,
                'correct_answers' => $attempt->correct_answers,
                'wrong_answers' => $attempt->wrong_answers,
                'score' => $attempt->score,
                'max_score' => $attempt->max_score,
                'percentage' => $attempt->percentage,
                'started_at' => $attempt->started_at,
                'submitted_at' => $attempt->submitted_at,
                'time_spent_seconds' => $attempt->time_spent_seconds,
            ],

            'practice_set' => [
                'id' => $practiceSet->id,
                'title' => $practiceSet->title,
                'type' => $practiceSet->type,
                'subject' => $practiceSet->subject,
                'unit' => $practiceSet->unit,
                'chapter' => $practiceSet->chapter,
                'lesson' => $practiceSet->lesson,
            ],

            'review' => $review,
        ]);
    }

    /**
     * Return completed practice attempt history
     * for the logged-in student.
     */
    public function history(Request $request): JsonResponse
    {
        $attempts = PracticeAttempt::query()
            ->whereHas(
                'practiceSet',
                fn ($query) =>
                    $query->accessibleTo(
                        $request->user()
                    )
            )
            ->with([
                'practiceSet:id,title,type,subject_id,unit_id,chapter_id,lesson_id',
                'practiceSet.subject:id,grade_id,name,code',
                'practiceSet.unit:id,subject_id,title,code',
                'practiceSet.chapter:id,unit_id,title,code',
                'practiceSet.lesson:id,chapter_id,title,slug',
            ])
            ->where('user_id', $request->user()->id)
            ->where('status', 'completed')
            ->orderByDesc('submitted_at')
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'attempts' => $attempts,
            'count' => $attempts->count(),
        ]);
    }
}