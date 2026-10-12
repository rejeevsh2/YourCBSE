<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BlogPostController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | ADMIN
    |--------------------------------------------------------------------------
    */

    public function index()
    {
        return BlogPost::with('author')
            ->orderByDesc('created_at')
            ->get();
    }

    public function show($id)
    {
        return BlogPost::with('author')
            ->findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:255',
                'unique:blog_posts,slug',
            ],

            'excerpt' => [
                'nullable',
                'string',
                'max:2000',
            ],

            'content' => [
                'required',
                'string',
            ],

            'category' => [
                'nullable',
                'string',
                'max:100',
            ],

            'featured_image' => [
                'nullable',
                'string',
                'max:2048',
            ],

            'status' => [
                'required',
                Rule::in([
                    'draft',
                    'in_review',
                    'published',
                    'archived',
                ]),
            ],

            'read_minutes' => [
                'nullable',
                'integer',
                'min:1',
                'max:999',
            ],

            'is_featured' => [
                'nullable',
                'boolean',
            ],

            'published_at' => [
                'nullable',
                'date',
            ],
        ]);

        $slug = $this->makeUniqueSlug(
            $validated['slug']
                ?? $validated['title']
        );

        $publishedAt =
            $validated['published_at']
                ?? null;

        if (
            $validated['status'] === 'published' &&
            !$publishedAt
        ) {
            $publishedAt = now();
        }

        $post = BlogPost::create([
            'author_id' => $request->user()->id,
            'title' => $validated['title'],
            'slug' => $slug,
            'excerpt' =>
                $validated['excerpt'] ?? null,
            'content' => $validated['content'],
            'category' =>
                $validated['category'] ?? null,
            'featured_image' =>
                $validated['featured_image'] ?? null,
            'status' => $validated['status'],
            'read_minutes' =>
                $validated['read_minutes'] ?? 5,
            'is_featured' =>
                $validated['is_featured'] ?? false,
            'published_at' => $publishedAt,
        ]);

        return response()->json(
            $post->load('author'),
            201
        );
    }

    public function update(Request $request, $id)
    {
        $post = BlogPost::findOrFail($id);

        $validated = $request->validate([
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique(
                    'blog_posts',
                    'slug'
                )->ignore($post->id),
            ],

            'excerpt' => [
                'nullable',
                'string',
                'max:2000',
            ],

            'content' => [
                'required',
                'string',
            ],

            'category' => [
                'nullable',
                'string',
                'max:100',
            ],

            'featured_image' => [
                'nullable',
                'string',
                'max:2048',
            ],

            'status' => [
                'required',
                Rule::in([
                    'draft',
                    'in_review',
                    'published',
                    'archived',
                ]),
            ],

            'read_minutes' => [
                'nullable',
                'integer',
                'min:1',
                'max:999',
            ],

            'is_featured' => [
                'nullable',
                'boolean',
            ],

            'published_at' => [
                'nullable',
                'date',
            ],
        ]);

        $requestedSlug =
            $validated['slug']
                ?? $validated['title'];

        $slug = $this->makeUniqueSlug(
            $requestedSlug,
            $post->id
        );

        $publishedAt =
            $validated['published_at']
                ?? $post->published_at;

        if (
            $validated['status'] === 'published' &&
            !$publishedAt
        ) {
            $publishedAt = now();
        }

        $post->update([
            'title' => $validated['title'],
            'slug' => $slug,
            'excerpt' =>
                $validated['excerpt'] ?? null,
            'content' => $validated['content'],
            'category' =>
                $validated['category'] ?? null,
            'featured_image' =>
                $validated['featured_image'] ?? null,
            'status' => $validated['status'],
            'read_minutes' =>
                $validated['read_minutes'] ?? 5,
            'is_featured' =>
                $validated['is_featured'] ?? false,
            'published_at' => $publishedAt,
        ]);

        return response()->json(
            $post->fresh()->load('author')
        );
    }

    public function destroy($id)
    {
        $post = BlogPost::findOrFail($id);

        $post->delete();

        return response()->json([
            'message' =>
                'Blog post deleted successfully.',
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | PUBLIC
    |--------------------------------------------------------------------------
    */

    public function publicIndex()
    {
        return BlogPost::published()
            ->with('author')
            ->orderByDesc('is_featured')
            ->orderByDesc('published_at')
            ->get();
    }

    public function publicShow($slug)
    {
        return BlogPost::published()
            ->with('author')
            ->where('slug', $slug)
            ->firstOrFail();
    }

    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    private function makeUniqueSlug(
        string $value,
        ?int $ignoreId = null
    ): string {
        $baseSlug = Str::slug($value);

        if ($baseSlug === '') {
            $baseSlug = 'post';
        }

        $slug = $baseSlug;
        $counter = 2;

        while (
            BlogPost::query()
                ->when(
                    $ignoreId,
                    fn ($query) =>
                        $query->where(
                            'id',
                            '!=',
                            $ignoreId
                        )
                )
                ->where('slug', $slug)
                ->exists()
        ) {
            $slug =
                $baseSlug . '-' . $counter;

            $counter++;
        }

        return $slug;
    }
}