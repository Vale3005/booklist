<?php

use App\Http\Controllers\BookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/books/lookup', [BookController::class, 'lookup']);

    Route::get('books/search',[BookController::class, 'search']);

    Route::get('/books/details/{olid}', [BookController::class, 'details']);

    Route::apiResource('/books', BookController::class);

    Route::post('/books/{book}/refresh', [BookController::class, 'refresh']);
    
});

// Registration, login, logout route
Route::post('/register', [AuthController::class, 'register']); 
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum'); 



