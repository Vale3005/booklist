"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BookCard from "./components/BookCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const endPoint1 = "http://localhost:8000/api/books/search";
const endPoint2 = "http://localhost:8000/api/books";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");
  const [ricerca, setRicerca] = useState("");
  const [libri, setLibri] = useState([]);

  async function aggiungi(libro, status) {
    setLoading(true);
    setErrore("");
    setMessaggio("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(endPoint2, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          open_library_key: libro.open_library_key,
          title: libro.title,
          author: libro.author,
          cover_url: libro.cover_url,
          status: status,
        }),
      });

      // Token scaduto o non valido torna al login
      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (res.status === 404) {
        setErrore("Libro non trovato su Open Library");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      if (res.status === 409) {
        setErrore("Libro già presente nella tua lista");
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // Altri errori (server, rete etc)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      setMessaggio("Libro aggiunto alla tua lista");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setErrore(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }

  async function cerca(e) {
    e.preventDefault();

    if (ricerca.trim() === "") {
      setErrore("Scrivi un titolo da cercare"); //evita campo vuoto
      return;
    }
    setLoading(true);
    setErrore("");
    setMessaggio("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(endPoint1 + "?q=" + encodeURIComponent(ricerca), {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Token scaduto o non valido torna al login
      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (res.status === 404) {
        setErrore("Nessun Libro Trovato");
        setLibri([]);
        return;
      }

      // Altri errori (server, rete etc)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setLibri(data);
    } catch (err) {
      setErrore(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token"); //legge il valore di setItem nel login con il get
    if (!token) {
      //se utente non è loggato
      router.push("/login");
    }
  }, [router]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-center text-3xl font-bold text-primary">
        Booklist
      </h1>

      <div className="mx-auto w-full max-w-xl">
        <form className="flex gap-2" onSubmit={cerca}>
          <div className="relative flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <Input
              className="pl-10"
              type="search"
              placeholder="Cerca un libro..."
              aria-label="Search"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={loading}>
            Cerca Libro
          </Button>
        </form>

        {loading && (
          <div className="mt-4 text-muted-foreground">
            <strong>Caricamento Libri</strong>
          </div>
        )}

        {errore && (
          <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {errore}
          </div>
        )}
        {messaggio && (
          <div className="mt-4 rounded-lg border border-green-600/50 bg-green-600/10 p-3 text-sm text-green-700">
            {messaggio}
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {libri.map((libro) => (
          <div key={libro.open_library_key}>
            {/* chiamo il components perché lo riutilizzo in profilo e fa meno codice qua */}
            <BookCard libro={libro}>
              <div className="flex gap-2">
                <Button
                  type="button"
                  disabled={loading}
                  onClick={() => aggiungi(libro, "read")}
                >
                  Letto
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  onClick={() => aggiungi(libro, "to_read")}
                >
                  Da Leggere
                </Button>
                <Button
                  variant="outline"
                  render={
                    <Link
                      href={"/libri/" + libro.open_library_key.split("/").pop()}
                    />
                  }
                  nativeButton={false}
                >
                  Informazioni
                </Button>
              </div>
            </BookCard>
          </div>
        ))}
      </div>
    </main>
  );
}
