<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class AdminAuditMiddleware
{
    private const AUDITED_METHODS = [
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
    ];

    public function handle(
        Request $request,
        Closure $next
    ): Response {
        /*
         * Let authentication, permissions, validation and the
         * controller action complete first.
         *
         * Only successful administrative mutations are audited.
         */
        $response = $next($request);

        if (! $this->shouldAudit(
            $request,
            $response
        )) {
            return $response;
        }

        try {
            $user = $request->user();
            $route = $request->route();

            AuditLog::create([
                'actor_user_id' => $user?->id,
                'actor_name' => $user?->name,
                'actor_email' => $user?->email,
                'actor_role' => $user?->role,

                'action' => $this->actionName(
                    $request
                ),

                'target' => $this->target(
                    $request
                ),

                'method' => strtoupper(
                    $request->method()
                ),

                'route_uri' => $route
                    ? $route->uri()
                    : null,

                'route_parameters' =>
                    $this->routeParameters(
                        $request
                    ),

                /*
                 * Never store submitted values.
                 * Only safe field names are retained.
                 */
                'changed_fields' =>
                    $this->changedFields(
                        $request
                    ),

                'ip_address' => $request->ip(),

                'user_agent' => Str::limit(
                    (string) $request->userAgent(),
                    1000,
                    ''
                ),

                'response_status' =>
                    $response->getStatusCode(),

                'occurred_at' => now(),
            ]);
        } catch (Throwable $exception) {
            /*
             * Audit storage failure must never turn a successful
             * administrative action into a failed request.
             */
            Log::warning(
                'Admin audit log write failed.',
                [
                    'exception' =>
                        get_class($exception),

                    'message' =>
                        $exception->getMessage(),
                ]
            );
        }

        return $response;
    }

    private function shouldAudit(
        Request $request,
        Response $response
    ): bool {
        if (
            ! in_array(
                strtoupper($request->method()),
                self::AUDITED_METHODS,
                true
            )
        ) {
            return false;
        }

        /*
         * Audit only successful responses.
         * Validation failures, denied permissions and server
         * errors are not recorded as completed admin actions.
         */
        $status = $response->getStatusCode();

        if ($status < 200 || $status >= 300) {
            return false;
        }

        $user = $request->user();

        if (
            ! $user ||
            $user->role !== 'admin'
        ) {
            return false;
        }

        $route = $request->route();

        if (! $route) {
            return false;
        }

        /*
         * Administrative routes in this project are identified by:
         *
         * 1. an admin URI, or
         * 2. RBAC permission middleware.
         *
         * The second rule also captures curriculum/content routes
         * such as grades, subjects and lessons that do not all use
         * an /admin URI prefix.
         */
        $uri = trim(
            $route->uri(),
            '/'
        );

        if (
            str_starts_with(
                $uri,
                'admin/'
            ) ||
            str_starts_with(
                $uri,
                'api/admin/'
            )
        ) {
            return true;
        }

        foreach (
            $route->gatherMiddleware()
            as $middleware
        ) {
            if (
                $middleware === 'permission' ||
                str_starts_with(
                    $middleware,
                    'permission:'
                )
            ) {
                return true;
            }
        }

        return false;
    }

    private function actionName(
        Request $request
    ): string {
        $route = $request->route();

        $controllerAction =
            $route?->getActionName();

        $methodName = null;

        if (
            is_string($controllerAction) &&
            str_contains(
                $controllerAction,
                '@'
            )
        ) {
            $methodName = Str::afterLast(
                $controllerAction,
                '@'
            );
        }

        if ($methodName) {
            $action = match (
                strtolower($methodName)
            ) {
                'store',
                'create' => 'create',

                'update',
                'updatesettings' => 'update',

                'destroy',
                'delete' => 'delete',

                default => Str::snake(
                    $methodName
                ),
            };

            return Str::limit(
                $action,
                50,
                ''
            );
        }

        return match (
            strtoupper($request->method())
        ) {
            'POST' => 'create',
            'PUT',
            'PATCH' => 'update',
            'DELETE' => 'delete',
            default => 'action',
        };
    }

    private function target(
        Request $request
    ): string {
        $route = $request->route();

        if (! $route) {
            return Str::limit(
                $request->path(),
                255,
                ''
            );
        }

        $target = $route->uri();

        foreach (
            $this->routeParameters(
                $request
            )
            as $key => $value
        ) {
            $target = str_replace(
                [
                    '{'.$key.'}',
                    '{'.$key.'?}',
                ],
                (string) $value,
                $target
            );
        }

        return Str::limit(
            $target,
            255,
            ''
        );
    }

    private function routeParameters(
        Request $request
    ): array {
        $route = $request->route();

        if (! $route) {
            return [];
        }

        $safe = [];

        foreach (
            $route->parameters()
            as $key => $value
        ) {
            if (
                $this->isSensitiveName(
                    (string) $key
                )
            ) {
                $safe[$key] = '[REDACTED]';
                continue;
            }

            if ($value instanceof Model) {
                $value =
                    $value->getRouteKey();
            }

            if (
                is_string($value) ||
                is_numeric($value)
            ) {
                $safe[$key] = Str::limit(
                    (string) $value,
                    255,
                    ''
                );

                continue;
            }

            if (
                is_bool($value)
            ) {
                $safe[$key] =
                    $value
                        ? 'true'
                        : 'false';

                continue;
            }

            $safe[$key] = '[OBJECT]';
        }

        return $safe;
    }

    private function changedFields(
        Request $request
    ): array {
        $keys = array_unique(
            array_merge(
                array_keys(
                    $request->all()
                ),
                array_keys(
                    $request->allFiles()
                )
            )
        );

        $safe = [];

        foreach ($keys as $key) {
            $key = (string) $key;

            if (
                $this->isSensitiveName(
                    $key
                )
            ) {
                continue;
            }

            $safe[] = Str::limit(
                $key,
                100,
                ''
            );
        }

        sort($safe);

        /*
         * Prevent an abnormal request containing thousands
         * of keys from bloating the audit record.
         */
        return array_slice(
            $safe,
            0,
            100
        );
    }

    private function isSensitiveName(
        string $name
    ): bool {
        $normalised = strtolower(
            str_replace(
                [
                    '-',
                    '.',
                    ' ',
                ],
                '_',
                $name
            )
        );

        foreach ([
            'password',
            'password_confirmation',
            'current_password',
            'token',
            'access_token',
            'refresh_token',
            'api_key',
            'apikey',
            'secret',
            'credential',
            'credentials',
            'authorization',
        ] as $sensitive) {
            if (
                str_contains(
                    $normalised,
                    $sensitive
                )
            ) {
                return true;
            }
        }

        return false;
    }
}