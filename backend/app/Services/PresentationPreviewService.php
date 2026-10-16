<?php

namespace App\Services;

use App\Models\LessonContent;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class PresentationPreviewService
{
    public function enabled(): bool
    {
        return (bool) config('presentation_previews.enabled', false);
    }

    public function prefix(LessonContent $content): ?string
    {
        if ($content->content_type !== 'ppt' || $content->file_disk !== 'r2') {
            return null;
        }

        $key = $content->file_object_key;
        $lessonId = (int) $content->lesson_id;
        $contentId = (int) $content->id;

        if (! is_string($key) ||
            ! preg_match('~^lessons/'.preg_quote((string) $lessonId, '~').'/files/[0-9a-f-]{36}\\.(?:ppt|pptx)$~i', $key)) {
            return null;
        }

        $version = substr(hash('sha256', $key), 0, 24);

        return "lessons/{$lessonId}/previews/{$contentId}/{$version}";
    }

    public function manifest(LessonContent $content): ?array
    {
        $prefix = $this->prefix($content);
        if (! $prefix) {
            return null;
        }

        $disk = Storage::disk('r2');
        $key = $prefix.'/manifest.json';

        if (! $disk->exists($key)) {
            return null;
        }

        $manifest = json_decode($disk->get($key), true);
        if (! is_array($manifest) || ! isset($manifest['slides']) || ! is_array($manifest['slides'])) {
            return null;
        }

        $slides = $manifest['slides'];
        $count = count($slides);
        if ($count < 1 || $count > (int) config('presentation_previews.max_slides', 80)) {
            return null;
        }

        foreach ($slides as $index => $slide) {
            $expected = sprintf('%s/slides/slide-%04d.jpg', $prefix, $index + 1);
            if (! is_string($slide) || $slide !== $expected) {
                return null;
            }
        }

        return $slides;
    }

    public function requestConversion(LessonContent $content): bool
    {
        $prefix = $this->prefix($content);
        $url = config('presentation_previews.converter_url');
        $token = config('presentation_previews.converter_token');

        if (! $this->enabled() || ! $prefix || ! is_string($url) ||
            ! preg_match('~^https://[^/]+~', $url) ||
            ! is_string($token) || strlen($token) < 32) {
            return false;
        }

        try {
            $response = Http::withToken($token)
                ->acceptJson()
                ->timeout(8)
                ->post(rtrim($url, '/').'/convert', [
                    'lesson_id' => (int) $content->lesson_id,
                    'content_id' => (int) $content->id,
                    'source_key' => $content->file_object_key,
                    'preview_prefix' => $prefix,
                ]);

            if ($response->status() === 202) {
                return true;
            }

            Log::warning('Presentation converter rejected a request', [
                'content_id' => $content->id,
                'status' => $response->status(),
            ]);
        } catch (\Throwable $exception) {
            Log::warning('Presentation converter unavailable', [
                'content_id' => $content->id,
                'exception' => get_class($exception),
            ]);
        }

        return false;
    }

    public function deletePreviews(LessonContent $content): void
    {
        $prefix = $this->prefix($content);
        if (! $prefix) {
            return;
        }

        try {
            Storage::disk('r2')->deleteDirectory($prefix);
        } catch (\Throwable $exception) {
            // An unavailable preview cleanup must not lose an existing lesson record.
            Log::warning('Could not clean up old presentation previews', [
                'content_id' => $content->id,
                'exception' => get_class($exception),
            ]);
        }
    }
}
