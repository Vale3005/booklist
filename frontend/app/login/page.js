"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
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

const endPoint1 = "http://localhost:8000/api/login";

export default function Login() {
  const router = useRouter(); // reindirizza alla home dopo login
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [errori, setErrori] = useState({});
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  async function accedi(e) {
    e.preventDefault();
    setLoading(true);
    setErrore("");
    setErrori({});

    try {
      const res = await fetch(endPoint1, {
        method: "POST",
        headers: {
          Accept: "application/json", //così per errori non reindirizza in laravel ma json
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          login: login,
          password: password,
          
        }),
      });

      const data = await res.json();

      // Errori di validazione: Laravel manda { message, errors: { campo: [messaggi] } }
      if (res.status === 422) {
        setErrori(data.errors);
        return;
      }

      // Credenziali sbagliate: Laravel risponde 401 
      if (res.status === 401) {
        setErrore("Credenziali non corrette");
        return;
      }

      // Altri errori (server, rete etc)
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      // Se va bene salva il token e va alla home
      localStorage.setItem("token", data.token);
      router.push("/");
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
          <CardTitle className="text-2xl">Login utente</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={accedi} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exampleInputEmail1">Nome utente o email:</Label>
              <Input
                id="exampleInputEmail1"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                autoComplete="username"
              />
              {errori.login && (
                <p className="text-sm text-destructive">{errori.login[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="exampleInputPassword">Inserisci password:</Label>
              <Input
                type="password"
                id="exampleInputPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              {errori.password && (
                <p className="text-sm text-destructive">{errori.password[0]}</p>
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
                "Accedi"
              )}
            </Button>

            {errore && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <strong>Errore:</strong> {errore}
              </div>
            )}
          </form>
        </CardContent>

        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Non hai ancora un account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Registrati
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}