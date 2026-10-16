<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lesson;
use App\Models\LessonContent;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LessonAttachmentAccessController extends Controller
{
    public function show(Request $request, LessonContent $content)
    {
        abort_unless(config('educational_storage.r2_signed_reads_enabled', false), 404);
        abort_unless($content->is_active &&
            $content->file_disk === 'r2' &&
            is_string($content->file_object_key) &&
            $content->file_object_key !== '', 404);

        // No stale approval / class assignment from an in-memory token model.
        $user = $request->user()?->fresh();
        abort_unless($user && $user->paused_at === null, 403);

        if ($user->role !== 'admin') {
            abort_unless(in_array($user->role, ['student', 'teacher'], true) &&
                $user->approval_status === 'approved', 403);

            $visible = Lesson::published()
                ->accessibleTo($user)
                ->whereKey($content->lesson_id)
                ->exists();

            // Approved teachers may preview their own unpublished lesson,
            // but only while they still have access to its assigned class.
            $ownDraft = $user->role === 'teacher' &&
                Lesson::query()->accessibleTo($user)
                    ->whereKey($content->lesson_id)
                    ->where('created_by', $user->id)
                    ->where('is_active', true)
                    ->exists();

            abort_unless($visible || $ownDraft, 403);
        }

        // Keys must match the owning lesson; never sign another namespace.
        $prefix = "lessons/{$content->lesson_id}/files/";
        abort_unless(str_starts_with($content->file_object_key, $prefix) &&
            ! str_contains($content->file_object_key, '..'), 404);

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
}
