<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Throwable;

class AdminSystemLogController extends Controller
{
    private const MAX_READ_BYTES = 2097152; // 2 MB
    private const MAX_ENTRIES = 500;

    public function index(): JsonResponse
    {
        $path = storage_path('logs/laravel.log');

        if (! is_file($path)) {
            return response()->json([
                'entries' => [],
                'meta' => [
                    'file' => 'laravel.log',
                    'exists' => false,
                    'file_size_bytes' => 0,
                    'read_bytes' => 0,
                    'truncated' => false,
                    'returned_entries' => 0,
                    'max_entries' => self::MAX_ENTRIES,
                    'last_modified' => null,
                ],
            ]);
        }

        try {
            clearstatcache(true, $path);

            $fileSize = filesize($path) ?: 0;
            $lastModified = filemtime($path);

            $tail = $this->readTail(
                $path,
                self::MAX_READ_BYTES
            );

            $parsedEntries = $this->parseEntries(
                $tail['content']
            );

            $entries = array_slice(
                $parsedEntries,
                0,
                self::MAX_ENTRIES
            );

            return response()->json([
                'entries' => $entries,
                'meta' => [
                    'file' => 'laravel.log',
                    'exists' => true,
                    'file_size_bytes' => $fileSize,
                    'read_bytes' => strlen($tail['content']),
                    'truncated' => $tail['truncated'],
                    'returned_entries' => count($entries),
                    'max_entries' => self::MAX_ENTRIES,
                    'last_modified' => $lastModified
                        ? Carbon::createFromTimestamp(
                            $lastModified,
                            config('app.timezone')
                        )->toIso8601String()
                        : null,
                ],
            ]);
        } catch (Throwable $exception) {
            return response()->json([
                'message' => 'Unable to read the application log.',
            ], 500);
        }
    }

    private function readTail(
        string $path,
        int $maxBytes
    ): array {
        $fileSize = filesize($path) ?: 0;

        if ($fileSize === 0) {
            return [
                'content' => '',
                'truncated' => false,
            ];
        }

        $start = max(
            0,
            $fileSize - $maxBytes
        );

        $handle = fopen($path, 'rb');

        if ($handle === false) {
            throw new \RuntimeException(
                'Unable to open log file.'
            );
        }

        try {
            if ($start > 0) {
                fseek($handle, $start);
            }

            $content = stream_get_contents($handle);

            if ($content === false) {
                $content = '';
            }
        } finally {
            fclose($handle);
        }

        /*
         * When reading only the tail of a large log file,
         * the first bytes may begin in the middle of an entry.
         * Drop that partial first line.
         */
        if ($start > 0 && $content !== '') {
            $firstNewline = strpos($content, "\n");

            if ($firstNewline !== false) {
                $content = substr(
                    $content,
                    $firstNewline + 1
                );
            }
        }

        return [
            'content' => $content,
            'truncated' => $start > 0,
        ];
    }

    private function parseEntries(
        string $content
    ): array {
        if (trim($content) === '') {
            return [];
        }

        $lines = preg_split(
            '/\R/',
            $content
        ) ?: [];

        $entries = [];
        $current = null;
        $sequence = 0;

        foreach ($lines as $line) {
            if (
                preg_match(
                    '/^\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\]\s+([^.]+)\.([A-Z]+):\s?(.*)$/',
                    $line,
                    $matches
                )
            ) {
                if ($current !== null) {
                    $entries[] = $this->finishEntry(
                        $current
                    );
                }

                $sequence++;

                $timestamp = Carbon::createFromFormat(
                    'Y-m-d H:i:s',
                    $matches[1],
                    config('app.timezone')
                );

                $current = [
                    'id' => sha1(
                        $matches[1]
                        .'|'.$matches[2]
                        .'|'.$matches[3]
                        .'|'.$sequence
                    ),
                    'timestamp' => $timestamp
                        ->toIso8601String(),
                    'level' => strtoupper(
                        $matches[3]
                    ),
                    'source' => $matches[2],
                    'message' => $this
                        ->redactSensitiveText(
                            $matches[4]
                        ),
                ];

                continue;
            }

            if (
                $current !== null &&
                trim($line) !== ''
            ) {
                $current['message'] .=
                    "\n".
                    $this->redactSensitiveText(
                        $line
                    );
            }
        }

        if ($current !== null) {
            $entries[] = $this->finishEntry(
                $current
            );
        }

        /*
         * Laravel writes oldest first.
         * Admin UI should display newest first.
         */
        return array_reverse($entries);
    }

    private function finishEntry(
        array $entry
    ): array {
        $entry['message'] = trim(
            $entry['message']
        );

        return $entry;
    }

    private function redactSensitiveText(
        string $text
    ): string {
        $text = preg_replace(
            '~(authorization\s*[:=]\s*bearer\s+)[^\s,}"]+~i',
            '$1[REDACTED]',
            $text
        ) ?? $text;

        $text = preg_replace(
            '~("(?:password|password_confirmation|access_token|refresh_token|api[_-]?key|secret|token)"\s*:\s*)"[^"]*"~i',
            '$1"[REDACTED]"',
            $text
        ) ?? $text;

        $text = preg_replace(
            '~((?:password|password_confirmation|access_token|refresh_token|api[_-]?key|secret|token)\s*=)[^&\s]+~i',
            '$1[REDACTED]',
            $text
        ) ?? $text;

        return $text;
    }
}