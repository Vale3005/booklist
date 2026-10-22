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
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'isbn' => 'required|string',
            'review' => 'nullable|string',
            'rating' => 'nullable|integer|min:0|max:5',
            'status' => 'nullable|in:to_read,reading,read',
        ]);

        $isbn = $validated['isbn'];

        $response = Http::get('https://openlibrary.org/api/books', [
            'bibkeys' => "ISBN:{$isbn}",
            'format' => 'json',
            'jscmd' => 'data',
        ]);

        if ($response->failed() || empty($response->json("ISBN:{$isbn}"))) {
            return response()->json(['error' => 'Book not found'], 404);
        }

        $data = $response->json("ISBN:{$isbn}");

        // Per cercare se libro è nel db 
        $book = Book::where('open_library_key', $data['key'])->first();

        // Se non c'è lo creo
        if (!$book) {
            $book = new Book();
            $book->open_library_key = $data['key'];
            $book->title = $data['title'];
            $book->author = $data['authors'][0]['name'] ?? null; # è un a lista 
            $book->genre = $data['subjects'][0]['name'] ?? null;
            $book->cover_url = $data['cover']['medium'] ?? null; #non è una lista ma un oggetto 

            if (isset($data['publish_date'])) {
                $book->publication_year = substr($data['publish_date'], -4); #prende gli ultimi 4 caratteri 
            }

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
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    public function lookup(Request $request)
    {
        $isbn = $request->query('isbn');

        $response = Http::get('https://openlibrary.org/api/books', [
            'bibkeys' => "ISBN:{$isbn}",
            'format' => 'json',
            'jscmd' => 'data',
        ]);


        if ($response->failed() || empty($response->json("ISBN:{$isbn}"))) {
            return response()->json(['error' => 'Book not found'], 404);
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
            return response()->json(['error' => 'Book Not Found'], 404);
        }

        $isbn = $book->isbn;

        $response = Http::get('https://openlibrary.org/api/books', [
            'bibkeys' => "ISBN:{$isbn}",
            'format' => 'json',
            'jscmd' => 'data',
        ]);


        if ($response->failed() || empty($response->json("ISBN:{$isbn}"))) {
            return response()->json(['error' => 'Book not found'], 404);
        }

        $data = $response->json("ISBN:{$isbn}");

        $book->update([
            'title' => $data['title'],
            'author' => $data['authors'][0]['name'] ?? null,
            'cover_url' => $data['cover']['medium'] ?? null,
        ]);

        return response()->json($book);
    }
}
