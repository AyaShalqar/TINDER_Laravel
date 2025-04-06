<?php


use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InterestController;
use App\Http\Controllers\SwipeController;

// Публичные маршруты
Route::post('/register', [UserController::class, 'register']);
Route::post('/login', [UserController::class, 'login']);

// Получение всех пользователей
Route::get('/users', [UserController::class, 'getAllUsers']);

// Интересы (публичные для чтения)
Route::get('/interests', [InterestController::class, 'index']);
Route::get('/interests/{id}', [InterestController::class, 'show']);

// Защищенные маршруты (требуют аутентификации)
Route::middleware('auth:sanctum')->group(function () {
    // Профиль пользователя
    Route::get('/profile', [UserController::class, 'getProfile']);
    Route::put('/profile', [UserController::class, 'updateProfile']);
    
    // Био пользователя
    Route::post('/profile/bio', [UserController::class, 'updateBio']);
    
    // Геолокация пользователя
    Route::post('/profile/location', [UserController::class, 'updateLocation']);
    
    // Фотографии пользователя
    Route::post('/profile/images', [UserController::class, 'uploadImage']);
    Route::delete('/profile/images/{id}', [UserController::class, 'deleteImage']);
    
    // Интересы пользователя
    Route::post('/profile/interests', [UserController::class, 'addInterests']);
    Route::delete('/profile/interests', [UserController::class, 'removeInterests']);
    
    // Управление интересами (только для админов - можно добавить middleware)
    Route::post('/interests', [InterestController::class, 'store']);
    Route::put('/interests/{id}', [InterestController::class, 'update']);
    Route::delete('/interests/{id}', [InterestController::class, 'destroy']);


    Route::post('/swipes', [SwipeController::class, 'store']);

});
