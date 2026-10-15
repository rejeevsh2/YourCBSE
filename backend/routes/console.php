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
