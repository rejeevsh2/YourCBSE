<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');


Artisan::command('yourteacher:admin {email}', function () {
    $email = $this->argument('email');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { $this->error('Enter a valid email.'); return 1; }
    if (\App\Models\User::where('email', $email)->exists()) { $this->error('That account already exists. No changes made.'); return 1; }
    $name = $this->ask('Administrator name');
    $password = $this->secret('Password (at least 12 characters)');
    if (!$name || strlen($password ?? '') < 12) { $this->error('Name and a 12-character password are required.'); return 1; }
    \App\Models\User::create(['name'=>$name,'email'=>$email,'password'=>$password,'role'=>'admin']);
    $this->info('Administrator created. You can now sign in.');
})->purpose('Create a new administrator without a shared default password');
