"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const endPoint = "http://localhost:8000/api/account/password";

export default function PasswordForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [errori, setErrori] = useState({});
  const [messaggio, setMessaggio] = useState("");
  const [passwordIniziale, setPasswordIniziale] = useState("");
  const [nuovaPassword, setPassword] = useState("");
  const [confermaPassword, setConfermaPassword] = useState("");

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
          current_password: passwordIniziale,
          password: nuovaPassword,
          password_confirmation: confermaPassword,
        }),
      });

      const data = await res.json();

      // Token scaduto o non valido: torna al login
      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      // Errori di validazione
      if (res.status === 422) {
        if (data.errors) {
          setErrori(data.errors);
        } else {
          setErrore(data.message);
        }
        return;
      }

      // Altri errori (server, rete etc)
      if (!res.ok) {
        throw new Error(
          data.message || `HTTP ${res.status}: ${res.statusText}`,
        );
      }

      setMessaggio(data.message || "Password aggiornata");
      setPasswordIniziale("");
      setPassword("");
      setConfermaPassword("");
    } catch (err) {
      setErrore(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Gestione password:</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={salva} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Password attuale:</Label>
            <Input
              id="current_password"
              type="password"
              value={passwordIniziale}
              autoComplete="current-password"
              onChange={(e) => setPasswordIniziale(e.target.value)}
            />
            {errori.current_password && (
              <p className="text-sm text-destructive">
                {errori.current_password[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Nuova password:</Label>
            <Input
              type="password"
              id="password"
              value={nuovaPassword}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            {errori.password && (
              <p className="text-sm text-destructive">{errori.password[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirmation">
              Conferma nuova password:
            </Label>
            <Input
              type="password"
              id="password_confirmation"
              value={confermaPassword}
              onChange={(e) => setConfermaPassword(e.target.value)}
              autoComplete="new-password"
            />
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
