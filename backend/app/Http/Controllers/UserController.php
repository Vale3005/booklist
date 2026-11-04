<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function destroy(Request $request)
    {
        $validated = $request->validate(['password' => 'required|string']);
        $user = $request->user();
        if (!Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Credenziali non valide'
            ], 401);
        }
        $user->tokens()->delete();
        $user->delete();
        return response()->json(["Utente eliminato con successo"]); 
    }
}
