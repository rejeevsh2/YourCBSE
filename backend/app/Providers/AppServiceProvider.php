<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        \Illuminate\Auth\Notifications\ResetPassword::createUrlUsing(function ($user, string $token) {
            $frontend = explode(',', env('FRONTEND_URL', 'http://localhost:8080'))[0];
            return rtrim($frontend, '/') . '/reset-password?' . http_build_query([
                'email' => $user->email, 'token' => $token,
            ]);
        });
    }
}

