"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
const endPoint1 = "http://localhost:8000/api/logout";


export default function Navbar() {
  const [loggato, setLoggato] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // installo JavaScript di Bootstrap 
  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  // Controlla il token a ogni cambio di pagina
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoggato(true);
    } else {
      setLoggato(false);
    }
  }, [pathname]);

  // Per non far vedere la navbar in caso non si sia loggati
  if (!loggato) {
    return null;
  }

  async function logout() {
  const token = localStorage.getItem("token");

  try {
    await fetch(endPoint1, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`, // autorizza il bearer del token 
      },
    });
  } catch (err) {
    console.error(err);
  } finally {
    localStorage.removeItem("token");
    router.push("/login");
  }
}

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" href="/">
          Booklist
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className="nav-link active" aria-current="page" href="/">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Profilo
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                Impostazioni
              </a>
            </li>
          </ul>
          <form className="d-flex">
            <input
              className="form-control me-2"
              type="search"
              placeholder="Search"
              aria-label="Search"
            />
            <button className="btn btn-primary" type="submit">
              Search
            </button>
          </form>

          <div className="d-flex align-items-center">
            <button className="btn btn-outline-danger ms-2" type="button" onClick={logout}>
              Esci
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}