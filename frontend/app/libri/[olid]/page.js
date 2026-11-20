"use client";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const endPoint = "http://localhost:8000/api/books/details";

export default function PaginaLibro() {
  const { olid } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [libro, setLibro] = useState(null);

  useEffect(() => {
    async function carica() {
      setLoading(true);
      setErrore("");

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(endPoint + "/" + olid, {
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
          return;
        }

        // Altri errori (server, rete etc)
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setLibro(data);
      } catch (err) {
        setErrore(err.message);
      } finally {
        setLoading(false);
      }
    }
    carica();
  }, [router, olid]);

  return (
    <>
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-8">
        {errore && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            {errore}
          </div>
        )}
        {loading && <p className="text-muted-foreground">Caricamento...</p>}

        {libro && (
          <div className="grid items-center gap-8 md:grid-cols-2">
            {/* Colonna sinistra: copertina centrata, con altezza limitata */}
            <div className="flex justify-center">
              {libro.cover_url && (
                <img
                  className="max-h-[45vh] w-auto rounded-lg object-contain shadow-md md:max-h-[65vh]"
                  src={libro.cover_url}
                  alt={libro.title}
                />
              )}
            </div>

            {/* Colonna destra: dettagli, centrati in verticale rispetto alla copertina */}
            <div className="space-y-4 text-center md:text-left">
              <h1 className="text-3xl font-bold">
                {libro.title} - {libro.author}
              </h1>
              <p className="text-lg text-muted-foreground">
                {libro.year || "Data di uscita non disponibile"}
              </p>
              <p className="max-h-[35vh] overflow-y-auto pr-2 text-left leading-relaxed">
                {libro.description || "Trama non disponibile"}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Barra fissa in basso con il pulsante Indietro */}
       <div className="fixed inset-x-0 bottom-0 border-t bg-background py-6">
        <div className="mx-auto flex max-w-5xl justify-center px-4">
          <Button variant="outline" onClick={() => router.back()}>
            Indietro
          </Button>
        </div>
      </div>
    </>
  );
}