"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const endPoint = "http://localhost:8000/api/books";

export default function ReadingForm({ lettura, onRimuovi, onAggiorna }) {
  const router = useRouter();
  const [voto, setVoto] = useState(lettura.rating || "");
  const [recensione, setRecensione] = useState(lettura.review || "");
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [messaggio, setMessaggio] = useState("");

  async function salva(nuovoVoto, nuovaRecensione) {
    setLoading(true);
    setErrore("");
    setMessaggio("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${endPoint}/${lettura.id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: nuovoVoto,
          review: nuovaRecensione,
        }),
      });

      // Token scaduto o non valido: torna al login
      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      // Altri errori (validazione, server, rete etc)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json(); // la PUT restituisce la lettura aggiornata
      onAggiorna(data); // aggiorna la lista in page.js
      setMessaggio("Salvato");
    } catch (err) {
      setErrore(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function rimuovi() {
    setLoading(true);
    setErrore("");
    setMessaggio("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${endPoint}/${lettura.id}`, {
        method: "DELETE",
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

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      onRimuovi(lettura.id); // toglie la lettura dalla lista in page.js (la DELETE non restituisce JSON)
    } catch (err) {
      setErrore(err.message);
    } finally {
      setLoading(false);
    }
  }

  function salvaRecensione() {
    const votoNumero = voto === "" ? null : Number(voto);
    salva(votoNumero, recensione);
  }

  async function sposta(nuovoStato) {
    setLoading(true);
    setErrore("");
    setMessaggio("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${endPoint}/${lettura.id}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: nuovoStato,
        }),
      });

      // Token scaduto o non valido: torna al login
      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      // Altri errori (validazione, server, rete etc)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json(); // la PUT restituisce la lettura aggiornata
      onAggiorna(data); // aggiorna la lista in page.js
    } catch (err) {
      setErrore(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      {/* Voto e recensione solo per i libri letti */}
      {lettura.status === "read" && (
        <>
          <select
            className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
            value={voto}
            onChange={(e) => setVoto(e.target.value)}
            disabled={loading} // blocca la tendina mentre la richiesta è in corso
          >
            <option value="">Nessun voto</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>

          <Textarea
            rows={3}
            placeholder="Scrivi una recensione..."
            value={recensione}
            onChange={(e) => setRecensione(e.target.value)}
          />

          <Button
            type="button"
            className="w-full"
            onClick={salvaRecensione}
            disabled={loading}
          >
            Salva
          </Button>
        </>
      )}

      <div className="flex gap-2">
        {lettura.status === "read" ? ( //operatore ternario se è stato letto oppure no 
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => sposta("to_read")}
            disabled={loading}
          >
            Da leggere
          </Button>
        ) : (
          <Button
            type="button"
            className="flex-1"
            onClick={() => sposta("read")}
            disabled={loading}
          >
            Letto
          </Button>
        )}

        {/* Rimuovi c'è sempre, sia per Letti che per Da Leggere */}
        <Button
          type="button"
          variant="outline"
          className="flex-1 text-destructive"
          onClick={rimuovi}
          disabled={loading}
        >
          Rimuovi
        </Button>
      </div>

      {errore && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {errore}
        </div>
      )}
      {messaggio && (
        <div className="rounded-lg border border-green-600/50 bg-green-600/10 p-3 text-sm text-green-700">
          {messaggio}
        </div>
      )}
    </div>
  );
}