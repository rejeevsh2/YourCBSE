<?php

namespace App\Services;

use App\Models\InteractiveApp;
use App\Models\Lesson;
use App\Models\User;

class InteractiveAppAccess
{
    public function mayOpen(User $user, InteractiveApp $app): bool
    {
        if ($user->paused_at !== null || ! $app->is_active) {
            return false;
        }

        if ($user->role === 'admin') {
            return true;
        }

        if (! in_array($user->role, ['student', 'teacher'], true) ||
            $user->approval_status !== 'approved') {
            return false;
        }

        $lesson = Lesson::query()
            ->accessibleTo($user)
            ->whereKey($app->lesson_id)
            ->first();

        if (! $lesson) {
            return false;
        }

        if ($user->role === 'teacher' &&
            (int) $lesson->created_by === (int) $user->id) {
            return true;
        }

        return (bool) $app->is_published
            && (bool) $lesson->is_published
            && (bool) $lesson->is_active
            && Lesson::published()->whereKey($lesson->id)->exists();
    }

    public function entryPath(InteractiveApp $app): ?string
    {
        $directory = $this->directory($app);
        if ($directory === null) {
            return null;
        }

        $storedUrl = $app->getRawOriginal('entry_url');
        $path = parse_url($storedUrl ?: '', PHP_URL_PATH);
        $path = is_string($path) ? ltrim($path, '/') : '';
        $needle = $directory . '/';
        $offset = strpos($path, $needle);

        if ($offset !== false) {
            return $this->safeRelativePath(
                substr($path, $offset + strlen($needle))
            );
        }

        return $app->source_type === 'html' ? 'index.html' : null;
    }

    public function directory(InteractiveApp $app): ?string
    {
        if (! in_array($app->source_type, ['html', 'zip'], true)) {
            return null;
        }

        $dir = $app->file_path;

        // Paths are allocated by the uploader, never provided by the user.
        return is_string($dir) &&
            preg_match('~^interactive-apps/[0-9a-f]{8}-[0-9a-f-]{27}$~i', $dir)
                ? $dir
                : null;
    }

    public function safeRelativePath(?string $path): ?string
    {
        if (! is_string($path) || $path === '' ||
            str_contains($path, "\\") ||
            str_contains($path, "\0") ||
            str_starts_with($path, '/')) {
            return null;
        }

        $parts = explode('/', $path);

        if (count($parts) > 50) {
            return null;
        }

        foreach ($parts as $part) {
            if ($part === '' || $part === '.' || $part === '..' ||
                str_starts_with($part, '.')) {
                return null;
            }
        }

        return $path;
    }
}
