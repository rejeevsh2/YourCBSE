<?php

namespace App\Console\Commands;

use App\Models\InteractiveApp;
use App\Services\InteractiveAppAccess;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class SecureInteractiveApps extends Command
{
    protected $signature = 'interactive-apps:secure {--dry-run : Report files without moving them}';
    protected $description = 'Move legacy publicly linked HTML/ZIP apps into private storage and remove public copies';

    public function handle(InteractiveAppAccess $access): int
    {
        $public = Storage::disk('public');
        $private = Storage::disk('local');
        $files = $public->allFiles('interactive-apps');

        $this->info(count($files) . ' public interactive app files found.');

        if ($this->option('dry-run')) {
            $this->line('Dry run only. No files changed.');
            return self::SUCCESS;
        }

        try {
            foreach ($files as $file) {
                // Never treat a path outside the app directory as an app.
                if (! preg_match('~^interactive-apps/[^/]+/.+~', $file)) {
                    throw new \RuntimeException("Unrecognized app file: {$file}");
                }

                if ($private->exists($file)) {
                    if (! $this->sameFile($public, $private, $file)) {
                        throw new \RuntimeException("Private file conflicts with public file: {$file}");
                    }
                    continue;
                }

                $read = $public->readStream($file);
                if (! is_resource($read)) {
                    throw new \RuntimeException("Could not read {$file}");
                }

                try {
                    if (! $private->writeStream($file, $read)) {
                        throw new \RuntimeException("Could not write private file {$file}");
                    }
                } finally {
                    fclose($read);
                }

                if (! $this->sameFile($public, $private, $file)) {
                    throw new \RuntimeException("Copy verification failed: {$file}");
                }
            }

            // Every registered upload must have an existing, private entry
            // point before ANY public file is deleted.
            $apps = InteractiveApp::query()
                ->whereIn('source_type', ['html', 'zip'])
                ->get();

            foreach ($apps as $app) {
                $dir = $access->directory($app);
                $entry = $access->entryPath($app);
                if (! $dir || ! $entry || ! $private->exists($dir . '/' . $entry)) {
                    throw new \RuntimeException(
                        "Cannot verify protected entry for interactive app ID {$app->id}"
                    );
                }
            }

            // Final verification immediately before removing public copies.
            foreach ($files as $file) {
                if (! $this->sameFile($public, $private, $file)) {
                    throw new \RuntimeException("File changed during migration: {$file}");
                }
            }

            if ($public->directoryExists('interactive-apps') &&
                ! $public->deleteDirectory('interactive-apps')) {
                throw new \RuntimeException('Could not remove the public interactive-apps directory.');
            }

            $this->info(
                'Protected ' . count($apps) . ' interactive apps. ' .
                count($files) . ' public files verified, moved and removed from public access.'
            );
            return self::SUCCESS;
        } catch (\Throwable $e) {
            $this->error($e->getMessage());
            $this->warn('Public copies have NOT been removed. Fix and rerun before enabling app launch.');
            return self::FAILURE;
        }
    }

    private function sameFile($public, $private, string $path): bool
    {
        if (! $private->exists($path)) {
            return false;
        }

        return $public->size($path) === $private->size($path)
            && hash_file('sha256', $public->path($path)) ===
               hash_file('sha256', $private->path($path));
    }
}
