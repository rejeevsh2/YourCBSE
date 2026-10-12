<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WebsiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminWebsiteSettingController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = WebsiteSetting::query()->firstOrCreate(
            ['id' => 1],
            [
                'site_name' => 'YourTeacher',
                'site_domain' => 'yourteacher.co.in',
                'tagline' => 'Everything You Need to Succeed in CBSE.',
                'default_meta_description' => 'Chapter-wise CBSE notes, video lessons, worksheets and interactive practice for Classes 6 to 12.',
                'open_registration' => true,
                'chapter_comments' => false,
                'maintenance_mode' => false,
            ]
        );

        return response()->json([
            'settings' => $settings,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $data = $request->validate([
            'site_name' => ['required', 'string', 'max:120'],
            'site_domain' => ['required', 'string', 'max:255'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'default_meta_description' => ['nullable', 'string', 'max:1000'],
            'open_registration' => ['required', 'boolean'],
            'chapter_comments' => ['required', 'boolean'],
            'maintenance_mode' => ['required', 'boolean'],
        ]);

        $settings = WebsiteSetting::query()->firstOrCreate(
            ['id' => 1]
        );

        $settings->fill($data);
        $settings->save();

        return response()->json([
            'message' => 'Website settings saved.',
            'settings' => $settings->fresh(),
        ]);
    }
}