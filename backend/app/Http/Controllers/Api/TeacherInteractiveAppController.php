<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\InteractiveAppController;
use App\Models\InteractiveApp;
use App\Models\Lesson;
use Illuminate\Http\Request;

class TeacherInteractiveAppController extends InteractiveAppController
{
    /**
     * List interactive apps attached only to lessons
     * owned by the authenticated teacher.
     */
    public function index()
    {
        $request = request();

        return InteractiveApp::query()
            ->whereHas(
                'lesson',
                function ($query) use ($request) {
                    $query
                        ->accessibleTo(
                            $request->user()
                        )
                        ->where(
                            'created_by',
                            $request->user()->id
                        );
                }
            )
            ->with([
                'lesson.chapter.unit.subject.grade'
            ])
            ->orderBy('display_order')
            ->orderBy('id')
            ->get();
    }

    /**
     * Show one teacher-owned interactive app.
     */
    public function show($id)
    {
        $request = request();
        return $this->ownedApp(
            $request,
            $id
        )->load(
            'lesson.chapter.unit.subject.grade'
        );
    }

    /**
     * Create an interactive app on a teacher-owned
     * draft lesson.
     *
     * Teachers cannot publish apps directly.
     */
    public function store(Request $request)
    {
        $validated =
            $this->validateRequest($request);

        $lesson =
            $this->ownedLesson(
                $request,
                (int) $validated['lesson_id']
            );

        $this->ensureLessonEditable(
            $lesson
        );

        if (
            in_array(
                $validated['source_type'],
                ['html', 'zip'],
                true
            ) &&
            !$request->hasFile('file')
        ) {
            return response()->json([
                'message' =>
                    'Please upload an HTML or ZIP file.',
                'errors' => [
                    'file' => [
                        'A file is required for HTML and ZIP interactive apps.'
                    ]
                ]
            ], 422);
        }

        if (
            $validated['source_type'] ===
                'external' &&
            empty(
                $validated['external_url']
            )
        ) {
            return response()->json([
                'message' =>
                    'Please enter an external URL.',
                'errors' => [
                    'external_url' => [
                        'An external URL is required for an external interactive app.'
                    ]
                ]
            ], 422);
        }

        $filePath = null;
        $entryUrl = null;

        if (
            $validated['source_type'] ===
            'external'
        ) {
            $entryUrl =
                $validated['external_url'];
        }

        if (
            $validated['source_type'] ===
            'html'
        ) {
            $result =
                $this->storeHtmlApp(
                    $request->file('file')
                );

            $filePath =
                $result['file_path'];

            $entryUrl =
                $result['entry_url'];
        }

        if (
            $validated['source_type'] ===
            'zip'
        ) {
            try {
                $result =
                    $this->storeZipApp(
                        $request->file('file')
                    );

                $filePath =
                    $result['file_path'];

                $entryUrl =
                    $result['entry_url'];

            } catch (\Throwable $e) {
                return response()->json([
                    'message' =>
                        $e->getMessage(),
                    'errors' => [
                        'file' => [
                            $e->getMessage()
                        ]
                    ]
                ], 422);
            }
        }

        $interactiveApp =
            InteractiveApp::create([
                'lesson_id' =>
                    $lesson->id,

                'title' =>
                    $validated['title'],

                'description' =>
                    $validated['description']
                        ?? null,

                'source_type' =>
                    $validated['source_type'],

                'file_path' =>
                    $filePath,

                'external_url' =>
                    $validated['source_type']
                        === 'external'
                        ? $validated['external_url']
                        : null,

                'entry_url' =>
                    $entryUrl,

                'version' =>
                    $validated['version']
                        ?? '1.0',

                'display_order' =>
                    $validated['display_order']
                        ?? 1,

                /*
                 * Teacher-created apps always begin
                 * as drafts.
                 */
                'is_published' =>
                    false,

                'is_active' =>
                    $validated['is_active']
                        ?? true,
            ]);

        return response()->json(
            $interactiveApp->load(
                'lesson.chapter.unit.subject.grade'
            ),
            201
        );
    }

