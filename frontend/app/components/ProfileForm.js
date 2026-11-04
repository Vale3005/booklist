"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const endPoint = "http://localhost:8000/api/account";

export default function ProfileForm({ utente, onAggiorna }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [errori, setErrori] = useState({});
  const [messaggio, setMessaggio] = useState("");
  const [email, setEmail] = useState(utente.email); //parte da utenti esistenti
  const [name, setName] = useState(utente.name); //parte da utenti esistenti

  async function salva(e) {
    e.preventDefault();
    setLoading(true);
    setErrore("");
    setErrori({});
    setMessaggio("");

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(endPoint, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name,
          email: email,
        }),
      });

      const data = await res.json();

      // Token scaduto o non valido: torna al login
      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      // Errori di validazione (nome o email già usati, formato sbagliato...)
      if (res.status === 422) {
        setErrori(data.errors || {}); //evita l'errore se erros non arriva
        return;
      }

      // Altri errori (server, rete etc)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      onAggiorna(data); // la PUT restituisce l'utente aggiornato
      setMessaggio("Dati aggiornati");
    } catch (err) {
      setErrore(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Cambia nome utente o email</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={salva} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome utente:</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="username"
            />
            {errori.name && (
              <p className="text-sm text-destructive">{errori.name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email:</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            {errori.email && (
              <p className="text-sm text-destructive">{errori.email[0]}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Salvataggio..." : "Salva"}
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
        </form>
      </CardContent>
    </Card>
  );
}
