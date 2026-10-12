<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SeoPage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminSeoPageController extends Controller
{
    public function index(): JsonResponse
    {
        $pages = SeoPage::query()
            ->orderBy('path')
            ->get()
            ->map(fn (SeoPage $page) => $this->formatPage($page))
            ->values();

        return response()->json([
            'pages' => $pages,
            'stats' => [
                'total_pages' => $pages->count(),
                'indexed_pages' => $pages->where('is_indexed', true)->count(),
                'noindex_pages' => $pages->where('is_indexed', false)->count(),
                'average_score' => $pages->count()
                    ? (int) round($pages->avg('score'))
                    : 0,
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $page = SeoPage::query()->create($data);

        return response()->json([
            'message' => 'SEO page created.',
            'page' => $this->formatPage($page),
        ], 201);
    }

    public function update(
        Request $request,
        SeoPage $seoPage
    ): JsonResponse {
        $data = $this->validated(
            $request,
            $seoPage->id
        );

        $seoPage->fill($data);
        $seoPage->save();

        return response()->json([
            'message' => 'SEO settings saved.',
            'page' => $this->formatPage($seoPage->fresh()),
        ]);
    }

    public function destroy(
        SeoPage $seoPage
    ): JsonResponse {
        if ($seoPage->path === '/') {
            return response()->json([
                'message' => 'The home-page SEO record cannot be deleted.',
            ], 422);
        }

        $seoPage->delete();

        return response()->json([
            'message' => 'SEO page deleted.',
        ]);
    }

    private function validated(
        Request $request,
        ?int $ignoreId = null
    ): array {
        return $request->validate([
            'path' => [
                'required',
                'string',
                'max:255',
                'starts_with:/',
                Rule::unique('seo_pages', 'path')
                    ->ignore($ignoreId),
            ],
            'title' => [
                'required',
                'string',
                'max:255',
            ],
            'meta_description' => [
                'nullable',
                'string',
                'max:1000',
            ],
            'canonical_url' => [
                'nullable',
                'url',
                'max:500',
            ],
            'is_indexed' => [
                'required',
                'boolean',
            ],
        ]);
    }

    private function formatPage(
        SeoPage $page
    ): array {
        return [
            'id' => $page->id,
            'path' => $page->path,
            'title' => $page->title,
            'meta_description' => $page->meta_description,
            'canonical_url' => $page->canonical_url,
            'is_indexed' => $page->is_indexed,
            'score' => $this->score($page),
            'updated_at' => $page->updated_at?->toISOString(),
        ];
    }

    private function score(
        SeoPage $page
    ): int {
        $score = 0;

        if (str_starts_with($page->path, '/')) {
            $score += 10;
        }

        $titleLength = strlen(trim($page->title));

        if ($titleLength >= 30 && $titleLength <= 60) {
            $score += 30;
        } elseif ($titleLength > 0) {
            $score += 20;
        }

        $descriptionLength = strlen(
            trim((string) $page->meta_description)
        );

        if (
            $descriptionLength >= 120 &&
            $descriptionLength <= 160
        ) {
            $score += 40;
        } elseif ($descriptionLength > 0) {
            $score += 25;
        }

        if (!empty($page->canonical_url)) {
            $score += 20;
        }

        return min($score, 100);
    }
}