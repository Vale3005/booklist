"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const endPoint = "http://localhost:8000/api/recensione";

export default function Recensione() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [errori, setErrori] = useState({});
  const [risultato, setRisultato] = useState(null);
  const [titoli, setTitoli] = useState("");
  const [generi, setGeneri] = useState("");
  const [mood, setMood] = useState("");

  async function carica(e) {
    e.preventDefault();
    setLoading(true);
    setErrore("");
    setErrori({});

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        router.push("/login");
        return;
      } //in caso non ci sia il token

      const res = await fetch(endPoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ titoli, generi, mood }),
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        setLoading(false);
        router.push("/login");
        return;
      }

      const data = await res.json();

      if (res.status === 422) {
        setErrori(data.errors);
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      setRisultato(data);
    } catch (err) {
      setErrore(err.message || "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-primary">Chiedi all'AI</h1>

      {errore && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <strong>Errore:</strong> {errore}
        </div>
      )}

      {loading && (
        <div className="text-muted-foreground">
          <strong>L'assistente sta pensando...</strong>
        </div>
      )}

      <form onSubmit={carica} className="space-y-4">
        <div>
          <label htmlFor="titoli" className="mb-1 block text-sm font-medium">
            Libri che hai apprezzato
          </label>
          <input
            id="titoli"
            type="text"
            value={titoli}
            onChange={(e) => setTitoli(e.target.value)}
            placeholder="es. Hunger Games, Ossessione"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {errori.titoli && (
            <p className="mt-1 text-sm text-destructive">{errori.titoli[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="generi" className="mb-1 block text-sm font-medium">
            Generi preferiti
          </label>
          <input
            id="generi"
            type="text"
            value={generi}
            onChange={(e) => setGeneri(e.target.value)}
            placeholder="es. Fantasy, Thriller"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {errori.generi && (
            <p className="mt-1 text-sm text-destructive">{errori.generi[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="mood" className="mb-1 block text-sm font-medium">
            Il tuo umore
          </label>
          <input
            id="mood"
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="es. avventuroso"
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          {errori.mood && (
            <p className="mt-1 text-sm text-destructive">{errori.mood[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          Chiedi la recensione
        </button>
      </form>

      {risultato && (
        <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4 text-sm">
          {/* Contenuto futuro: mostra qui la recensione generata */}
        </div>
      )}
    </main>
  );
}