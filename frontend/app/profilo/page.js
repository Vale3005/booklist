"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BookCard from "../components/BookCard";
import ReadingForm from "../components/ReadingForm";
import Hearts from "../components/Hearts";

const endPoint = "http://localhost:8000/api/books";

export default function Profilo() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [letture, setLetture] = useState([]);

  //per il contatore: 
  const letti = letture.filter((lettura) => lettura.status === "read");
  const daLeggere = letture.filter((lettura) => lettura.status === "to_read");

  //per la tab divisa: 
  const [tabAttiva, setTabAttiva] = useState("read");
  const tabs = [
    { value: "read", label: "Letto" },
    { value: "to_read", label: "Da Leggere" },
  ];
  const visibili = letture.filter((l) => l.status === tabAttiva);

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

      {/* Barra delle tab */}
<div className="mt-6 flex gap-1 rounded-lg border border-stone-200 bg-white p-1">
  {tabs.map((tab) => (
    <button
      key={tab.value}
      onClick={() => setTabAttiva(tab.value)}
      className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 font-semibold transition ${
        tabAttiva === tab.value
          ? "bg-amber-700 text-white"
          : "text-stone-600 hover:bg-stone-100"
      }`}
    >
      <span className="text-lg">{tab.label}</span>
      <span
        className={`rounded-full px-2 py-0.5 text-sm ${
          tabAttiva === tab.value
            ? "bg-white/25 text-white"
            : "bg-stone-200 text-stone-700"
        }`}
      >
        {tab.value === "read" ? letti.length : daLeggere.length}
      </span>
    </button>
  ))}
</div>

      {/* Lista filtrata in base alla tab attiva */}
      {!loading && visibili.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-500">
          {tabAttiva === "read"
            ? "Non hai ancora letto nessun libro."
            : "Non è presente nessun libro da leggere."}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visibili.map((lettura) => (
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
      )}
    </main>
  );
}