<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/profile', [ProfileController::class, 'store']);    // Создать профиль
    Route::get('/profile/{id}', [ProfileController::class, 'show']); // Получить профиль
    Route::put('/profile/{id}', [ProfileController::class, 'update']); // Обновить профиль
    Route::delete('/profile/{id}', [ProfileController::class, 'destroy']); // Удалить профиль
});
