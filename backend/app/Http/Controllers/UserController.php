<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function destroy(Request $request)
    {
        $validated = $request->validate(['password' => 'required|string']);
        $user = $request->user();

        if (!Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Credenziali non valide'
            ], 422);
        }

        $user->tokens()->delete();
        $user->delete();

        return response()->json(['message' => 'Utente eliminato con successo']);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255', 'not_regex:/@/', Rule::unique('users')->ignore($user->id)],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($validated['current_password'], /* check fa il controllo della password attuale*/ 
        $user->password)) {
            return response()->json([
                'message' => 'Credenziali non valide'
            ], 422);
        }

        $user->update(['password' => $validated['password']]);

        return response()->json(['message' => 'Password modificata con successo']);
    }
}