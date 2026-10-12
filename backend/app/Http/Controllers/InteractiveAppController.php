<?php

namespace App\Http\Controllers;

use App\Models\InteractiveApp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use ZipArchive;

class InteractiveAppController extends Controller
{
    /**
     * Display all interactive apps.
     */
    public function index()
    {
        return InteractiveApp::with([
            'lesson.chapter.unit.subject.grade'
        ])
            ->orderBy('display_order')
            ->orderBy('id')
            ->get();
    }

    /**
     * Display one interactive app.
     */
    public function show($id)
    {
        return InteractiveApp::with([
            'lesson.chapter.unit.subject.grade'
        ])->findOrFail($id);
    }

    /**
     * Create a new interactive app.
     */
    public function store(Request $request)
    {
        $validated = $this->validateRequest($request);

        /*
         * Validate source requirements.
         */
        if (
            in_array($validated['source_type'], ['html', 'zip'], true) &&
            !$request->hasFile('file')
        ) {
            return response()->json([
                'message' => 'Please upload an HTML or ZIP file.',
                'errors' => [
                    'file' => [
                        'A file is required for HTML and ZIP interactive apps.'
                    ]
                ]
            ], 422);
        }

        if (
            $validated['source_type'] === 'external' &&
            empty($validated['external_url'])
        ) {
            return response()->json([
                'message' => 'Please enter an external URL.',
                'errors' => [
                    'external_url' => [
                        'An external URL is required for an external interactive app.'
                    ]
                ]
            ], 422);
        }

        $filePath = null;
        $entryUrl = null;

        /*
         * External app.
         */
        if ($validated['source_type'] === 'external') {
            $entryUrl = $validated['external_url'];
        }

        /*
         * Single HTML app.
         */
        if ($validated['source_type'] === 'html') {
            $result = $this->storeHtmlApp(
                $request->file('file')
            );

            $filePath = $result['file_path'];
            $entryUrl = $result['entry_url'];
        }

        /*
         * ZIP app.
         */
        if ($validated['source_type'] === 'zip') {
            try {
                $result = $this->storeZipApp(
                    $request->file('file')
                );

                $filePath = $result['file_path'];
                $entryUrl = $result['entry_url'];
            } catch (\Throwable $e) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'errors' => [
                        'file' => [
                            $e->getMessage()
                        ]
                    ]
                ], 422);
            }
        }

        $interactiveApp = InteractiveApp::create([
            'lesson_id' => $validated['lesson_id'],

            'title' => $validated['title'],

            'description' =>
                $validated['description'] ?? null,

            'source_type' =>
                $validated['source_type'],

            'file_path' =>
                $filePath,

            'external_url' =>
                $validated['source_type'] === 'external'
                    ? $validated['external_url']
                    : null,

            'entry_url' =>
                $entryUrl,

            'version' =>
                $validated['version'] ?? '1.0',

            'display_order' =>
                $validated['display_order'] ?? 1,

            'is_published' =>
                $validated['is_published'] ?? false,

            'is_active' =>
                $validated['is_active'] ?? true,
        ]);

        return response()->json(
            $interactiveApp->load(
                'lesson.chapter.unit.subject.grade'
            ),
            201
        );
    }

    /**
     * Update an existing interactive app.
     */
    public function update(Request $request, $id)
    {
        $interactiveApp =
            InteractiveApp::findOrFail($id);

        $validated =
            $this->validateRequest($request);

        if (
            $validated['source_type'] === 'external' &&
            empty($validated['external_url'])
        ) {
            return response()->json([
                'message' => 'Please enter an external URL.',
                'errors' => [
                    'external_url' => [
                        'An external URL is required for an external interactive app.'
                    ]
                ]
            ], 422);
        }

        /*
         * If changing between uploaded app types
         * without providing a replacement file,
         * require a new upload.
         */
        if (
            in_array(
                $validated['source_type'],
                ['html', 'zip'],
                true
            ) &&
            $interactiveApp->source_type === 'external' &&
            !$request->hasFile('file')
        ) {
            return response()->json([
                'message' => 'Please upload an app file.',
                'errors' => [
                    'file' => [
                        'A file is required when changing from an external app.'
                    ]
                ]
            ], 422);
        }

        $filePath =
            $interactiveApp->file_path;

        $entryUrl =
            $interactiveApp->entry_url;

        /*
         * Changing to external.
         */
        if ($validated['source_type'] === 'external') {

            $this->deleteStoredApp(
                $interactiveApp
            );

            $filePath = null;

            $entryUrl =
                $validated['external_url'];
        }

        /*
         * New HTML upload.
         */
        if (
            $validated['source_type'] === 'html' &&
            $request->hasFile('file')
        ) {
            $this->deleteStoredApp(
                $interactiveApp
            );

            $result = $this->storeHtmlApp(
                $request->file('file')
            );

            $filePath =
                $result['file_path'];

            $entryUrl =
                $result['entry_url'];
        }

        /*
         * New ZIP upload.
         */
        if (
            $validated['source_type'] === 'zip' &&
            $request->hasFile('file')
        ) {
            try {
                /*
                 * Process the new ZIP first.
                 * Only delete the old app after
                 * the replacement is valid.
                 */
                $result = $this->storeZipApp(
                    $request->file('file')
                );

                $this->deleteStoredApp(
                    $interactiveApp
                );

                $filePath =
                    $result['file_path'];

                $entryUrl =
                    $result['entry_url'];

            } catch (\Throwable $e) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'errors' => [
                        'file' => [
                            $e->getMessage()
                        ]
                    ]
                ], 422);
            }
        }

        $interactiveApp->update([
            'lesson_id' =>
                $validated['lesson_id'],

            'title' =>
                $validated['title'],

            'description' =>
                $validated['description'] ?? null,

            'source_type' =>
                $validated['source_type'],

            'file_path' =>
                $filePath,

            'external_url' =>
                $validated['source_type'] === 'external'
                    ? $validated['external_url']
                    : null,

            'entry_url' =>
                $entryUrl,

            'version' =>
                $validated['version'] ?? '1.0',

            'display_order' =>
                $validated['display_order'] ?? 1,

            'is_published' =>
                $validated['is_published'] ?? false,

            'is_active' =>
                $validated['is_active'] ?? true,
        ]);

        return response()->json(
            $interactiveApp
                ->fresh()
                ->load(
                    'lesson.chapter.unit.subject.grade'
                )
        );
    }

    /**
     * Delete an interactive app.
     */
    public function destroy($id)
    {
        $interactiveApp =
            InteractiveApp::findOrFail($id);

        $this->deleteStoredApp(
            $interactiveApp
        );

        $interactiveApp->delete();

        return response()->json([
            'message' =>
                'Interactive app deleted successfully.'
        ]);
    }

    /**
     * Shared validation.
     */
    protected function validateRequest(
        Request $request
    ): array {
        return $request->validate([
            'lesson_id' =>
                'required|exists:lessons,id',

            'title' =>
                'required|string|max:255',

            'description' =>
                'nullable|string',

            'source_type' => [
                'required',
                Rule::in([
                    'html',
                    'zip',
                    'external',
                ]),
            ],

            'file' => [
                'nullable',
                'file',
                'mimes:html,htm,zip',
                'max:102400',
            ],

            'external_url' =>
                'nullable|url|max:2048',

            'version' =>
                'nullable|string|max:50',

            'display_order' =>
                'nullable|integer|min:1|max:65535',

            'is_published' =>
                'nullable|boolean',

            'is_active' =>
                'nullable|boolean',
        ]);
    }

    /**
     * Store a single HTML interactive app.
     */
    protected function storeHtmlApp(
        $uploadedFile
    ): array {
        $appId = (string) Str::uuid();

        $directory =
            'interactive-apps/' . $appId;

        $filePath =
            $directory . '/index.html';

        Storage::disk('public')->put(
            $filePath,
            file_get_contents(
                $uploadedFile->getRealPath()
            )
        );

        return [
            'file_path' => $directory,

            'entry_url' =>
                asset('storage/' . $filePath),
        ];
    }

    /**
     * Store and safely extract a ZIP app.
     */
    protected function storeZipApp(
        $uploadedFile
    ): array {
        $zip = new ZipArchive();

        $result = $zip->open(
            $uploadedFile->getRealPath()
        );

        if ($result !== true) {
            throw new \RuntimeException(
                'The ZIP file could not be opened.'
            );
        }

        /*
         * Basic protection against excessively
         * large / dangerous ZIP packages.
         */
        $maxFiles = 2000;

        $maxUncompressedSize =
            250 * 1024 * 1024;

        if ($zip->numFiles > $maxFiles) {
            $zip->close();

            throw new \RuntimeException(
                'The ZIP contains too many files.'
            );
        }

        $totalSize = 0;

        $entries = [];

        for ($i = 0; $i < $zip->numFiles; $i++) {

            $stat =
                $zip->statIndex($i);

            if (!$stat) {
                continue;
            }

            $name =
                str_replace(
                    '\\',
                    '/',
                    $stat['name']
                );

            /*
             * Reject absolute paths.
             */
            if (
                str_starts_with($name, '/') ||
                preg_match(
                    '/^[A-Za-z]:\//',
                    $name
                )
            ) {
                $zip->close();

                throw new \RuntimeException(
                    'The ZIP contains an invalid file path.'
                );
            }

            /*
             * Prevent ZIP Slip / directory traversal.
             */
            $segments =
                explode('/', $name);

            if (in_array('..', $segments, true)) {
                $zip->close();

                throw new \RuntimeException(
                    'The ZIP contains an unsafe file path.'
                );
            }

            /*
             * Ignore macOS metadata.
             */
            if (
                str_starts_with(
                    $name,
                    '__MACOSX/'
                ) ||
                basename($name) === '.DS_Store'
            ) {
                continue;
            }

            /*
             * Block executable/server-side files.
             */
            $extension =
                strtolower(
                    pathinfo(
                        $name,
                        PATHINFO_EXTENSION
                    )
                );

            $blockedExtensions = [
                'php',
                'php3',
                'php4',
                'php5',
                'phtml',
                'phar',
                'cgi',
                'pl',
                'py',
                'rb',
                'sh',
                'bat',
                'cmd',
                'exe',
                'com',
                'msi',
                'dll',
                'jar',
                'asp',
                'aspx',
                'jsp',
            ];

            if (
                $extension &&
                in_array(
                    $extension,
                    $blockedExtensions,
                    true
                )
            ) {
                $zip->close();

                throw new \RuntimeException(
                    'The ZIP contains a prohibited file type: .' .
                    $extension
                );
            }

            $totalSize +=
                (int) ($stat['size'] ?? 0);

            if (
                $totalSize >
                $maxUncompressedSize
            ) {
                $zip->close();

                throw new \RuntimeException(
                    'The extracted app is too large.'
                );
            }

            $entries[] = [
                'index' => $i,
                'name' => $name,
            ];
        }

        /*
         * Locate index.html.
         *
         * Root index.html is preferred.
         * Otherwise allow one inside a folder.
         */
        $indexPath = null;

        foreach ($entries as $entry) {
            if (
                strtolower($entry['name']) ===
                'index.html'
            ) {
                $indexPath = 'index.html';
                break;
            }
        }

        if (!$indexPath) {
            foreach ($entries as $entry) {
                if (
                    strtolower(
                        basename($entry['name'])
                    ) === 'index.html'
                ) {
                    $indexPath =
                        $entry['name'];

                    break;
                }
            }
        }

        if (!$indexPath) {
            $zip->close();

            throw new \RuntimeException(
                'The ZIP must contain an index.html file.'
            );
        }

        $appId =
            (string) Str::uuid();

        $relativeDirectory =
            'interactive-apps/' . $appId;

        $destination =
            Storage::disk('public')
                ->path($relativeDirectory);

        File::ensureDirectoryExists(
            $destination
        );

        try {

            /*
             * Extract each validated entry manually.
             */
            foreach ($entries as $entry) {

                $name = $entry['name'];

                if (
                    str_ends_with(
                        $name,
                        '/'
                    )
                ) {
                    File::ensureDirectoryExists(
                        $destination .
                        DIRECTORY_SEPARATOR .
                        str_replace(
                            '/',
                            DIRECTORY_SEPARATOR,
                            rtrim($name, '/')
                        )
                    );

                    continue;
                }

                $target =
                    $destination .
                    DIRECTORY_SEPARATOR .
                    str_replace(
                        '/',
                        DIRECTORY_SEPARATOR,
                        $name
                    );

                File::ensureDirectoryExists(
                    dirname($target)
                );

                $stream =
                    $zip->getStream(
                        $zip->getNameIndex(
                            $entry['index']
                        )
                    );

                if ($stream === false) {
                    throw new \RuntimeException(
                        'Could not extract a file from the ZIP.'
                    );
                }

                $output =
                    fopen($target, 'wb');

                if ($output === false) {
                    fclose($stream);

                    throw new \RuntimeException(
                        'Could not create an extracted app file.'
                    );
                }

                stream_copy_to_stream(
                    $stream,
                    $output
                );

                fclose($stream);
                fclose($output);
            }

            $zip->close();

        } catch (\Throwable $e) {

            $zip->close();

            if (File::exists($destination)) {
                File::deleteDirectory(
                    $destination
                );
            }

            throw $e;
        }

        /*
         * Convert index.html path to public URL.
         */
        $publicIndexPath =
            $relativeDirectory .
            '/' .
            ltrim($indexPath, '/');

        return [
            'file_path' =>
                $relativeDirectory,

            'entry_url' =>
                asset(
                    'storage/' .
                    $publicIndexPath
                ),
        ];
    }

    /**
     * Delete files belonging to an uploaded app.
     */
    protected function deleteStoredApp(
        InteractiveApp $interactiveApp
    ): void {
        if (
            !in_array(
                $interactiveApp->source_type,
                ['html', 'zip'],
                true
            )
        ) {
            return;
        }

        if (!$interactiveApp->file_path) {
            return;
        }

        if (
            Storage::disk('public')
                ->exists(
                    $interactiveApp->file_path
                )
        ) {
            Storage::disk('public')
                ->deleteDirectory(
                    $interactiveApp->file_path
                );
        }
    }
}
