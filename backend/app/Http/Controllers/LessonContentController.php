<?php

namespace App\Http\Controllers;

use App\Models\LessonContent;
use App\Services\LessonAttachmentStorage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class LessonContentController extends Controller
{
    /**
     * Display all lesson contents.
     */
    public function index()
    {
        return LessonContent::with('lesson')
            ->orderBy('display_order')
            ->get();
    }

    /**
     * Display one lesson content.
     */
    public function show($id)
    {
        return LessonContent::with('lesson')
            ->findOrFail($id);
    }

    /**
     * Create new lesson content.
     */
    public function store(Request $request, LessonAttachmentStorage $attachments)
    {
        $validated = $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'title' => 'required|string|max:255',

            'content_type' => [
                'required',
                Rule::in([
                    'text',
                    'video',
                    'pdf',
                    'image',
                    'audio',
                    'quiz',
                    'worksheet',
                    'ppt',
                    'activity',
                ]),
            ],

            'resource_category' => [
                'nullable',
                Rule::in([
                    'note',
                    'mind_map',
                ]),
            ],

            'content' => 'nullable|string',
            'external_url' => 'nullable|url|max:2048',
            'display_order' => 'nullable|integer|min:1|max:65535',
            'is_free' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',

            // Real uploaded file
            'file' => [
                'nullable',
                'file',
                'max:102400', // 100 MB
                'mimes:pdf,jpg,jpeg,png,webp,gif,mp3,wav,ogg,m4a,mp4,webm,mov,doc,docx,xls,xlsx,ppt,pptx,txt',
            ],
        ]);

        $file = $request->file('file');
        $fileDetails = $file
            ? $attachments->upload($file, (int) $validated['lesson_id'])
            : [];

        try {
            $lessonContent = LessonContent::create(array_merge([
                'lesson_id' => $validated['lesson_id'],
                'title' => $validated['title'],
                'content_type' => $validated['content_type'],
                'resource_category' => $validated['resource_category'] ?? null,
                'content' => $validated['content'] ?? null,
                'file_path' => null,
                'external_url' => $validated['external_url'] ?? null,
                'display_order' => $validated['display_order'] ?? 1,
                'is_free' => $validated['is_free'] ?? true,
                'is_active' => $validated['is_active'] ?? true,
            ], $fileDetails));
        } catch (\Throwable $e) {
            if ($file) {
                $attachments->delete(
                    $fileDetails['file_disk'],
                    $fileDetails['file_object_key'],
                    $fileDetails['file_path'],
                    (int) $validated['lesson_id']
                );
            }
            throw $e;
        }

        return response()->json(
            $lessonContent,
            201
        );
    }

    /**
     * Update existing lesson content.
     */
    public function update(Request $request, $id, LessonAttachmentStorage $attachments)
    {
        $lessonContent = LessonContent::findOrFail($id);

        $validated = $request->validate([
            'lesson_id' => 'required|exists:lessons,id',
            'title' => 'required|string|max:255',

            'content_type' => [
                'required',
                Rule::in([
                    'text',
                    'video',
                    'pdf',
                    'image',
                    'audio',
                    'quiz',
                    'worksheet',
                    'ppt',
                    'activity',
                ]),
            ],

            'resource_category' => [
                'nullable',
                Rule::in([
                    'note',
                    'mind_map',
                ]),
            ],

            'content' => 'nullable|string',
            'external_url' => 'nullable|url|max:2048',
            'display_order' => 'nullable|integer|min:1|max:65535',
            'is_free' => 'nullable|boolean',
            'is_active' => 'nullable|boolean',

            'file' => [
                'nullable',
                'file',
                'max:102400', // 100 MB
                'mimes:pdf,jpg,jpeg,png,webp,gif,mp3,wav,ogg,m4a,mp4,webm,mov,doc,docx,xls,xlsx,ppt,pptx,txt',
            ],
        ]);

        // An R2 object key belongs to exactly one lesson. Moving an
        // existing attachment without re-uploading it would invalidate
        // both namespace checks and class-scoped download permissions.
        abort_if(
            $lessonContent->file_disk === 'r2' &&
            (int) $lessonContent->lesson_id !== (int) $validated['lesson_id'] &&
            ! $request->hasFile('file'),
            422,
            'Upload a replacement file when moving a private attachment to another lesson.'
        );

        $previousFile = clone $lessonContent;
        $file = $request->file('file');
        $fileDetails = $file
            ? $attachments->upload($file, (int) $validated['lesson_id'])
            : [];

        try {
            $lessonContent->update(array_merge([
                'lesson_id' => $validated['lesson_id'],
                'title' => $validated['title'],
                'content_type' => $validated['content_type'],
                'resource_category' => $validated['resource_category'] ?? null,
                'content' => $validated['content'] ?? null,
                'external_url' => $validated['external_url'] ?? null,
                'display_order' => $validated['display_order'] ?? 1,
                'is_free' => $validated['is_free'] ?? true,
                'is_active' => $validated['is_active'] ?? true,
            ], $fileDetails));
        } catch (\Throwable $e) {
            if ($file) {
                $attachments->delete(
                    $fileDetails['file_disk'],
                    $fileDetails['file_object_key'],
                    $fileDetails['file_path'],
                    (int) $validated['lesson_id']
                );
            }
            throw $e;
        }

        if ($file) {
            // Metadata now references the replacement. Retire the old object.
            $attachments->deleteModel($previousFile);
        }

        return response()->json(
            $lessonContent
        );
    }

    /**
     * Remove just the locally uploaded attachment, without deleting the
     * lesson content record, description or external resource URL.
     */
    public function removeFile($id, LessonAttachmentStorage $attachments)
    {
        $lessonContent = LessonContent::findOrFail($id);

        if (! $lessonContent->file_path && ! $lessonContent->file_object_key) {
            return response()->json([
                'message' => 'This content has no uploaded file.',
            ], 422);
        }

        $oldFile = clone $lessonContent;
        $lessonContent->update([
            'file_path' => null,
            'file_disk' => null,
            'file_object_key' => null,
            'file_mime_type' => null,
            'file_size_bytes' => null,
        ]);
        $attachments->deleteModel($oldFile);

        return response()->json([
            'message' => 'Uploaded file removed. Lesson content preserved.',
            'content' => $lessonContent->fresh(),
        ]);
    }

    /**
     * Delete lesson content.
     */
    public function destroy($id, LessonAttachmentStorage $attachments)
    {
        $lessonContent = LessonContent::findOrFail($id);

        // Remove the database record before its storage attachment.
        $oldFile = clone $lessonContent;
        $lessonContent->delete();
        $attachments->deleteModel($oldFile);

        return response()->json([
            'message' =>
                'Lesson content deleted successfully.',
        ]);
    }
}