    /**
     * Update an app only when both the app and
     * its lesson are still editable drafts.
     */
    public function update(
        Request $request,
        $id
    ) {
        $interactiveApp =
            $this->ownedApp(
                $request,
                $id
            );

        $this->ensureAppEditable(
            $interactiveApp
        );

        $validated =
            $this->validateRequest($request);

        $targetLesson =
            $this->ownedLesson(
                $request,
                (int) $validated['lesson_id']
            );

        $this->ensureLessonEditable(
            $targetLesson
        );

        if (
            $validated['source_type'] ===
                'external' &&
            empty(
                $validated['external_url']
            )
        ) {
            return response()->json([
                'message' =>
                    'Please enter an external URL.',
                'errors' => [
                    'external_url' => [
                        'An external URL is required for an external interactive app.'
                    ]
                ]
            ], 422);
        }

        /*
         * Changing to a different uploaded source
         * type requires a replacement file.
         */
        if (
            in_array(
                $validated['source_type'],
                ['html', 'zip'],
                true
            ) &&
            $validated['source_type'] !==
                $interactiveApp->source_type &&
            !$request->hasFile('file')
        ) {
            return response()->json([
                'message' =>
                    'Please upload a replacement app file.',
                'errors' => [
                    'file' => [
                        'A replacement file is required when changing the app source type.'
                    ]
                ]
            ], 422);
        }

        $filePath =
            $interactiveApp->file_path;

        $entryUrl =
            $interactiveApp->entry_url;

        /*
         * Switch to an external app.
         */
        if (
            $validated['source_type'] ===
            'external'
        ) {
            $this->deleteStoredApp(
                $interactiveApp
            );

            $filePath = null;

            $entryUrl =
                $validated['external_url'];
        }

        /*
         * Store the replacement first, then remove
         * the previous uploaded app.
         */
        if (
            $validated['source_type'] ===
                'html' &&
            $request->hasFile('file')
        ) {
            $result =
                $this->storeHtmlApp(
                    $request->file('file')
                );

            $this->deleteStoredApp(
                $interactiveApp
            );

            $filePath =
                $result['file_path'];

            $entryUrl =
                $result['entry_url'];
        }

        if (
            $validated['source_type'] ===
                'zip' &&
            $request->hasFile('file')
        ) {
            try {
                $result =
                    $this->storeZipApp(
                        $request->file('file')
                    );

                $this->deleteStoredApp(
                    $interactiveApp
                );

                $filePath =
                    $result['file_path'];

                $entryUrl =
                    $result['entry_url'];

            } catch (\Throwable $e) {
                return response()->json([
                    'message' =>
                        $e->getMessage(),
                    'errors' => [
                        'file' => [
                            $e->getMessage()
                        ]
                    ]
                ], 422);
            }
        }

        $interactiveApp->update([
            'lesson_id' =>
                $targetLesson->id,

            'title' =>
                $validated['title'],

            'description' =>
                $validated['description']
                    ?? null,

            'source_type' =>
                $validated['source_type'],

            'file_path' =>
                $filePath,

            'external_url' =>
                $validated['source_type']
                    === 'external'
                    ? $validated['external_url']
                    : null,

            'entry_url' =>
                $entryUrl,

            'version' =>
                $validated['version']
                    ?? '1.0',

            'display_order' =>
                $validated['display_order']
                    ?? 1,

            /*
             * Teacher cannot publish through
             * this endpoint.
             */
            'is_published' =>
                false,

            'is_active' =>
                $validated['is_active']
                    ?? true,
        ]);

        return response()->json(
            $interactiveApp
                ->fresh()
                ->load(
                    'lesson.chapter.unit.subject.grade'
                )
        );
    }

    /**
     * Delete only a teacher-owned editable app.
     */
    public function destroy($id)
    {
        $request = request();
        $interactiveApp =
            $this->ownedApp(
                $request,
                $id
            );

        $this->ensureAppEditable(
            $interactiveApp
        );

        $this->deleteStoredApp(
            $interactiveApp
        );

        $interactiveApp->delete();

        return response()->json([
            'message' =>
                'Interactive app deleted successfully.'
        ]);
    }

    private function ownedLesson(
        Request $request,
        int $id
    ): Lesson {
        return Lesson::query()
            ->accessibleTo($request->user())
            ->where('id', $id)
            ->where(
                'created_by',
                $request->user()->id
            )
            ->firstOrFail();
    }

    private function ownedApp(
        Request $request,
        int $id
    ): InteractiveApp {
        return InteractiveApp::query()
            ->where('id', $id)
            ->whereHas(
                'lesson',
                function ($query) use ($request) {
                    $query
                        ->accessibleTo(
                            $request->user()
                        )
                        ->where(
                            'created_by',
                            $request->user()->id
                        );
                }
            )
            ->firstOrFail();
    }

    private function ensureLessonEditable(
        Lesson $lesson
    ): void {
        if ($lesson->is_published) {
            abort(
                409,
                'Published lessons cannot be modified.'
            );
        }
    }

    private function ensureAppEditable(
        InteractiveApp $interactiveApp
    ): void {
        if ($interactiveApp->is_published) {
            abort(
                409,
                'Published interactive apps cannot be modified.'
            );
        }

        $interactiveApp->loadMissing(
            'lesson'
        );

        if (
            $interactiveApp->lesson &&
            $interactiveApp->lesson->is_published
        ) {
            abort(
                409,
                'Interactive apps on published lessons cannot be modified.'
            );
        }
    }
}