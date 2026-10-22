<?php

use App\Http\Controllers\BookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/books/lookup', [BookController::class, 'lookup']);
    Route::apiResource('/books', BookController::class);
    Route::post('/books/{book}/refresh', [BookController::class, 'refresh']);
});