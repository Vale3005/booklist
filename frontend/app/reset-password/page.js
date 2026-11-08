"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import PasswordInput from "../components/PasswordInput";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const endPoint1 = "http://localhost:8000/api/reset-password";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [errori, setErrori] = useState({});
  const [messaggio, setMessaggio] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  async function invia(e) {
    e.preventDefault();
    setLoading(true);
    setErrore("");
    setErrori({});
    setMessaggio("");

    try {
      const res = await fetch(endPoint1, {
        method: "POST",
        headers: {
          Accept: "application/json", //così per errori non reindirizza in laravel ma json
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: token,
          email: email,
          password: password,
          password_confirmation: passwordConfirm,
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

      setMessaggio(data.message);
      setPassword("");
      setPasswordConfirm("");
    } catch (err) {
      setErrore(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Se nell'indirizzo mancano token o email il form non ha senso
  if (!token || !email) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">Link non valido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Il link per reimpostare la password non è completo. Richiedine
              uno nuovo.
            </p>
          </CardContent>
          <CardFooter>
            <Link
              href="/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              Richiedi un nuovo link
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Reimposta password</CardTitle>
        </CardHeader>

        <CardContent>
          {messaggio ? (
            <div className="space-y-4">
              <div className="rounded-lg border border-green-600/50 bg-green-600/10 p-3 text-sm text-green-700">
                {messaggio}
              </div>
              <Link
                href="/login"
                className="text-sm font-medium text-primary hover:underline"
              >
                Vai al login
              </Link>
            </div>
          ) : (
            <form onSubmit={invia} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new_password">Nuova password:</Label>
                <PasswordInput
                  id="new_password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                {errori.password && (
                  <p className="text-sm text-destructive">
                    {errori.password[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password_confirmation">
                  Conferma nuova password:
                </Label>
                <PasswordInput
                  id="new_password_confirmation"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  autoComplete="new-password"
                />
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
                  "Reimposta password"
                )}
              </Button>

              {/* Link scaduto o già usato: il backend lo segnala sul campo email */}
              {errori.email && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  {errori.email[0]}{" "}
                  <Link href="/forgot-password" className="underline">
                    Richiedi un nuovo link
                  </Link>
                </div>
              )}

              {errore && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                  <strong>Errore:</strong> {errore}
                </div>
              )}
            </form>
          )}
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

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}