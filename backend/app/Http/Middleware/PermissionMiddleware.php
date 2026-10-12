<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class PermissionMiddleware
{
    public function handle(
        Request $request,
        Closure $next,
        string $permission = ''
    ): Response {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'Unauthorized.',
            ], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Access denied.',
            ], 403);
        }

        /*
         * Super Admin always has unrestricted administrative access.
         */
        $isSuperAdmin = DB::table('admin_role_user as aru')
            ->join(
                'admin_roles as ar',
                'ar.id',
                '=',
                'aru.role_id'
            )
            ->where('aru.user_id', $user->id)
            ->where('ar.slug', 'super-admin')
            ->exists();

        if ($isSuperAdmin) {
            return $next($request);
        }

        /*
         * When the route uses simply "permission",
         * determine the required permission from the route URI.
         */
        if ($permission === '') {
            $permission = $this->permissionForRoute($request);
        }

        /*
         * A protected Admin route without a permission mapping
         * is denied rather than silently becoming unrestricted.
         */
        if (!$permission) {
            return response()->json([
                'message' => 'Access denied.',
                'reason' => 'Administrative permission mapping is missing.',
            ], 403);
        }

        $allowed = DB::table('admin_role_user as aru')
            ->join(
                'admin_role_permission as arp',
                'arp.role_id',
                '=',
                'aru.role_id'
            )
            ->join(
                'admin_permissions as ap',
                'ap.id',
                '=',
                'arp.permission_id'
            )
            ->where('aru.user_id', $user->id)
            ->where('ap.key', $permission)
            ->exists();

        if (!$allowed) {
            return response()->json([
                'message' => 'Access denied.',
                'required_permission' => $permission,
            ], 403);
        }

        return $next($request);
    }

    private function permissionForRoute(Request $request): ?string
    {
        $route = $request->route();

        if (!$route) {
            return null;
        }

        $uri = trim($route->uri(), '/');

        /*
         * Roles & permissions
         */
        if (
            $uri === 'admin/rbac' ||
            str_starts_with($uri, 'admin/rbac/')
        ) {
            return 'roles.manage';
        }

        /*
         * Parents / guardians
         */
        if (
            $uri === 'admin/parents' ||
            str_starts_with($uri, 'admin/parents/')
        ) {
            return 'parents.manage';
        }

        /*
         * Admin workspace
         */
        if ($uri === 'admin/stats') {
            return 'analytics.view';
        }

        if (
            $uri === 'admin/users' ||
            str_starts_with($uri, 'admin/users/')
        ) {
            return 'users.manage';
        }

        if (
            $uri === 'admin/practice-sets' ||
            str_starts_with($uri, 'admin/practice-sets/')
        ) {
            return 'practice.manage';
        }

        if (
            $uri === 'admin/announcements' ||
            str_starts_with($uri, 'admin/announcements/')
        ) {
            return 'notifications.manage';
        }

        /*
         * Blog
         */
        if (
            $uri === 'blog-posts' ||
            str_starts_with($uri, 'blog-posts/')
        ) {
            return 'blog.manage';
        }

        /*
         * Media library
         */
        if (
            $uri === 'media-assets' ||
            str_starts_with($uri, 'media-assets/')
        ) {
            return 'media.manage';
        }

        /*
         * Curriculum structure
         */
        foreach ([
            'boards',
            'grades',
            'subjects',
            'units',
            'chapters',
            'lessons',
        ] as $prefix) {
            if (
                $uri === $prefix ||
                str_starts_with(
                    $uri,
                    $prefix . '/'
                )
            ) {
                return 'curriculum.manage';
            }
        }

        /*
         * Learning content
         */
        foreach ([
            'interactive-apps',
            'lesson-contents',
            'flashcard-decks',
        ] as $prefix) {
            if (
                $uri === $prefix ||
                str_starts_with(
                    $uri,
                    $prefix . '/'
                )
            ) {
                return 'content.manage';
            }
        }

        return null;
    }
}