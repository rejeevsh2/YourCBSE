<?php

namespace App\Http\Controllers;

use App\Models\MediaAsset;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MediaAssetController extends Controller
{
    public function index()
    {
        return MediaAsset::with('uploader')
            ->orderByDesc('created_at')
            ->get();
    }

    public function show($id)
    {
        return MediaAsset::with('uploader')
            ->findOrFail($id);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'file' => [
                'required',
                'file',
                'max:512000',
                'mimes:jpg,jpeg,png,gif,webp,mp4,webm,mov,mp3,wav,ogg,m4a,pdf,zip,doc,docx,xls,xlsx,ppt,pptx,txt,csv',
            ],

            'name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'alt_text' => [
                'nullable',
                'string',
                'max:255',
            ],
        ]);

        $file = $request->file('file');

        $path = $file->store(
            'media',
            'public'
        );

        $asset = MediaAsset::create([
            'uploaded_by' =>
                $request->user()->id,

            'name' =>
                $validated['name']
                ?? pathinfo(
                    $file->getClientOriginalName(),
                    PATHINFO_FILENAME
                ),

            'original_name' =>
                $file->getClientOriginalName(),

            'file_name' =>
                basename($path),

            'kind' =>
                $this->determineKind($file),

            'mime_type' =>
                $file->getMimeType(),

            'extension' =>
                strtolower(
                    $file->getClientOriginalExtension()
                ),

            'disk' =>
                'public',

            'path' =>
                $path,

            'size_bytes' =>
                $file->getSize(),

            'alt_text' =>
                $validated['alt_text']
                ?? null,

            'usage_count' =>
                0,

            'is_active' =>
                true,

            'metadata' =>
                null,
        ]);

        return response()->json(
            $asset->load('uploader'),
            201
        );
    }

    public function update(
        Request $request,
        $id
    ) {
        $asset =
            MediaAsset::findOrFail($id);

        $validated =
            $request->validate([
                'name' => [
                    'required',
                    'string',
                    'max:255',
                ],

                'alt_text' => [
                    'nullable',
                    'string',
                    'max:255',
                ],

                'is_active' => [
                    'required',
                    'boolean',
                ],
            ]);

        $asset->update([
            'name' =>
                $validated['name'],

            'alt_text' =>
                $validated['alt_text']
                ?? null,

            'is_active' =>
                $validated['is_active'],
        ]);

        return response()->json(
            $asset
                ->fresh()
                ->load('uploader')
        );
    }

    public function replace(
        Request $request,
        $id
    ) {
        $asset =
            MediaAsset::findOrFail($id);

        $validated =
            $request->validate([
                'file' => [
                    'required',
                    'file',
                    'max:512000',
                    'mimes:jpg,jpeg,png,gif,webp,mp4,webm,mov,mp3,wav,ogg,m4a,pdf,zip,doc,docx,xls,xlsx,ppt,pptx,txt,csv',
                ],
            ]);

        $file =
            $request->file('file');

        $newPath =
            $file->store(
                'media',
                'public'
            );

        $oldDisk =
            $asset->disk;

        $oldPath =
            $asset->path;

        $asset->update([
            'original_name' =>
                $file->getClientOriginalName(),

            'file_name' =>
                basename($newPath),

            'kind' =>
                $this->determineKind($file),

            'mime_type' =>
                $file->getMimeType(),

            'extension' =>
                strtolower(
                    $file->getClientOriginalExtension()
                ),

            'disk' =>
                'public',

            'path' =>
                $newPath,

            'size_bytes' =>
                $file->getSize(),
        ]);

        if (
            $oldDisk === 'public' &&
            $oldPath &&
            Storage::disk('public')
                ->exists($oldPath)
        ) {
            Storage::disk('public')
                ->delete($oldPath);
        }

        return response()->json(
            $asset
                ->fresh()
                ->load('uploader')
        );
    }

    public function destroy($id)
    {
        $asset =
            MediaAsset::findOrFail($id);

        if (
            $asset->disk === 'public' &&
            $asset->path &&
            Storage::disk('public')
                ->exists($asset->path)
        ) {
            Storage::disk('public')
                ->delete($asset->path);
        }

        $asset->delete();

        return response()->json([
            'message' =>
                'Media asset deleted successfully.',
        ]);
    }

    private function determineKind(
        UploadedFile $file
    ): string {
        $mime =
            strtolower(
                $file->getMimeType()
                ?? ''
            );

        $extension =
            strtolower(
                $file->getClientOriginalExtension()
            );

        if (
            Str::startsWith(
                $mime,
                'image/'
            )
        ) {
            return 'Image';
        }

        if (
            Str::startsWith(
                $mime,
                'video/'
            )
        ) {
            return 'Video';
        }

        if (
            Str::startsWith(
                $mime,
                'audio/'
            )
        ) {
            return 'Audio';
        }

        if (
            $mime ===
                'application/pdf' ||
            $extension === 'pdf'
        ) {
            return 'PDF';
        }

        if (
            in_array(
                $extension,
                ['zip'],
                true
            )
        ) {
            return 'ZIP';
        }

        return 'Document';
    }
}