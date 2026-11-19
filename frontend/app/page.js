"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
      setLibri([]);
      setErrore("");
      setMessaggio("");
      sessionStorage.removeItem("ricerca");
      sessionStorage.removeItem("libri");
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

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (res.status === 404) {
        setErrore("Nessun Libro Trovato");
        setLibri([]);
        sessionStorage.removeItem("ricerca"); //così non si resetta la ricerca
        sessionStorage.removeItem("libri");
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setLibri(data);
      sessionStorage.setItem("ricerca", ricerca); //è come localStorage usato per il token, ma dura solo finché è aperta la scheda broswer, sopravvive ai campi pagina e ricaricamento, sparisce alla chiusura della scheda
      sessionStorage.setItem("libri", JSON.stringify(data)); //si salva data e non libri perché è il valore aggiornato
    } catch (err) {
      setErrore(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    const ricercaSalvata = sessionStorage.getItem("ricerca");
    const libriSalvati = sessionStorage.getItem("libri");

    if (libriSalvati) {
      setRicerca(ricercaSalvata || ""); // rimette nella barra il testo salvato
      setLibri(JSON.parse(libriSalvati)); // riporta il testo ad una lista, altrimenti .map darebbe errore
    }
  }, []);

   return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-8 text-center text-4xl font-bold text-primary">
        Booklist
      </h1>

      <div className="mx-auto w-full max-w-2xl">
        <form className="flex gap-2" onSubmit={cerca}>
          <div className="relative flex-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
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
              className="h-12 pl-11 text-base"
              type="search"
              placeholder="Cerca un libro..."
              aria-label="Search"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="h-12 px-6 text-base"
            disabled={loading}
          >
            Cerca libro
          </Button>
        </form>

        {loading && (
          <div className="mt-4 text-base text-muted-foreground">
            <strong>Caricamento Libri</strong>
          </div>
        )}

        {errore && (
          <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-base text-destructive">
            {errore}
          </div>
        )}
        {messaggio && (
          <div className="mt-4 rounded-lg border border-green-600/50 bg-green-600/10 p-3 text-base text-green-700">
            {messaggio}
          </div>
        )}
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {libri.map((libro) => (
          <div key={libro.open_library_key}>
            <BookCard libro={libro}>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="flex-1"
                    disabled={loading}
                    onClick={() => aggiungi(libro, "read")}
                  >
                    Letto
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    disabled={loading}
                    onClick={() => aggiungi(libro, "to_read")}
                  >
                    Da leggere
                  </Button>
                </div>
                <Button
                  size="sm"
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
