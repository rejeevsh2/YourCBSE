<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InteractiveApp;
use App\Services\InteractiveAppAccess;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class InteractiveAppLaunchController extends Controller
{
    public function launch(Request $request, InteractiveApp $app, InteractiveAppAccess $access)
    {
        abort_unless(
            in_array($app->source_type, ['html', 'zip'], true), 422,
            'YourSchool cannot restrict access to third-party external websites.'
        );

        abort_unless($access->mayOpen($request->user(), $app), 403);

        $token = $request->user()->currentAccessToken();
        abort_unless($token instanceof PersonalAccessToken, 401);

        $ticket = Str::random(64);

        Cache::put('interactive-app-ticket:' . hash('sha256', $ticket), [
            'user_id' => $request->user()->id,
            'token_id' => $token->id,
            'app_id' => $app->id,
        ], now()->addSeconds(45));

        return response()->json([
            'launch_url' => url('/interactive-apps/' . $app->id . '/open?ticket=' . $ticket),
        ])->header('Cache-Control', 'no-store');
    }
}
