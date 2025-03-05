<?php


use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InterestController;

Route::apiResource('users', UserController::class);
Route::apiResource('interests', InterestController::class);
