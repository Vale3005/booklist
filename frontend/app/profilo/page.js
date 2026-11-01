"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BookCard from "../components/BookCard";
import ReadingForm from "../components/ReadingForm";
import Hearts from "../components/Hearts"

const endPoint = "http://localhost:8000/api/books";

export default function Profilo() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [letture, setLetture] = useState([]);
  const letti = letture.filter((lettura) => lettura.status === "read");
  const daLeggere = letture.filter((lettura) => lettura.status === "to_read");

  useEffect(() => {
    async function carica() {
      setLoading(true);
      setErrore("");

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(endPoint, {
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

        // Altri errori (server, rete etc)
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        console.log(data);
        setLetture(data);
      } catch (err) {
        setErrore(err.message);
      } finally {
        setLoading(false);
      }
    }
    carica();
  }, [router]);

  function rimuoviLettura(id) {
    setLetture((prima) =>
      prima.filter(
        /*scarta elemento che ha un id diverso*/
        (lettura) => lettura.id !== id,
      ),
    );
  }

  function aggiornaLettura(nuova) {
    setLetture((prima) =>
      prima.map((lettura) => (lettura.id === nuova.id ? nuova : lettura)),
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold text-primary">Il tuo profilo</h1>

      {errore && (
        <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <strong>Errore:</strong> {errore}
        </div>
      )}

      {loading && (
        <div className="mt-4 text-muted-foreground">
          <strong>Caricamento...</strong>
        </div>
      )}

      <h2 className="mt-8 text-2xl font-semibold">Letti:</h2>
      {letti.length === 0 && !loading && (
        <p className="mt-3 text-muted-foreground">
          Non hai ancora letto nessun libro.
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {letti.map((lettura) => (
          <div key={lettura.id}>
            <BookCard libro={lettura.book}>
              <ReadingForm
                lettura={lettura}
                onRimuovi={rimuoviLettura}
                onAggiorna={aggiornaLettura}
              />
            </BookCard>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-2xl font-semibold">Da Leggere:</h2>
      {daLeggere.length === 0 && !loading && (
        <p className="mt-3 text-muted-foreground">
          Non è presente nessun libro da leggere.
        </p>
      )}
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {daLeggere.map((lettura) => (
          <div key={lettura.id}>
            <BookCard libro={lettura.book}>
              <ReadingForm
                lettura={lettura}
                onRimuovi={rimuoviLettura}
                onAggiorna={aggiornaLettura}
              />
            </BookCard>
          </div>
        ))}
      </div>
    </main>
  );
}