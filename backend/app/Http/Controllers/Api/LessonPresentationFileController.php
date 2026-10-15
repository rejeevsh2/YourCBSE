<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LessonPresentationFileController extends Controller
{
    /**
     * Stream an uploaded .ppt/.pptx into the authenticated browser viewer.
     *
     * The original lesson-content upload URL remains available separately
     * for downloads. Never fetch user-controlled external URLs server-side.
     */
    public function show(Request $request, LessonContent $content)
    {
        abort_unless(
            $content->content_type === 'ppt' &&
            $content->is_active &&
            $content->file_path,
            404
        );

        $user = $request->user()->fresh();
        abort_unless($user && ! $user->paused_at, 403);

        $lesson = $content->lesson;
        abort_unless($lesson, 404);

        if ($user->role === 'admin') {
            // Administrators can preview published and draft resources.
        } elseif (
            $user->role === 'teacher' &&
            $user->approval_status === 'approved' &&
            (int) $lesson->created_by === (int) $user->id &&
            Lesson::accessibleTo($user)->whereKey($lesson->id)->exists()
        ) {
            // A teacher may preview their own draft.
        } else {
            abort_unless(
                Lesson::published()
                    ->accessibleTo($user)
                    ->whereKey($lesson->id)
                    ->exists(),
                403
            );
        }

        // Only files saved by our uploader under storage/lesson-content/
        // may be served. Never read arbitrary paths or external links.
        $url = $content->file_path;
        $urlPath = parse_url($url, PHP_URL_PATH);
        $urlHost = parse_url($url, PHP_URL_HOST);
        $assetHost = parse_url(asset('storage/'), PHP_URL_HOST);

        abort_unless(
            is_string($urlPath) &&
            str_starts_with($urlPath, '/storage/lesson-content/') &&
            (! $urlHost || ! $assetHost ||
                strcasecmp($urlHost, $assetHost) === 0),
            404
        );

        $relative = substr($urlPath, strlen('/storage/'));
        $fileName = substr($relative, strlen('lesson-content/'));

        abort_unless(
            $fileName !== '' &&
            ! str_contains($fileName, '/') &&
            ! str_contains($fileName, '\\') &&
            ! str_contains($fileName, '..') &&
            preg_match('/^[a-zA-Z0-9_-]+\\.(ppt|pptx)$/i', $fileName),
            404
        );

        $disk = Storage::disk('public');
        abort_unless($disk->exists($relative), 404);

        $path = $disk->path($relative);
        $root = realpath($disk->path('lesson-content'));
        $actual = realpath($path);
        abort_unless(
            $root && $actual &&
            str_starts_with($actual, $root . DIRECTORY_SEPARATOR) &&
            is_file($actual),
            404
        );

        $isPptx = str_ends_with(strtolower($fileName), '.pptx');
        $mime = $isPptx
            ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            : 'application/vnd.ms-powerpoint';

        return response()->file($actual, [
            'Content-Type' => $mime,
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
            'Content-Disposition' => 'inline; filename="lesson-presentation.' .
                ($isPptx ? 'pptx' : 'ppt') . '"',
        ]);
    }
}
