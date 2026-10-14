<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chapter;
use App\Models\Lesson;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class TeacherContentController extends Controller
{
    public function index(
        Request $request
    ) {
        $user = $request->user();
        $userId = $user->id;

        $lessons = Lesson::query()
            ->accessibleTo($user)
            ->where(function ($query) use ($userId) {
                $query
                    ->where(
                        'created_by',
                        $userId
                    )
                    ->orWhere(function ($published) {
                        $published
                            ->where(
                                'is_active',
                                true
                            )
                            ->where(
                                'is_published',
                                true
                            );
                    });
            })
            ->with([
                'chapter.unit.subject.grade',
                'contents' => function ($query) {
                    $query
                        ->orderBy(
                            'display_order'
                        )
                        ->orderBy('id');
                },
            ])
            ->orderByDesc(
                'updated_at'
            )
            ->get();

        return response()->json([
            'lessons' => $lessons,
        ]);
    }

    public function chapters(
        Request $request
    ) {
        return response()->json([
            'chapters' =>
                Chapter::query()
                    ->accessibleTo(
                        $request->user()
                    )
                    ->where(
                        'is_active',
                        true
                    )
                    ->with(
                        'unit.subject.grade'
                    )
                    ->orderBy(
                        'title'
                    )
                    ->get(),
        ]);
    }

    public function store(
        Request $request
    ) {
        $data = $request->validate([
            'chapter_id' =>
                'required|exists:chapters,id',
            'title' =>
                'required|string|max:255',
            'summary' =>
                'nullable|string|max:10000',
            'duration' =>
                'nullable|integer|min:1|max:255',
        ]);

        $lesson = DB::transaction(
            function () use (
                $data,
                $request
            ) {
                /*
                 * The chapter must belong to one of the teacher's
                 * administrator-approved classes.
                 */
                Chapter::query()
                    ->accessibleTo(
                        $request->user()
                    )
                    ->whereKey(
                        $data['chapter_id']
                    )
                    ->lockForUpdate()
                    ->firstOrFail();

                $nextLessonNumber =
                    ((int) Lesson::query()
                        ->where(
                            'chapter_id',
                            $data['chapter_id']
                        )
                        ->max(
                            'lesson_number'
                        )) + 1;

                $nextDisplayOrder =
                    ((int) Lesson::query()
                        ->where(
                            'chapter_id',
                            $data['chapter_id']
                        )
                        ->max(
                            'display_order'
                        )) + 1;

                return Lesson::create(
                    $data + [
                        'slug' =>
                            Str::slug(
                                $data['title']
                            ) .
                            '-' .
                            Str::lower(
                                Str::random(8)
                            ),

                        'created_by' =>
                            $request
                                ->user()
                                ->id,

                        'lesson_number' =>
                            $nextLessonNumber,

                        'display_order' =>
                            $nextDisplayOrder,

                        'is_active' =>
                            true,

                        'is_published' =>
                            false,
                    ]
                );
            }
        );

        return response()->json([
            'lesson' =>
                $lesson->load(
                    'contents'
                ),
        ], 201);
    }

    public function update(
        Request $request,
        int $id
    ) {
        $lesson = Lesson::query()
            ->accessibleTo(
                $request->user()
            )
            ->where(
                'created_by',
                $request->user()->id
            )
            ->findOrFail($id);

        abort_if(
            $lesson->is_published,
            409,
            'Ask an administrator to unpublish this lesson before editing.'
        );

        $data = $request->validate([
            'title' =>
                'required|string|max:255',
            'summary' =>
                'nullable|string|max:10000',
            'duration' =>
                'nullable|integer|min:1|max:255',
        ]);

        $lesson->update($data);

        return response()->json([
            'lesson' =>
                $lesson->load(
                    'contents'
                ),
        ]);
    }

    public function addContent(
        Request $request,
        int $id
    ) {
        $lesson = Lesson::query()
            ->accessibleTo(
                $request->user()
            )
            ->where(
                'created_by',
                $request->user()->id
            )
            ->findOrFail($id);

        abort_if(
            $lesson->is_published,
            409,
            'Published lessons must be unpublished by an administrator before editing.'
        );

        $data = $request->validate([
            'title' =>
                'required|string|max:255',

            'content_type' => [
                'required',
                Rule::in([
                    'text',
                    'video',
                    'pdf',
                    'image',
                    'audio',
                    'worksheet',
                    'activity',
                ]),
            ],

            'content' =>
                'nullable|string|max:50000',

            'external_url' =>
                'nullable|url:http,https|max:255',
        ]);

        abort_if(
            empty($data['content']) &&
            empty(
                $data['external_url']
            ),
            422,
            'Enter content or a resource URL.'
        );

        $lesson
            ->contents()
            ->create(
                $data + [
                    'is_active' =>
                        true,
                    'is_free' =>
                        true,
                    'display_order' =>
                        $lesson
                            ->contents()
                            ->count() + 1,
                ]
            );

        return response()->json([
            'lesson' =>
                $lesson->load(
                    'contents'
                ),
        ], 201);
    }

    public function updateContent(
        Request $request,
        int $id,
        int $contentId
    ) {
        $lesson = Lesson::query()
            ->accessibleTo(
                $request->user()
            )
            ->where(
                'created_by',
                $request->user()->id
            )
            ->findOrFail($id);

        abort_if(
            $lesson->is_published,
            409,
            'Published lessons must be unpublished before editing.'
        );

        $contentItem =
            $lesson
                ->contents()
                ->findOrFail(
                    $contentId
                );

        $data = $request->validate([
            'title' =>
                'required|string|max:255',

            'content_type' => [
                'required',
                Rule::in([
                    'text',
                    'video',
                    'pdf',
                    'image',
                    'audio',
                    'worksheet',
                    'activity',
                ]),
            ],

            'content' =>
                'nullable|string|max:50000',

            'external_url' =>
                'nullable|url:http,https|max:255',
        ]);

        abort_if(
            empty($data['content']) &&
            empty(
                $data['external_url']
            ),
            422,
            'Enter content or a resource URL.'
        );

        $contentItem->update(
            $data
        );

        return response()->json([
            'lesson' =>
                $lesson
                    ->fresh()
                    ->load(
                        'contents'
                    ),
        ]);
    }

    public function removeContent(
        Request $request,
        int $id,
        int $contentId
    ) {
        $lesson = Lesson::query()
            ->accessibleTo(
                $request->user()
            )
            ->where(
                'created_by',
                $request->user()->id
            )
            ->findOrFail($id);

        abort_if(
            $lesson->is_published,
            409,
            'Published lessons must be unpublished before editing.'
        );

        $lesson
            ->contents()
            ->findOrFail(
                $contentId
            )
            ->delete();

        return response()->json([
            'lesson' =>
                $lesson->load(
                    'contents'
                ),
        ]);
    }
}
