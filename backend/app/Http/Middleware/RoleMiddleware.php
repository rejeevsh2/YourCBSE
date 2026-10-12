<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        // Check if user is logged in
        if (!$request->user()) {
            return response()->json([
                'message' => 'Unauthorized.'
            ], 401);
        }

        // Check user role
        if ($request->user()->role !== $role) {
            return response()->json([
                'message' => 'Access denied.'
            ], 403);
        }

        return $next($request);
    }
}
