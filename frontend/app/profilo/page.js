"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BookCard from "../components/BookCard";
import ReadingForm from "../components/ReadingForm";

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

  return (
    <main className="container py-5">
      <h1> Il tuo profilo </h1>

      {errore && (
        <div className="alert alert-danger mt-4">
          <strong>Errore:</strong> {errore}
        </div>
      )}

      {loading && (
        <div className="mt-4">
          <strong>Caricamento...</strong>
        </div>
      )}

      <h2> Letti: </h2>
      {letti.length === 0 && !loading && (
        <p className="mt-3">Non hai ancora letto nessun libro.</p>
      )}

      <div className="row g-4 mt-3">
        {letti.map((lettura) => (
          <div key={lettura.id} className="col-12 col-sm-6 col-md-4 col-lg-3">
            <BookCard libro={lettura.book}>
              <ReadingForm lettura={lettura} />
            </BookCard>
          </div>
        ))}
      </div>

      <h2> Da Leggere: </h2>
      {daLeggere.length === 0 && !loading && (
        <p className="mt-3">Non è presente nessun libro da leggere.</p>
      )}
      <div className="row g-4 mt-3">
        {daLeggere.map((lettura) => (
          <div key={lettura.id} className="coal-12 col-sm-6 col-md-4 col-lg-3">
            <BookCard libro={lettura.book}>
              <ReadingForm lettura={lettura} />
            </BookCard>
          </div>
        ))}
      </div>
    </main>
  );
}
