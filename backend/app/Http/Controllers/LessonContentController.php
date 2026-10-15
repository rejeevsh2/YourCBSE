<?php

namespace App\Http\Controllers;

use App\Models\LessonContent;
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
    public function store(Request $request)
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

        $fileUrl = null;

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store(
                'lesson-content',
                'public'
            );

            $fileUrl = asset('storage/' . $path);
        }

        $lessonContent = LessonContent::create([
            'lesson_id' => $validated['lesson_id'],
            'title' => $validated['title'],
            'content_type' => $validated['content_type'],
            'resource_category' => $validated['resource_category'] ?? null,
            'content' => $validated['content'] ?? null,
            'file_path' => $fileUrl,
            'external_url' => $validated['external_url'] ?? null,
            'display_order' => $validated['display_order'] ?? 1,
            'is_free' => $validated['is_free'] ?? true,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json(
            $lessonContent,
            201
        );
    }

    /**
     * Update existing lesson content.
     */
    public function update(Request $request, $id)
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

        $fileUrl = $lessonContent->file_path;
        $previousFileUrl = $fileUrl;

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store(
                'lesson-content',
                'public'
            );

            $fileUrl = asset('storage/' . $path);
        }

        $lessonContent->update([
            'lesson_id' => $validated['lesson_id'],
            'title' => $validated['title'],
            'content_type' => $validated['content_type'],
            'resource_category' => $validated['resource_category'] ?? null,
            'content' => $validated['content'] ?? null,
            'file_path' => $fileUrl,
            'external_url' => $validated['external_url'] ?? null,
            'display_order' => $validated['display_order'] ?? 1,
            'is_free' => $validated['is_free'] ?? true,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        if ($request->hasFile('file')) {
            $this->deleteLocalFile($previousFileUrl);
        }

        return response()->json(
            $lessonContent
        );
    }

    /**
     * Remove just the locally uploaded attachment, without deleting the
     * lesson content record, description or external resource URL.
     */
    public function removeFile($id)
    {
        $lessonContent = LessonContent::findOrFail($id);

        if (! $lessonContent->file_path) {
            return response()->json([
                'message' => 'This content has no uploaded file.',
            ], 422);
        }

        $oldFileUrl = $lessonContent->file_path;
        $lessonContent->update(['file_path' => null]);
        $this->deleteLocalFile($oldFileUrl);

        return response()->json([
            'message' => 'Uploaded file removed. Lesson content preserved.',
            'content' => $lessonContent->fresh(),
        ]);
    }

    /**
     * Never remove an arbitrary external URL from the storage disk.
     * Uploaded files are always inside our lesson-content directory.
     */
    private function deleteLocalFile(?string $url): void
    {
        if (! $url) {
            return;
        }

        $path = parse_url($url, PHP_URL_PATH);

        if (
            ! is_string($path) ||
            ! str_starts_with($path, '/storage/lesson-content/')
        ) {
            return;
        }

        // File URLs created by this app point to the current asset host.
        $host = parse_url($url, PHP_URL_HOST);
        $assetHost = parse_url(asset('storage/'), PHP_URL_HOST);

        if ($host && $assetHost && strcasecmp($host, $assetHost) !== 0) {
            return;
        }

        $relativePath = substr($path, strlen('/storage/'));

        if (
            $relativePath !== false &&
            ! str_contains($relativePath, '..')
        ) {
            Storage::disk('public')->delete($relativePath);
        }
    }

    /**
     * Delete lesson content.
     */
    public function destroy($id)
    {
        $lessonContent = LessonContent::findOrFail($id);

        // Remove the database record before its storage attachment.
        $fileUrl = $lessonContent->file_path;
        $lessonContent->delete();
        $this->deleteLocalFile($fileUrl);

        return response()->json([
            'message' =>
                'Lesson content deleted successfully.',
        ]);
    }
}
