<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request; //dati che arrivano dal frontend
use Illuminate\Support\Facades\Password; //servizio laravel che gestisce il reset
use Illuminate\Auth\Events\PasswordReset; //evento che segnala il cambio di password 

class PasswordResetController extends Controller
{
    public function sendLink(Request $request)
    {
        $request->validate([
            'email' => 'required|email', //controlla che email ci sia
        ]);

        Password::sendResetLink($request->only('email')); //cerca utente con quell'email manda la notifica link con quello costruito in boot 

        return response()->json([
            'message' => 'Se l\'email è registrata, riceverai a breve un link per reimpostare la password',
        ], 200);
    }

    public function reset(Request $request) //chiamata quando utente clicca il link 
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed', //confirmed è per confermare che i valori di password e password confirmation sono uguali 
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) { //si esegue solo se il token è valido
                $user->update(['password' => $password]);
                $user->tokens()->delete(); //cancella tutti i token su tutti i dispositivi 
                event(new PasswordReset($user)); //lancia evento passord reimpostata 
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Password reimpostata con successo',
            ], 200);
        }

        return response()->json([
            'message' => 'Il link non è valido o è scaduto',
            'errors' => [
                'email' => ['Il link non è valido o è scaduto'],
            ],
        ], 422);
    }
}