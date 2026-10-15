<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{LessonContent, ResourceState, User};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ResourceLibraryController extends Controller
{
    private function available(User $user)
    {
        return LessonContent::where('is_active', true)
            ->where('is_free', true)
            ->whereHas(
                'lesson',
                fn ($q) =>
                    $q
                        ->published()
                        ->accessibleTo($user)
            );
    }

    private function item(
        User $user,
        int $id
    ) {
        return $this->available($user)
            ->with('lesson.chapter.unit.subject.grade')
            ->findOrFail($id);
    }

    private function representation(LessonContent $c)
    {
        $l = $c->lesson;
        $chapter = $l->chapter;
        $subject = $chapter->unit->subject;

        return [
            'id' => (string) $c->id,
            'title' => $c->title,
            'description' => $l->summary ?? '',
            'type' => $c->content_type,
            'grade' => $subject->grade->name,
            'subject' => $subject->name,
            'chapter' => $chapter->title,
            'lessonId' => (string) $l->id,
            'lessonTitle' => $l->title,
            'content' => $c->content,
            'updatedAt' => $c->updated_at->toDateString(),
            'fileUrl' => url(
                '/api/library/resources/' .
                $c->id .
                '/file'
            ),
            'hasFile' => (bool) (
                $c->file_path ||
                $c->external_url ||
                $c->content
            ),
        ];
    }

    public function index(Request $r)
    {
        $r->validate([
            'q' => 'nullable|string|max:200',
            'type' => 'nullable|string|max:30',
            'grade' => 'nullable|string|max:255',
            'subject' => 'nullable|string|max:255',
            'page' => 'nullable|integer|min:1',
        ]);

        $q = $this->available($r->user())
            ->with(
                'lesson.chapter.unit.subject.grade'
            );

        /*
         * Global Resource Library search.
         *
         * Searches:
         * - Resource title
         * - Resource content
         * - Resource category
         * - Resource type
         * - Lesson title
         * - Lesson summary
         * - Chapter title
         * - Chapter description
         * - Chapter code
         * - Unit title
         * - Unit description
         * - Unit code
         * - Subject name
         * - Subject code
         * - Grade name
         * - Grade code
         */

        if ($r->filled('q')) {
            $term =
                '%' .
                trim($r->input('q')) .
                '%';

            $q->where(function ($query) use ($term) {

                // RESOURCE
                $query
                    ->where(
                        'title',
                        'like',
                        $term
                    )
                    ->orWhere(
                        'content',
                        'like',
                        $term
                    )
                    ->orWhere(
                        'resource_category',
                        'like',
                        $term
                    )
                    ->orWhere(
                        'content_type',
                        'like',
                        $term
                    )

                    // LESSON
                    ->orWhereHas(
                        'lesson',
                        function ($lesson) use ($term) {
                            $lesson
                                ->where(
                                    'title',
                                    'like',
                                    $term
                                )
                                ->orWhere(
                                    'summary',
                                    'like',
                                    $term
                                );
                        }
                    )

                    // CHAPTER
                    ->orWhereHas(
                        'lesson.chapter',
                        function ($chapter) use ($term) {
                            $chapter
                                ->where(
                                    'title',
                                    'like',
                                    $term
                                )
                                ->orWhere(
                                    'description',
                                    'like',
                                    $term
                                )
                                ->orWhere(
                                    'code',
                                    'like',
                                    $term
                                );
                        }
                    )

                    // UNIT
                    ->orWhereHas(
                        'lesson.chapter.unit',
                        function ($unit) use ($term) {
                            $unit
                                ->where(
                                    'title',
                                    'like',
                                    $term
                                )
                                ->orWhere(
                                    'description',
                                    'like',
                                    $term
                                )
                                ->orWhere(
                                    'code',
                                    'like',
                                    $term
                                );
                        }
                    )

                    // SUBJECT
                    ->orWhereHas(
                        'lesson.chapter.unit.subject',
                        function ($subject) use ($term) {
                            $subject
                                ->where(
                                    'name',
                                    'like',
                                    $term
                                )
                                ->orWhere(
                                    'code',
                                    'like',
                                    $term
                                );
                        }
                    )

                    // GRADE
                    ->orWhereHas(
                        'lesson.chapter.unit.subject.grade',
                        function ($grade) use ($term) {
                            $grade
                                ->where(
                                    'name',
                                    'like',
                                    $term
                                )
                                ->orWhere(
                                    'code',
                                    'like',
                                    $term
                                );
                        }
                    );
            });
        }

        if ($r->filled('type')) {
            $q->where(
                'content_type',
                $r->input('type')
            );
        }

        if ($r->filled('grade')) {
            $q->whereHas(
                'lesson.chapter.unit.subject.grade',
                fn ($q) =>
                    $q->where(
                        'name',
                        $r->input('grade')
                    )
            );
        }

        if ($r->filled('subject')) {
            $q->whereHas(
                'lesson.chapter.unit.subject',
                fn ($q) =>
                    $q->where(
                        'name',
                        $r->input('subject')
                    )
            );
        }

        $rows = $q
            ->orderByDesc('updated_at')
            ->paginate(24);

        return response()->json([
            'resources' =>
                $rows
                    ->getCollection()
                    ->map(
                        fn ($c) =>
                            $this->representation($c)
                    ),
            'page' => $rows->currentPage(),
            'pages' => $rows->lastPage(),
            'total' => $rows->total(),
        ]);
    }

    public function show(
        Request $request,
        int $id
    ) {
        return response()->json([
            'resource' =>
                $this->representation(
                    $this->item(
                        $request->user(),
                        $id
                    )
                ),
        ]);
    }

    public function file(
        Request $request,
        int $id
    ) {
        $c = $this->item(
            $request->user(),
            $id
        );
        $path = $c->file_path;

        if (
            $path &&
            !preg_match(
                '~^https?://~i',
                $path
            )
        ) {
            $path = preg_replace(
                '~^/?storage/~',
                '',
                $path
            );

            abort_if(
                str_contains(
                    $path,
                    '..'
                ) ||
                str_starts_with(
                    $path,
                    '/'
                ),
                404
            );

            if (
                Storage::disk('public')
                    ->exists($path)
            ) {
                return Storage::disk('public')
                    ->download($path);
            }
        }

        $external =
            $c->external_url ?:
            $c->file_path;

        if (
            $external &&
            filter_var(
                $external,
                FILTER_VALIDATE_URL
            ) &&
            in_array(
                strtolower(
                    parse_url(
                        $external,
                        PHP_URL_SCHEME
                    )
                ),
                ['http', 'https'],
                true
            )
        ) {
            if (
                $request->expectsJson()
            ) {
                return response()->json([
                    'type' =>
                        'external',
                    'url' =>
                        $external,
                ]);
            }

            return redirect()
                ->away(
                    $external
                );
        }

        if ($c->content) {
            return response()
                ->streamDownload(
                    fn () =>
                        print(
                            $c->content
                        ),
                    Str::slug(
                        $c->title
                    ) . '.txt',
                    [
                        'Content-Type' =>
                            'text/plain; charset=UTF-8',
                    ]
                );
        }

        abort(
            404,
            'This resource has no downloadable file.'
        );
    }

    public function state(Request $r)
    {
        $rows =
            ResourceState::where(
                'user_id',
                $r->user()->id
            )
                ->whereHas(
                    'content',
                    fn ($q) =>
                        $q
                            ->where(
                                'is_active',
                                true
                            )
                            ->where(
                                'is_free',
                                true
                            )
                            ->whereHas(
                                'lesson',
                                fn ($q) =>
                                    $q
                                        ->published()
                                        ->accessibleTo(
                                            $r->user()
                                        )
                            )
                )
                ->with(
                    'content.lesson.chapter.unit.subject.grade'
                )
                ->orderByDesc(
                    'updated_at'
                )
                ->get();

        return response()->json([
            'items' =>
                $rows->map(
                    fn ($row) => [
                        'resource' =>
                            $this->representation(
                                $row->content
                            ),
                        'bookmarked' =>
                            $row->bookmarked,
                        'downloadedAt' =>
                            $row
                                ->downloaded_at
                                ?->toIso8601String(),
                        'viewedAt' =>
                            $row
                                ->viewed_at
                                ?->toIso8601String(),
                    ]
                ),
        ]);
    }

    public function update(
        Request $r,
        int $id
    ) {
        $this->item(
            $r->user(),
            $id
        );

        $data = $r->validate([
            'bookmarked' =>
                'sometimes|boolean',
            'downloaded' =>
                'sometimes|boolean',
            'viewed' =>
                'sometimes|boolean',
        ]);

        $patch = [];

        if (
            array_key_exists(
                'bookmarked',
                $data
            )
        ) {
            $patch['bookmarked'] =
                $data['bookmarked'];
        }

        if (
            array_key_exists(
                'downloaded',
                $data
            )
        ) {
            $patch['downloaded_at'] =
                $data['downloaded']
                    ? now()
                    : null;
        }

        if (
            !empty(
                $data['viewed']
            )
        ) {
            $patch['viewed_at'] =
                now();
        }

        ResourceState::updateOrCreate(
            [
                'user_id' =>
                    $r->user()->id,
                'lesson_content_id' =>
                    $id,
            ],
            $patch
        );

        return $this->state($r);
    }
}