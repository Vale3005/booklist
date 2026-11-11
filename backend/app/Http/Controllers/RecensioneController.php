<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class RecensioneController extends Controller
{
    public function genera(Request $request)
    {
        $dati = $request->validate([
            'titoli' => 'required|string|max:300',
            'generi' => 'required|string|max:200',
            'mood'   => 'required|string|max:100',
        ]);

        // subito dopo la validazione: se la richiesta esiste già, non richiamo Deepseek

        $roleSystem = "Sei un esperto internazionale di libri, parli in italiano. 
        Rispondi SOLO con un JSON valido, senza testo prima o dopo e senza backtick,
         con questa struttura esatta: 
         {\"recensione\": \"testo in 5-8 righe\", \"simili\": 
         [{\"titolo\": \"...\", \"autore\": \"...\", \"motivo\": 
         \"una frase\"}]}. L'array simili deve contenere esattamente 
         3 elementi.";

        $prompt = "Il lettore ha apprezzato questi libri: {$dati['titoli']}. "
            . "Generi preferiti: {$dati['generi']}. Umore: {$dati['mood']}. "
            . "Scrivi una recensione che commenti i titoli indicati e consiglia 3 libri simili, diversi da quelli indicati.";

        $response = Http::withToken(config('services.deepseek.key'))
            ->timeout(60)
            ->retry(3, 2000, throw: false)
            ->post(config('services.deepseek.url'), [
                'model' => config('services.deepseek.model'),
                'messages' => [
                    ['role' => 'system', 'content' => $roleSystem],
                    ['role' => 'user', 'content' => $prompt],
                ],
                'temperature' => 0.7,
                'max_tokens' => 2000,
                'response_format' => ['type' => 'json_object']
            ]);

        if ($response->failed()) {
            return response()->json(['message' => 'Servizio AI non disponibile, riprova tra poco.'], 502);
        }

        $risposta = json_decode($response->json('choices.0.message.content') ?? '', true);

        if (!is_array($risposta) || !isset($risposta['recensione'], $risposta['simili'])) {
            return response()->json(['message' => 'Risposta AI non valida, riprova.'], 502);
        }


        return response()->json($risposta);
    }
}
