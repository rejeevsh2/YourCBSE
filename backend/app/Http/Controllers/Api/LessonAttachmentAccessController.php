<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonContent;
use App\Models\User;
use App\Services\PresentationPreviewService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LessonAttachmentAccessController extends Controller
{
    private function authorizeAttachment(Request $request, LessonContent $content): User
    {
        abort_unless(config('educational_storage.r2_signed_reads_enabled', false), 404);
        abort_unless($content->is_active &&
            $content->file_disk === 'r2' &&
            is_string($content->file_object_key) &&
            $content->file_object_key !== '', 404);

        $user = $request->user()?->fresh();
        abort_unless($user && $user->paused_at === null, 403);

        if ($user->role === 'student') {
            abort_unless($content->is_free, 403);
        }

        if ($user->role !== 'admin') {
            abort_unless(in_array($user->role, ['student', 'teacher'], true) &&
                $user->approval_status === 'approved', 403);

            $visible = Lesson::published()
                ->accessibleTo($user)
                ->whereKey($content->lesson_id)
                ->exists();

            $ownDraft = $user->role === 'teacher' &&
                Lesson::query()->accessibleTo($user)
                    ->whereKey($content->lesson_id)
                    ->where('created_by', $user->id)
                    ->where('is_active', true)
                    ->exists();

            abort_unless($visible || $ownDraft, 403);
        }

        $prefix = "lessons/{$content->lesson_id}/files/";
        abort_unless(str_starts_with($content->file_object_key, $prefix) &&
            ! str_contains($content->file_object_key, '..'), 404);

        return $user;
    }

    public function show(Request $request, LessonContent $content, PresentationPreviewService $previews)
    {
        $user = $this->authorizeAttachment($request, $content);

        // Once slide previews are enabled, students only receive rendered slides,
        // not a signed URL to the original private PowerPoint.
        abort_if(
            $previews->enabled() && $content->content_type === 'ppt' && $user->role === 'student',
            403,
            'Use the lesson presentation viewer.'
        );

        $expiresAt = now()->addSeconds((int) config('educational_storage.r2_url_ttl_seconds', 120));
        $url = Storage::disk('r2')->temporaryUrl(
            $content->file_object_key,
            $expiresAt,
            ['ResponseContentDisposition' => 'inline'],
        );

        return response()->json([
            'url' => $url,
            'expires_at' => $expiresAt->toIso8601String(),
            'mime_type' => $content->file_mime_type,
        ])->withHeaders([
            'Cache-Control' => 'private, no-store',
            'Referrer-Policy' => 'no-referrer',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function slides(Request $request, LessonContent $content, PresentationPreviewService $previews)
    {
        $this->authorizeAttachment($request, $content);
        abort_unless($previews->enabled() && $content->content_type === 'ppt', 404);

        $slides = $previews->manifest($content);
        if ($slides === null) {
            return response()->json([
                'status' => 'processing',
                'message' => 'Slide preview is being prepared. Try again shortly.',
            ])->header('Cache-Control', 'no-store, private');
        }

        $expiresAt = now()->addSeconds((int) config('educational_storage.r2_url_ttl_seconds', 120));
        $signed = [];
        foreach ($slides as $index => $key) {
            $signed[] = [
                'number' => $index + 1,
                'url' => Storage::disk('r2')->temporaryUrl(
                    $key,
                    $expiresAt,
                    ['ResponseContentDisposition' => 'inline'],
                ),
            ];
        }

        return response()->json([
            'status' => 'ready',
            'count' => count($signed),
            'slides' => $signed,
            'expires_at' => $expiresAt->toIso8601String(),
        ])->withHeaders([
            'Cache-Control' => 'private, no-store',
            'Referrer-Policy' => 'no-referrer',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
