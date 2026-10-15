<?php

namespace App\Http\Controllers;

use App\Models\InteractiveApp;
use App\Models\User;
use App\Services\InteractiveAppAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\PersonalAccessToken;

class InteractiveAppFileController extends Controller
{
    private const SESSION_MINUTES = 30;

    public function open(Request $request, InteractiveApp $app, InteractiveAppAccess $access)
    {
        $this->assertUploaded($app);

        $cookie = null;
        $ticket = $request->query('ticket');

        if (is_string($ticket) && preg_match('/^[A-Za-z0-9]{64}$/', $ticket)) {
            $payload = Cache::pull('interactive-app-ticket:' . hash('sha256', $ticket));
            abort_unless(
                is_array($payload) &&
                (int) ($payload['app_id'] ?? 0) === (int) $app->id,
                403
            );

            $token = PersonalAccessToken::find($payload['token_id'] ?? 0);
            $user = $token?->tokenable;
            abort_unless(
                $user instanceof User &&
                (int) $user->id === (int) $payload['user_id'] &&
                $this->tokenValid($token) &&
                $access->mayOpen($user, $app),
                403
            );

            // Laravel's web middleware encrypts/decrypts its HttpOnly cookie.
            // The path restricts it to this app, never to the /api endpoints.
            $cookie = cookie(
                'ys_app_' . $app->id,
                $user->id . ':' . $token->id,
                self::SESSION_MINUTES,
                '/interactive-apps/' . $app->id,
                null,
                $request->isSecure(),
                true,
                false,
                'lax'
            );
        } elseif (! $this->authorizedByCookie($request, $app, $access)) {
            return $this->redirectToFrontend($app);
        }

        $entryPath = $access->entryPath($app);
        abort_unless($entryPath !== null, 404);

        $response = redirect('/interactive-apps/' . $app->id .
            '/files/' . implode('/', array_map('rawurlencode', explode('/', $entryPath))));

        $response->header('Cache-Control', 'private, no-store')
            ->header('Referrer-Policy', 'no-referrer');

        return $cookie ? $response->withCookie($cookie) : $response;
    }

    public function file(Request $request, InteractiveApp $app, string $path, InteractiveAppAccess $access)
    {
        $this->assertUploaded($app);

        if (! $this->authorizedByCookie($request, $app, $access)) {
            if ($this->isDocument($request, $path)) {
                return $this->redirectToFrontend($app);
            }

            return response('Authentication required.', 401)
                ->header('Cache-Control', 'no-store');
        }

        $safePath = $access->safeRelativePath($path);
        abort_unless($safePath !== null, 404);

        $directory = $access->directory($app);
        abort_unless($directory !== null, 404);

        $disk = Storage::disk('local');
        $root = realpath($disk->path($directory));
        $target = realpath($disk->path($directory . '/' . $safePath));

        abort_unless($root && $target &&
            str_starts_with($target, $root . DIRECTORY_SEPARATOR) &&
            is_file($target), 404);

        $extension = strtolower(pathinfo($target, PATHINFO_EXTENSION));
        $mimes = [
            'html' => 'text/html; charset=UTF-8',
            'htm' => 'text/html; charset=UTF-8',
            'js' => 'text/javascript; charset=UTF-8',
            'mjs' => 'text/javascript; charset=UTF-8',
            'css' => 'text/css; charset=UTF-8',
            'json' => 'application/json',
            'wasm' => 'application/wasm',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'webp' => 'image/webp',
            'svg' => 'image/svg+xml',
            'ico' => 'image/x-icon',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf' => 'font/ttf',
            'otf' => 'font/otf',
            'mp3' => 'audio/mpeg',
            'ogg' => 'audio/ogg',
            'wav' => 'audio/wav',
            'mp4' => 'video/mp4',
            'webm' => 'video/webm',
            'txt' => 'text/plain; charset=UTF-8',
            'xml' => 'application/xml',
        ];

        if (! isset($mimes[$extension])) {
            return response('File type unavailable.', 415)
                ->header('Cache-Control', 'no-store');
        }

        $response = response()->file($target, [
            'Content-Type' => $mimes[$extension],
            'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
            'Referrer-Policy' => 'no-referrer',
        ]);

        // Assets use the same path-scoped, encrypted session as index.html.
        if (in_array($extension, ['html', 'htm'], true)) {
            $response->headers->set(
                'Content-Security-Policy',
                "frame-ancestors 'self' https://www.yourschool.co.in https://yourschool.co.in"
            );
        }

        return $response;
    }

    private function authorizedByCookie(
        Request $request, InteractiveApp $app, InteractiveAppAccess $access
    ): bool {
        $value = $request->cookie('ys_app_' . $app->id);

        if (! is_string($value) ||
            ! preg_match('/^(\\d+):(\\d+)$/', $value, $matches)) {
            return false;
        }

        $token = PersonalAccessToken::find((int) $matches[2]);
        $user = $token?->tokenable;

        return $user instanceof User &&
            (int) $user->id === (int) $matches[1] &&
            $this->tokenValid($token) &&
            $access->mayOpen($user, $app);
    }

    private function tokenValid(PersonalAccessToken $token): bool
    {
        if ($token->expires_at && $token->expires_at->isPast()) {
            return false;
        }

        $expiration = config('sanctum.expiration');
        return ! $expiration ||
            $token->created_at->copy()->addMinutes((int) $expiration)->isFuture();
    }

    private function assertUploaded(InteractiveApp $app): void
    {
        abort_unless(in_array($app->source_type, ['html', 'zip'], true), 404);
    }

    private function redirectToFrontend(InteractiveApp $app)
    {
        return redirect()->away(
            rtrim(config('app.frontend_url'), '/') . '/interactive-app/' . $app->id
        )->header('Cache-Control', 'no-store')
            ->header('Referrer-Policy', 'no-referrer');
    }

    private function isDocument(Request $request, string $path): bool
    {
        $path = strtolower($path);

        return str_ends_with($path, '.html') ||
            str_ends_with($path, '.htm') ||
            str_contains($request->header('Accept', ''), 'text/html');
    }
}
