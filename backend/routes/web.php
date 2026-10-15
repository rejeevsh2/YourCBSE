<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});



// HTML/ZIP interactive apps are private: per-file access is checked on each
// request, including CSS/JS/assets. Public /storage copies are migrated away.
Route::get('/interactive-apps/{app}/open', [
    \App\Http\Controllers\InteractiveAppFileController::class, 'open',
])->whereNumber('app');

Route::get('/interactive-apps/{app}/files/{path}', [
    \App\Http\Controllers\InteractiveAppFileController::class, 'file',
])->whereNumber('app')->where('path', '.*');
