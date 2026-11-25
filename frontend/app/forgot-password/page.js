"use client";

import Link from "next/link";
import { useState } from "react";
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

const endPoint = "http://localhost:8000/api/forgot-password";

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [errori, setErrori] = useState({});
  const [email, setEmail] = useState("");
  const [messaggio, setMessaggio] = useState("");

  async function invia(e) {
    e.preventDefault();
    setLoading(true);
    setErrore("");
    setErrori({});
    setMessaggio("");

    try {
      const res = await fetch(endPoint, {
        method: "POST",
        headers: {
          Accept: "application/json", //così per errori non reindirizza in laravel ma json
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await res.json();

      // Errori di validazione: Laravel manda { message, errors: { campo: [messaggi] } }
      if (res.status === 422) {
        setErrori(data.errors);
        return;
      }

      // Altri errori (server, rete etc)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      //backend risponde sempre con lo stesso messaggio, che l'email esista o no
      setMessaggio(data.message);
      setEmail("");
    } catch (err) {
      setErrore(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Recupera password</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={invia} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot_email">Inserisci email:</Label>
              <Input
                id="forgot_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {errori.email && (
                <p className="text-sm text-destructive">{errori.email[0]}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <span
                    className="mr-2 inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Invio in corso...
                </>
              ) : (
                "Invia link"
              )}
            </Button>

            {errore && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <strong>Errore:</strong> {errore}
              </div>
            )}

            {messaggio && (
              <div className="rounded-lg border border-green-600/50 bg-green-600/10 p-3 text-sm text-green-700">
                {messaggio}
              </div>
            )}
          </form>
        </CardContent>

        <CardFooter>
          <p className="text-sm text-muted-foreground">
            <Link
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              Torna al login
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}