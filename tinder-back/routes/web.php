<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use Illuminate\Http\Request;

Route::get('/', function () {
    return view('welcome');
});


Route::get('/register', function () {
    return view('auth.register');
});

Route::get('/login', function () {
    return view('auth.login');
});

Route::post('/logout', function (Request $request) {
    Auth::guard('web')->logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();
    return redirect('/');
})->middleware('auth');


Route::middleware(['auth'])->group(function () {

    Route::get('/profile', function () {
        return view('profile.show');
    });

    Route::get('/profile/edit', function () {
        return view('profile.edit');
    });

    Route::get('/recommendations', function () {
        return view('recommendations.index');
    });

    Route::get('/settings', function () {
        return view('settings');
    });
});

Route::fallback(function () {
    return view('errors.404');
});