<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


Artisan::command('yourschool:admin {email}', function () {
    $email = $this->argument('email');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { $this->error('Enter a valid email.'); return 1; }
    if (\App\Models\User::where('email', $email)->exists()) { $this->error('That account already exists. No changes made.'); return 1; }
    $name = $this->ask('Administrator name');
    $password = $this->secret('Password (at least 12 characters)');
    if (!$name || strlen($password ?? '') < 12) { $this->error('Name and a 12-character password are required.'); return 1; }
    \App\Models\User::create(['name'=>$name,'email'=>$email,'password'=>$password,'role'=>'admin']);
    $this->info('Administrator created. You can now sign in.');
})->purpose('Create a new administrator without a shared default password');

Artisan::command('yourschool:audit-class-assignments', function () {
    $query = \Illuminate\Support\Facades\DB::table('users')
        ->whereIn('users.role', ['student', 'teacher'])
        ->where('users.approval_status', 'approved')
        ->whereNotExists(function ($query) {
            $query->selectRaw('1')
                ->from('grade_user')
                ->whereColumn('grade_user.user_id', 'users.id');
        });

    $legacyCount = (clone $query)
        ->where('users.legacy_class_access', true)
        ->count();

    // An approved user without classes must have explicit
    // temporary legacy protection, otherwise rollout fails.
    $query->where('users.legacy_class_access', false);
    $count = (clone $query)->count();

    if ($legacyCount > 0) {
        $this->warn(
            "LEGACY: {$legacyCount} approved account(s) use temporary curriculum access."
        );

        $this->warn(
            'Assign verified classes to remove unrestricted legacy access.'
        );
    }

    if ($count === 0) {
        $this->info(
            'PASS: All approved students and teachers have class assignments or temporary legacy access.'
        );

        return 0;
    }

    $this->error(
        "FAIL: {$count} approved account(s) have no class assignment."
    );

    $rows = (clone $query)
        ->orderBy('users.id')
        ->limit(20)
        ->get(['users.id', 'users.role'])
        ->map(fn ($user) => [
            $user->id,
            $user->role,
        ])
        ->all();

    $this->table(['User ID', 'Role'], $rows);

    $this->warn(
        'Assign the correct classes using Admin > Students or Teachers > Classes.'
    );

    $this->warn(
        'Resolve all missing assignments before enabling class-restricted access.'
    );

    return 1;
})->purpose(
    'Audit approved student and teacher accounts for missing class assignments'
);


// Read-only by default. Use --write to verify private upload, download and cleanup.
// No credentials or sensitive exception messages are printed to the terminal.
Artisan::command('yourschool:r2-check {--write : Test uploading and deleting a small private object}', function () {
    $settings = config('filesystems.disks.r2', []);

    foreach (['key', 'secret', 'endpoint', 'bucket'] as $field) {
        if (! is_string($settings[$field] ?? null) || trim($settings[$field]) === '') {
            $this->error("R2 is not configured: missing {$field}. No remote request made.");

            return 1;
        }
    }

    try {
        $disk = \Illuminate\Support\Facades\Storage::disk('r2');

        if (! $this->option('write')) {
            $disk->files('health-check/');

            $this->info('R2 list request succeeded. Use --write for an upload/read/delete test.');

            return 0;
        }

        $path = 'health-check/'.\Illuminate\Support\Str::uuid().'.txt';
        $payload = bin2hex(random_bytes(16));

        try {
            if (! $disk->put($path, $payload) || $disk->get($path) !== $payload) {
                $this->error('R2 write/read verification failed.');

                return 1;
            }

            $this->info('R2 private upload and download succeeded.');

            return 0;
        } finally {
            $disk->delete($path);
        }
    } catch (\Throwable $exception) {
        // Never print exception messages; SDK errors can contain endpoint details.
        $this->error('R2 check failed. Verify endpoint, bucket, credentials, permissions and connectivity.');

        return 1;
    }
})->purpose('Verify the private Cloudflare R2 connection without revealing credentials');
