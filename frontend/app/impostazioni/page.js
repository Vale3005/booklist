"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProfileForm from "../components/ProfileForm";
import PasswordForm from "../components/PasswordForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const endPoint = "http://localhost:8000/api/user";

export default function Impostazioni() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState("");
  const [utente, setUtente] = useState(null);

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
        setUtente(data);
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
      <h1 className="mb-6 text-3xl font-bold text-primary">Impostazioni</h1>

      {errore && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          <strong>Errore:</strong> {errore}
        </div>
      )}

      {loading && (
        <div className="text-muted-foreground">
          <strong>Caricamento...</strong>
        </div>
      )}

      {/* Controllo temporaneo: serve solo a vedere che i dati arrivano */}
      {utente && <ProfileForm utente={utente} onAggiorna={setUtente} />}

      <div className="mt-6">
        <PasswordForm />
      </div>
    </main>
  );
}
