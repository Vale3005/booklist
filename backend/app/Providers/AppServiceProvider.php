<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Auth\Notifications\ResetPassword;
use App\Models\User;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function ($user, string $token) { 
            $frontend = env('FRONTEND_URL', 'http://localhost:3000'); //legge indirizzo dove mandare la mail per reset password, se non esiste ripiega su localhost 

            return $frontend . '/reset-password?token=' . $token
                . '&email=' . urlencode($user->email); //costruisce l'URL finale concatenando le parti
        });
    }
}
