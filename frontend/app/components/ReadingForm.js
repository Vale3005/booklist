"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const endPoint = "http://localhost:8000/api/books";

export default function ReadingForm({ lettura }) {
  const router = useRouter();
  const [voto, setVoto] = useState(lettura.rating || "");
  const [recensione, setRecensione] = useState(lettura.review || "");
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");

  async function salva(nuovoVoto, nuovaRecensione) {
    setLoading(true);
    setErrore("");

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
    } catch (err) {
      setErrore(err.message);
    } finally {
      setLoading(false);
    }
}
  function cambiaVoto(e) {
    const valore = e.target.value;
    const nuovoVoto = valore === "" ? null : Number(valore);
    setVoto(valore); 
    salva(nuovoVoto, recensione); //riceve nuovo voto convertito in numero e recensione com'è in quel momento
  }

  return (
    <div>
      <select
        className="form-select"
        value={voto}
        onChange={cambiaVoto}
        disabled={loading} //blocca tendina mentre la richiesta è in corso
      >
        <option value="">Nessun voto</option>
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
      </select>
    </div>
  );
}
