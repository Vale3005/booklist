"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProfileForm from "../components/ProfileForm";
import PasswordForm from "../components/PasswordForm";
import DeleteForm from "../components/DeleteForm";

const endPoint = "http://localhost:8000/api/recensione";

export default function Recensione() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState("");
  const [risultato, setRisultato] = useState(null);
  const [titoli, setTitolo] = useState("");
  const [genere, setGenere] = useState("");
  const [mood, setMood] = useState("");

  useEffect(() => {
    async function carica(e) {
      e.preventDefault();
      setLoading(true);
      setErrore("");

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(endPoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ titoli, genere, mood }),
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
          return;
        }

        if (res.status === 422) {
        setErrori(data.errors);
        return;
      }

        // Altri errori (server, rete etc)
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        setRisultato(data);
      } catch (err) {
        setErrore(err.message);
      } finally {
        setLoading(false);
      }
    }
    carica();
  }, [router]);

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
    </main>
  );
}
