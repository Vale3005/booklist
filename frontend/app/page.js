"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

const endPoint1 = "http://localhost:8000/api/books/search";

export default function Home() {
  const router = useRouter();
  const [errore, setErrore] = useState("");
  const [ricerca, setRicerca] = useState("");
  const [libri, setLibri] = useState([]);

  async function cerca(e) {
    e.preventDefault();

    if (ricerca.trim() === "") {
      setErrore("Scrivi un titolo da cercare"); //evita campo vuoto
      return;
    }
    setLoading(true);
    setErrore("");

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
            <button type="submit" className="btn btn-primary">
              Cerca Libro
            </button>
          </form>

          {errore && <div className="alert alert-danger mt-4">{errore}</div>}
        </div>
      </div>

      <div className="row g-4 mt-3">
        {libri.map((libro) => (
          <div
            key={libro.open_library_key}
            className="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <div className="card h-100">
              {libro.cover_url && (
                <img
                  src={libro.cover_url}
                  className="card-img-top"
                  alt={libro.title}
                  style={{ height: "300px", objectFit: "cover" }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{libro.title}</h5>
                <p className="card-text">{libro.author}</p>
                <a href="#" className="btn btn-primary me-2">
                  Letto
                </a>
                <a href="#" className="btn btn-primary">
                  Da Leggere
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
