"use client";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const endPoint = "http://localhost:8000/api/books/details";
const endPoint2 = "http://localhost:8000/api/books"; // NUOVO

export default function PaginaLibro() {
  const { olid } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState(""); // NUOVO
  const [libro, setLibro] = useState(null);

  // NUOVO
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
          open_library_key: `/works/${olid}`,
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
        return;
      }

      if (res.status === 409) {
        setErrore("Libro già presente nella tua lista");
        return;
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      setMessaggio("Libro aggiunto alla tua lista");
    } catch (err) {
      setErrore(err.message);
    } finally {
      setLoading(false);
    }
  }

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
        {/* NUOVO */}
        {messaggio && (
          <div className="rounded-lg border border-green-600/50 bg-green-600/10 p-3 text-sm text-green-700">
            {messaggio}
          </div>
        )}
        {loading && <p className="text-muted-foreground">Caricamento...</p>}

        {libro && (
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="flex justify-center">
              {libro.cover_url && (
                <img
                  className="max-h-[45vh] w-auto rounded-lg object-contain shadow-md md:max-h-[65vh]"
                  src={libro.cover_url}
                  alt={libro.title}
                />
              )}
            </div>

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
            </div>
          </div>
        )}
      </main>

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