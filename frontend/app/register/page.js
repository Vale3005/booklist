"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const endPoint1 = "http://localhost:8000/api/register";

export default function Register() {
  const router = useRouter(); // reindirizza alla home dopo la registrazione
  const [loading, setLoading] = useState(false);
  const [errore, setErrore] = useState("");
  const [errori, setErrori] = useState({});
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  async function registrati(e) {
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
          name: nome,
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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <h1 className="mb-4">Registrazione Utente:</h1>

          <div className="mb-3">
            <label htmlFor="exampleInputName" className="form-label">
              Nome Utente:
            </label>
            <input
              type="text"
              className="form-control"
              id="exampleInputName"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            {errori.name && (
              <div className="text-danger small">{errori.name[0]}</div>
            )}
          </div>

          <form onSubmit={registrati}>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">
                Indirizzo Email:
              </label>
              <input
                type="email"
                className="form-control"
                id="exampleInputEmail1"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errori.email && (
                <div className="text-danger small">{errori.email[0]}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="exampleInputPassword" className="form-label">
                Inserisci Password:
              </label>
              <input
                type="password"
                className="form-control"
                id="exampleInputPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errori.password && (
                <div className="text-danger small">{errori.password[0]}</div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="exampleInputPassword1" className="form-label">
                Conferma Password:
              </label>
              <input
                type="password"
                className="form-control"
                id="exampleInputPassword1"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
              />
            </div>

            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Invio in corso...
                </>
              ) : (
                "Registrati"
              )}
            </button>

            {errore && (
              <div className="alert alert-danger mt-4">
                <strong>Errore:</strong> {errore}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
