<?php

use App\Http\Controllers\BookController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\RecensioneController; 


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/books/lookup', [BookController::class, 'lookup']);

    Route::get('books/search',[BookController::class, 'search']);

    Route::get('/books/details/{olid}', [BookController::class, 'details']);

    Route::apiResource('/books', BookController::class);

    Route::post('/books/{book}/refresh', [BookController::class, 'refresh']);

    Route::post('/recensione', [RecensioneController::class, 'genera']);
    
});

// Registrazione, login, logout route
Route::post('/register', [AuthController::class, 'register']); 
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum'); 

//Impostazioni route 


Route::put('/account', [UserController::class, 'update'])->middleware('auth:sanctum'); 
Route::put('/account/password', [UserController::class, 'updatePassword'])->middleware('auth:sanctum'); 
Route::delete('/account', [UserController::class, 'destroy'])->middleware('auth:sanctum'); 

Route::post('/forgot-password', [PasswordResetController::class, 'sendLink']);
Route::post('/reset-password', [PasswordResetController::class, 'reset']);