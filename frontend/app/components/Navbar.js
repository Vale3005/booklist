"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [loggato, setLoggato] = useState(false);

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js");
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setLoggato(true);
    }
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          Navbar
        </a>
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
            {loggato ? (
              <button className="btn btn-outline-danger ms-2"><Link className="nav-link" href="/logout">Esci</Link></button>
            ) : (
              <>
                <Link className="nav-link ms-2" href="/login">
                  Accedi
                </Link>
                <Link className="nav-link ms-2" href="/register">
                  Registrati
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}