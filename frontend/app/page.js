"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BookCard from "./components/BookCard";

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
    <main className="container py-5">
      <h1>Booklist</h1>

      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">
          <form className="input-group" onSubmit={cerca}>
            <span className="input-group-text">
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
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>
            <input
              className="form-control"
              type="search"
              placeholder="Cerca un libro..."
              aria-label="Search"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              Cerca Libro
            </button>
          </form>

          {errore && <div className="alert alert-danger mt-4">{errore}</div>}
          {messaggio && (
            <div className="alert alert-success mt-4">{messaggio}</div>
          )}
        </div>
      </div>

      <div className="row g-4 mt-3">
        {libri.map((libro) => (
          <div
            key={libro.open_library_key}
            className="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <BookCard libro={libro} />
            <div className="mt-2">
              <button
                type="button"
                className="btn btn-primary me-2"
                disabled={loading}
                onClick={() => aggiungi(libro, "read")}
              >
                Letto
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={loading}
                onClick={() => aggiungi(libro, "to_read")}
              >
                Da Leggere
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}