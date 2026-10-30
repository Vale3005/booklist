"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BookCard from "../../components/BookCard";
import ReadingForm from "../../components/ReadingForm";

const endPoint = "http://localhost:8000/api/books/details";

export default function PaginaLibro() {
  const { olid } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [lettura, setLettura] = useState(null);


  useEffect(() => {
    async function carica() {
      setLoading(true);
      setErrore("");

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(endPoint + olid, {
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
        console.log(data);
        setLettura(data);
      } catch (err) {
        setErrore(err.message);
      } finally {
        setLoading(false);
      }
    }
    carica();
  }, [router, id]); 

return (
  <main className="mx-auto max-w-4xl px-4 py-10">
    {errore && (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
        {errore}
      </div>
    )}
    {loading && <p className="text-muted-foreground">Caricamento...</p>}

    {lettura && (
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Colonna sinistra: copertina */}
        <div className="md:w-1/3">
          <img className="w-full rounded-lg object-cover" src="" alt="" />
        </div>

        {/* Colonna destra: dettagli */}
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold"></h1>
          <p className="text-lg text-muted-foreground"></p>
          <p className="text-sm text-muted-foreground"></p>
          <p className="leading-relaxed"></p>
        </div>
      </div>
    )}
  </main>
);

}

