<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\PracticeSet;
use App\Models\Subject;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminWorkspaceController extends Controller
{
    public function stats()
    {
        $students = User::where('role', 'student')->count();
        $teachers = User::where('role', 'teacher')->count();
        $admins = User::where('role', 'admin')->count();
        $totalUsers = User::count();

        $lessons = Lesson::count();
        $publishedLessons = Lesson::where('is_published', true)->count();
        $draftLessons = Lesson::where('is_published', false)->count();
        $activeLessons = Lesson::where('is_active', true)->count();

        $grades = DB::table('grades')->count();
        $subjects = DB::table('subjects')->count();
        $chapters = DB::table('chapters')->count();
        $lessonContents = DB::table('lesson_contents')->count();

        $blogPosts = DB::table('blog_posts')->count();
        $publishedBlogs = DB::table('blog_posts')
            ->where('status', 'published')
            ->count();

        $mediaAssets = DB::table('media_assets')->count();
        $activeMediaAssets = DB::table('media_assets')
            ->where('is_active', true)
            ->count();

        $mediaStorageBytes = (int) DB::table('media_assets')
            ->sum('size_bytes');

        $flashcardDecks = DB::table('flashcard_decks')->count();
        $publishedFlashcardDecks = DB::table('flashcard_decks')
            ->where('is_published', true)
            ->count();

        $flashcards = DB::table('flashcards')->count();
        $notifications = DB::table('notifications')->count();
        $unreadNotifications = DB::table('notifications')
            ->whereNull('read_at')
            ->count();

        $months = collect(range(5, 0))
            ->map(
                fn (int $offset) =>
                    Carbon::now()
                        ->startOfMonth()
                        ->subMonths($offset)
            );

        $monthlyCounts = function (
            string $table,
            ?callable $scope = null
        ) use ($months) {
            return $months
                ->map(function (Carbon $month) use ($table, $scope) {
                    $query = DB::table($table)
                        ->whereBetween(
                            'created_at',
                            [
                                $month->copy()->startOfMonth(),
                                $month->copy()->endOfMonth(),
                            ]
                        );

                    if ($scope) {
                        $scope($query);
                    }

                    return $query->count();
                })
                ->values()
                ->all();
        };

        $monthLabels = $months
            ->map(
                fn (Carbon $month) =>
                    $month->format('M Y')
            )
            ->values()
            ->all();

        $contentTypes = DB::table('lesson_contents')
            ->select(
                'content_type',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('content_type')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'label' => ucfirst((string) $row->content_type),
                'value' => (int) $row->total,
            ])
            ->values()
            ->all();

        $resourceCategories = DB::table('lesson_contents')
            ->whereNotNull('resource_category')
            ->select(
                'resource_category',
                DB::raw('COUNT(*) as total')
            )
            ->groupBy('resource_category')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'label' => ucwords(
                    str_replace(
                        '_',
                        ' ',
                        (string) $row->resource_category
                    )
                ),
                'value' => (int) $row->total,
            ])
            ->values()
            ->all();

        $topChapters = DB::table('chapters')
            ->leftJoin(
                'lessons',
                'lessons.chapter_id',
                '=',
                'chapters.id'
            )
            ->leftJoin(
                'lesson_contents',
                'lesson_contents.lesson_id',
                '=',
                'lessons.id'
            )
            ->select(
                'chapters.id',
                'chapters.title',
                DB::raw(
                    'COUNT(DISTINCT lessons.id) as lessons_count'
                ),
                DB::raw(
                    'COUNT(DISTINCT lesson_contents.id) as contents_count'
                )
            )
            ->groupBy(
                'chapters.id',
                'chapters.title'
            )
            ->orderByDesc('contents_count')
            ->orderByDesc('lessons_count')
            ->limit(8)
            ->get();

        $maxChapterScore = max(
            1,
            (int) $topChapters->max(
                fn ($row) =>
                    max(
                        (int) $row->contents_count,
                        (int) $row->lessons_count
                    )
            )
        );

        $topChapters = $topChapters
            ->map(function ($row) use ($maxChapterScore) {
                $score = max(
                    (int) $row->contents_count,
                    (int) $row->lessons_count
                );

                return [
                    'id' => (int) $row->id,
                    'title' => $row->title,
                    'lessons' => (int) $row->lessons_count,
                    'contents' => (int) $row->contents_count,
                    'share' => (int) round(
                        ($score / $maxChapterScore) * 100
                    ),
                ];
            })
            ->values()
            ->all();

        $since = Carbon::now()->subDays(30);

        return response()->json([
            // Keep these four fields for the existing Admin dashboard.
            'students' => $students,
            'teachers' => $teachers,
            'lessons' => $lessons,
            'drafts' => $draftLessons,

            'analytics' => [
                'totals' => [
                    'users' => $totalUsers,
                    'students' => $students,
                    'teachers' => $teachers,
                    'admins' => $admins,

                    'grades' => $grades,
                    'subjects' => $subjects,
                    'chapters' => $chapters,

                    'lessons' => $lessons,
                    'published_lessons' => $publishedLessons,
                    'draft_lessons' => $draftLessons,
                    'active_lessons' => $activeLessons,

                    'lesson_contents' => $lessonContents,

                    'blog_posts' => $blogPosts,
                    'published_blog_posts' => $publishedBlogs,

                    'media_assets' => $mediaAssets,
                    'active_media_assets' => $activeMediaAssets,
                    'media_storage_bytes' => $mediaStorageBytes,

                    'flashcard_decks' => $flashcardDecks,
                    'published_flashcard_decks' =>
                        $publishedFlashcardDecks,
                    'flashcards' => $flashcards,

                    'notifications' => $notifications,
                    'unread_notifications' => $unreadNotifications,
                ],

                'monthly' => [
                    'labels' => $monthLabels,

                    'students' => $monthlyCounts(
                        'users',
                        fn ($query) =>
                            $query->where(
                                'role',
                                'student'
                            )
                    ),

                    'teachers' => $monthlyCounts(
                        'users',
                        fn ($query) =>
                            $query->where(
                                'role',
                                'teacher'
                            )
                    ),

                    'lessons' => $monthlyCounts(
                        'lessons'
                    ),

                    'lesson_contents' => $monthlyCounts(
                        'lesson_contents'
                    ),

                    'blog_posts' => $monthlyCounts(
                        'blog_posts'
                    ),

                    'media_assets' => $monthlyCounts(
                        'media_assets'
                    ),
                ],

                'publication' => [
                    'lessons' => [
                        'total' => $lessons,
                        'published' => $publishedLessons,
                    ],

                    'blog_posts' => [
                        'total' => $blogPosts,
                        'published' => $publishedBlogs,
                    ],

                    'flashcard_decks' => [
                        'total' => $flashcardDecks,
                        'published' => $publishedFlashcardDecks,
                    ],
                ],

                'recent_30_days' => [
                    'new_students' => DB::table('users')
                        ->where('role', 'student')
                        ->where('created_at', '>=', $since)
                        ->count(),

                    'new_teachers' => DB::table('users')
                        ->where('role', 'teacher')
                        ->where('created_at', '>=', $since)
                        ->count(),

                    'new_lessons' => DB::table('lessons')
                        ->where('created_at', '>=', $since)
                        ->count(),

                    'new_lesson_contents' =>
                        DB::table('lesson_contents')
                            ->where(
                                'created_at',
                                '>=',
                                $since
                            )
                            ->count(),

                    'new_blog_posts' => DB::table('blog_posts')
                        ->where('created_at', '>=', $since)
                        ->count(),

                    'new_media_assets' =>
                        DB::table('media_assets')
                            ->where(
                                'created_at',
                                '>=',
                                $since
                            )
                            ->count(),

                    'new_flashcards' => DB::table('flashcards')
                        ->where('created_at', '>=', $since)
                        ->count(),
                ],

                'content_types' => $contentTypes,
                'resource_categories' => $resourceCategories,
                'top_chapters' => $topChapters,
            ],
        ]);
    }

    public function users(Request $request)
    {
        $filters = $request->validate([
            'search' => [
                'nullable',
                'string',
                'max:255',
            ],
            'role' => [
                'nullable',
                Rule::in([
                    'student',
                    'teacher',
                ]),
            ],
            'approval_status' => [
                'nullable',
                Rule::in([
                    'pending',
                    'approved',
                    'rejected',
                ]),
            ],
        ]);

        $users = User::query()
            ->with([
                'grades:id,name,grade_number',
            ])
            ->when(
                !empty($filters['role']),
                fn ($q) =>
                    $q->where(
                        'role',
                        $filters['role']
                    )
            )
            ->when(
                !empty(
                    $filters['approval_status']
                ),
                fn ($q) =>
                    $q->where(
                        'approval_status',
                        $filters[
                            'approval_status'
                        ]
                    )
            )
            ->when(
                !empty($filters['search']),
                fn ($q) =>
                    $q->where(
                        fn ($q) =>
                            $q
                                ->where(
                                    'name',
                                    'like',
                                    '%' .
                                        $filters['search'] .
                                        '%'
                                )
                                ->orWhere(
                                    'email',
                                    'like',
                                    '%' .
                                        $filters['search'] .
                                        '%'
                                )
                    )
            )
            ->latest()
            ->limit(200)
            ->get([
                'id',
                'name',
                'email',
                'role',
                'approval_status',
                'approved_at',
                'approved_by',
                'created_at',
            ]);

        return response()->json([
            'users' => $users,
        ]);
    }

    public function storeUser(Request $request)
    {
        $data = $request->validate([
            'name' =>
                'required|string|max:255',
            'email' =>
                'required|email|unique:users,email',
            'password' =>
                'required|string|min:8',
            'role' => [
                'required',
                Rule::in([
                    'student',
                    'teacher',
                ]),
            ],
            'grade_ids' => [
                'required',
                'array',
                'min:1',
                'max:12',
            ],
            'grade_ids.*' => [
                'integer',
                'distinct',
                Rule::exists(
                    'grades',
                    'id'
                )->where(
                    fn ($query) =>
                        $query->where(
                            'is_active',
                            true
                        )
                ),
            ],
        ]);

        $gradeIds = array_values(
            $data['grade_ids']
        );

        if (
            $data['role'] === 'student'
            && count($gradeIds) !== 1
        ) {
            return response()->json([
                'message' =>
                    'A student must be assigned exactly one class.',
                'errors' => [
                    'grade_ids' => [
                        'Select exactly one class for the student.',
                    ],
                ],
            ], 422);
        }

        $user = DB::transaction(
            function () use (
                $data,
                $gradeIds,
                $request
            ) {
                $user = User::create([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    'password' => $data['password'],
                    'role' => $data['role'],
                ]);

                $user->forceFill([
                    'approval_status' =>
                        'approved',
                    'approved_at' => now(),
                    'approved_by' =>
                        $request->user()->id,
                ])->save();

                $user->grades()->sync(
                    $gradeIds
                );

                return $user->load(
                    'grades:id,name,grade_number'
                );
            }
        );

        return response()->json([
            'user' => $user,
        ], 201);
    }

    public function updateUser(
        Request $request,
        User $user
    ) {
        if (
            !in_array(
                $user->role,
                ['student', 'teacher'],
                true
            )
        ) {
            return response()->json([
                'message' =>
                    'Admin accounts are managed through Roles & Permissions.',
            ], 422);
        }

        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
            ],
            'email' => [
                'required',
                'email',
                Rule::unique(
                    'users',
                    'email'
                )->ignore($user->id),
            ],
            'role' => [
                'required',
                Rule::in([
                    'student',
                    'teacher',
                ]),
            ],
            'password' => [
                'nullable',
                'string',
                'min:8',
            ],
        ]);

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $user->fill($data);
        $user->save();

        return response()->json([
            'message' => 'Account updated.',
            'user' => $user->fresh(
                'grades:id,name,grade_number'
            ),
        ]);
    }

    public function updateUserApproval(
        Request $request,
        User $user
    ) {
        if (
            !in_array(
                $user->role,
                ['student', 'teacher'],
                true
            )
        ) {
            return response()->json([
                'message' =>
                    'Only student and teacher accounts use this approval workflow.',
            ], 422);
        }

        $data = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    'approved',
                    'rejected',
                ]),
            ],
            'grade_ids' => [
                'nullable',
                'array',
                'max:12',
            ],
            'grade_ids.*' => [
                'integer',
                'distinct',
                Rule::exists(
                    'grades',
                    'id'
                )->where(
                    fn ($query) =>
                        $query->where(
                            'is_active',
                            true
                        )
                ),
            ],
        ]);

        $gradeIds = array_values(
            $data['grade_ids'] ?? []
        );

        if (
            $data['status'] === 'approved'
            && $user->role === 'student'
            && count($gradeIds) !== 1
        ) {
            return response()->json([
                'message' =>
                    'A student must be assigned exactly one class before approval.',
                'errors' => [
                    'grade_ids' => [
                        'Select exactly one class.',
                    ],
                ],
            ], 422);
        }

        if (
            $data['status'] === 'approved'
            && $user->role === 'teacher'
            && count($gradeIds) < 1
        ) {
            return response()->json([
                'message' =>
                    'A teacher must be assigned at least one class before approval.',
                'errors' => [
                    'grade_ids' => [
                        'Select one or more classes.',
                    ],
                ],
            ], 422);
        }

        DB::transaction(
            function () use (
                $data,
                $gradeIds,
                $request,
                $user
            ) {
                if (
                    $data['status']
                    === 'approved'
                ) {
                    $user->grades()->sync(
                        $gradeIds
                    );

                    $user->forceFill([
                        'approval_status' =>
                            'approved',
                        'approved_at' => now(),
                        'approved_by' =>
                            $request->user()->id,
                    ])->save();

                    return;
                }

                $user->tokens()->delete();

                $user->forceFill([
                    'approval_status' =>
                        'rejected',
                    'approved_at' => null,
                    'approved_by' => null,
                ])->save();
            }
        );

        return response()->json([
            'message' =>
                $data['status']
                    === 'approved'
                    ? 'Account approved.'
                    : 'Account rejected.',
            'user' => $user->fresh(
                'grades:id,name,grade_number'
            ),
        ]);
    }

    public function practiceSets()
    {
        return response()->json([
            'sets' => PracticeSet::withCount('questions')
                ->orderByDesc('id')
                ->get(),

            'subjects' => Subject::with('grade')
                ->where('is_active', true)
                ->get(),
        ]);
    }

    public function storePracticeSet(Request $request)
    {
        $data = $request->validate([
            'title' =>
                'required|string|max:255',
            'subject_id' =>
                'required|exists:subjects,id',
            'description' =>
                'nullable|string|max:10000',
            'is_published' =>
                'required|boolean',
            'questions' =>
                'required|array|min:1|max:100',
            'questions.*.question_text' =>
                'required|string|max:10000',
            'questions.*.explanation' =>
                'nullable|string|max:10000',
            'questions.*.options' =>
                'required|array|size:4',
            'questions.*.options.*' =>
                'required|string|max:2000',
            'questions.*.correct' =>
                'required|integer|min:0|max:3',
        ]);

        $set = DB::transaction(function () use ($data) {
            $set = PracticeSet::create([
                'title' => $data['title'],
                'subject_id' => $data['subject_id'],
                'description' =>
                    $data['description'] ?? null,
                'slug' =>
                    Str::slug($data['title']) .
                    '-' .
                    Str::lower(Str::random(8)),
                'type' => 'mcq',
                'is_published' =>
                    $data['is_published'],
                'is_active' => true,
                'marks_per_question' => 1,
                'negative_marks' => 0,
                'show_answers_after_submit' => true,
            ]);

            foreach (
                $data['questions'] as $index => $item
            ) {
                $question = $set
                    ->questions()
                    ->create([
                        'question_text' =>
                            $item['question_text'],
                        'explanation' =>
                            $item['explanation'] ?? null,
                        'question_type' =>
                            'mcq_single',
                        'is_active' => true,
                        'display_order' => $index,
                    ]);

                foreach (
                    $item['options'] as $i => $text
                ) {
                    $question
                        ->options()
                        ->create([
                            'option_text' => $text,
                            'is_correct' =>
                                $i ===
                                (int) $item['correct'],
                            'display_order' => $i,
                            'is_active' => true,
                        ]);
                }
            }

            return $set;
        });

        return response()->json([
            'set' => $set,
        ], 201);
    }

    public function publishPracticeSet(
        Request $request,
        int $id
    ) {
        $data = $request->validate([
            'is_published' =>
                'required|boolean',
        ]);

        $set = PracticeSet::findOrFail($id);

        $set->update($data);

        return response()->json([
            'set' => $set,
        ]);
    }
}