<?php

namespace App\Services;

use App\Models\LessonContent;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class LessonAttachmentStorage
{
    public function upload(UploadedFile $file, int $lessonId): array
    {
        if (config('educational_storage.r2_new_uploads_enabled', false)) {
            // Keys are entirely server-generated and are always scoped to the lesson.
            $name = (string) Str::uuid().'.'.$file->extension();
            $key = $file->storeAs("lessons/{$lessonId}/files", $name, 'r2');

            if (! is_string($key) || $key === '') {
                throw new \RuntimeException('Educational file could not be stored.');
            }

            return [
                'file_path' => null,
                'file_disk' => 'r2',
                'file_object_key' => $key,
                'file_mime_type' => $file->getMimeType(),
                'file_size_bytes' => $file->getSize(),
            ];
        }

        // Legacy storage path is unchanged until the new frontend and APK
        // both support private R2 links.
        $path = $file->store('lesson-content', 'public');

        if (! is_string($path) || $path === '') {
            throw new \RuntimeException('Educational file could not be stored.');
        }

        return [
            'file_path' => asset('storage/'.$path),
            'file_disk' => 'public',
            'file_object_key' => $path,
            'file_mime_type' => $file->getMimeType(),
            'file_size_bytes' => $file->getSize(),
        ];
    }

    /**
     * Remove only assets created by YourSchool. This routine never trusts
     * arbitrary external file URLs or model-supplied object keys.
     */
    public function delete(?string $disk, ?string $key, ?string $legacyUrl, int $lessonId): void
    {
        if ($disk === 'r2') {
            $prefix = "lessons/{$lessonId}/files/";
            $filename = is_string($key) && str_starts_with($key, $prefix)
                ? substr($key, strlen($prefix))
                : null;

            if (is_string($filename) &&
                preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{1,10}$/i', $filename)) {
                Storage::disk('r2')->delete($key);
            }

            return;
        }

        if (! is_string($legacyUrl)) {
            return;
        }

        $path = parse_url($legacyUrl, PHP_URL_PATH);
        if (! is_string($path) ||
            ! str_starts_with($path, '/storage/lesson-content/')) {
            return;
        }

        $host = parse_url($legacyUrl, PHP_URL_HOST);
        $assetHost = parse_url(asset('storage/'), PHP_URL_HOST);
        if ($host && $assetHost && strcasecmp($host, $assetHost) !== 0) {
            return;
        }

        $relative = substr($path, strlen('/storage/'));
        if (is_string($relative) && ! str_contains($relative, '..')) {
            Storage::disk('public')->delete($relative);
        }
    }

    public function deleteModel(LessonContent $content): void
    {
        $this->delete(
            $content->file_disk,
            $content->file_object_key,
            $content->file_path,
            (int) $content->lesson_id,
        );
    }
}
