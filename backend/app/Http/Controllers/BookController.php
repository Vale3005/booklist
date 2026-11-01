<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Book;
use App\Models\Reading;
use Illuminate\Support\Facades\Http;
use App\Http\Controllers\Controller;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = $request->user()->readings()->with('book'); #user è utente loggato, readings limita la query alle sue letture e with carica le letture con i dati
        if ($request->query('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->has('rating')) {
            $query->where('rating', $request->query('rating'));
        }

        $readings = $query->get();

        return response()->json($readings);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'open_library_key' => ['required', 'string', 'regex:/^\/works\/OL\d+W$/'],
            'title' => 'required|string|max:255',
            'author' => 'nullable|string|max:255',
            'cover_url' => 'nullable|url',
            'review' => 'nullable|string',
            'rating' => 'nullable|integer|min:0|max:5',
            'status' => 'nullable|in:to_read,reading,read',
        ]);

        $key = $validated['open_library_key'];

        // Controllo che il libro esista davvero su Open Library
        $response = Http::get("https://openlibrary.org{$key}.json");

        if ($response->failed()) {
            return response()->json(['error' => 'Book not found'], 404);
        }

        // Cerco se il libro è già nel db
        $book = Book::where('open_library_key', $key)->first();

        // Se non c'è lo creo
        if (!$book) {
            $book = new Book();
            $book->open_library_key = $key;
            $book->title = $validated['title'];
            $book->author = $validated['author'] ?? 'Autore sconosciuto';
            $book->cover_url = $validated['cover_url'] ?? null;
            $book->save();
        }

        // Controllo che l'utente non lo abbia già nella lista
        $exists = Reading::where('user_id', $request->user()->id)
            ->where('book_id', $book->id)
            ->exists();

        if ($exists) {
            return response()->json(['error' => 'Il libro esiste già nella lista'], 409);
        }

        // Creo la lettura che collega utente e libro
        $reading = new Reading();
        $reading->user_id = $request->user()->id;
        $reading->book_id = $book->id;
        $reading->status = $validated['status'] ?? 'to_read';
        $reading->rating = $validated['rating'] ?? null;
        $reading->review = $validated['review'] ?? null;
        $reading->save();

        return response()->json($reading, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, string $id)
    {
        $reading = $request->user()->readings()->with('book')->find($id);
        if (!$reading) {
            return response()->json(['error' => 'Il libro non è presente'], 404);
        }
        return response()->json($reading);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'review' => 'sometimes|nullable|string',
            'rating' => 'sometimes|nullable|integer|min:1|max:5',
            'status' => 'sometimes|in:to_read,reading,read',
        ]);

        $reading = $request->user()->readings()->with('book')->find($id);
        if (!$reading) {
            return response()->json(['error' => 'Il libro non è presente'], 404);
        }

        $reading->update($validated);
        return response()->json($reading);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, string $id)
    {
        $reading = $request->user()->readings()->find($id);
        if (!$reading) {
            return response()->json(['error' => 'Il libro non è presente'], 404);
        }
        $reading->delete();
        return response()->json(null, 204);
    }

    public function lookup(Request $request)
    {
        $isbn = $request->query('isbn');

        if (!$isbn) {
            return response()->json(['error' => 'ISBN mancante'], 400);
        }

        $response = Http::get('https://openlibrary.org/api/books', [
            'bibkeys' => "ISBN:{$isbn}",
            'format' => 'json',
            'jscmd' => 'data',
        ]);

        if ($response->failed() || empty($response->json("ISBN:{$isbn}"))) {
            return response()->json(['error' => 'Il libro non è presente'], 404);
        }

        $data = $response->json("ISBN:{$isbn}");

        return response()->json([
            'isbn' => $isbn,
            'title' => $data['title'],
            'author' => $data['authors'][0]['name'] ?? null,
            'cover_url' => $data['cover']['medium'] ?? null,
        ]);
    }

    public function refresh(string $id)
    {
        $book = Book::find($id);
        if (!$book) {
            return response()->json(['error' => 'Il libro non è presente'], 404);
        }

        $olid = basename($book->open_library_key);

        $response = Http::get('https://openlibrary.org/api/books', [
            'bibkeys' => "OLID:{$olid}",
            'format' => 'json',
            'jscmd' => 'data',
        ]);

        if ($response->failed() || empty($response->json("OLID:{$olid}"))) {
            return response()->json(['error' => 'Il libro non è presente'], 404);
        }

        $data = $response->json("OLID:{$olid}");

        $book->update([
            'title' => $data['title'],
            'author' => $data['authors'][0]['name'] ?? null,
            'cover_url' => $data['cover']['medium'] ?? null,
        ]);

        return response()->json($book);
    }

    public function search(Request $request)
    {
        $q = $request->query('q');

        if (!$q) {
            return response()->json(['error' => 'Campo mancante'], 400);
        }

        $response = Http::get('https://openlibrary.org/search.json', [
            'q' => $q,
            'limit' => 10, //mostra 10 risultati 
            'fields' => 'key,title,author_name,cover_i',
        ]);

        if ($response->failed()) {
            return response()->json(['error' => 'Errore nella ricerca'], 500);
        }

        $docs = $response->json('docs');
        $books = [];

        foreach ($docs as $doc) {
            $author = 'Autore sconosciuto';
            if (isset($doc['author_name'][0])) {
                $author = $doc['author_name'][0];
            }

            $cover = null;
            if (isset($doc['cover_i'])) {
                $cover = "https://covers.openlibrary.org/b/id/{$doc['cover_i']}-M.jpg";
            }

            $books[] = [
                'open_library_key' => $doc['key'],
                'title' => $doc['title'],
                'author' => $author,
                'cover_url' => $cover,
            ];
        }

        if (empty($books)) {
            return response()->json(['error' => 'Il libro non è presente'], 404);
        }

        return response()->json($books);
    }

    public function details(string $olid)
    {
        $response = Http::get("https://openlibrary.org/works/{$olid}.json");

        if ($response->failed()) {
            return response()->json(['error' => 'Il libro non è presente'], 404);
        }

        $data = $response->json();

        // La trama può essere una stringa oppure un array con 'value'
        $description = $data['description'] ?? null;
        if (is_array($description)) {
            $description = $description['value'] ?? null;
        }

        // La copertina è un numero, l'URL si costruisce come in search
        $cover = null;
        if (isset($data['covers'][0]) && $data['covers'][0] > 0) {
            $cover = "https://covers.openlibrary.org/b/id/{$data['covers'][0]}-L.jpg";
        }

        // parte da autore sconosciuto e cambia solo se tutti i passaggi vanno a buon fine
        $author = 'Autore sconosciuto';
        if (isset($data['authors'][0]['author']['key'])) {
            $authorKey = $data['authors'][0]['author']['key'];
            $authorResponse = Http::get("https://openlibrary.org{$authorKey}.json");

            if ($authorResponse->successful()) {
                $authorData = $authorResponse->json();
                if (isset($authorData['name'])) {
                    $author = $authorData['name'];
                }
            }
        }

        return response()->json([
            'title' => $data['title'] ?? null,
            'author' => $author,
            'description' => $description,
            'year' => $data['first_publish_date'] ?? null,
            'cover_url' => $cover,
        ]);
    }
}
