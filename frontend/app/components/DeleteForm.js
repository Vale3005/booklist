"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const endPoint = "http://localhost:8000/api/account";

export default function DeleteForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [errori, setErrori] = useState({});
  const [passwordIniziale, setPasswordIniziale] = useState("");

  async function elimina(e) {
    e.preventDefault();
    setLoading(true);
    setErrore("");
    setErrori({});

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(endPoint, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: passwordIniziale,
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

      localStorage.removeItem("token");
      router.push("/login");
    } catch (err) {
      setErrore(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-destructive">
          Elimina Account:
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="mb-6 text-base text-muted-foreground">
          Questa azione è irreversibile
        </p>
        <form onSubmit={elimina} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delete_password">Password attuale:</Label>
            <Input
              id="delete_password"
              type="password"
              value={passwordIniziale}
              autoComplete="current-password"
              onChange={(e) => setPasswordIniziale(e.target.value)}
            />
            {errori.password && (
              <p className="text-sm text-destructive">{errori.password[0]}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              variant="destructive"
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Eliminazione..." : "Elimina account"}
            </Button>
          </div>

          {errore && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {errore}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
