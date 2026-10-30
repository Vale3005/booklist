"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const endPoint1 = "http://localhost:8000/api/logout";

export default function Navbar() {
  const [loggato, setLoggato] = useState(false);
  const [aperto, setAperto] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Controlla il token a ogni cambio di pagina
  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggato(!!token);
    setAperto(false); // chiude il menu mobile quando cambi pagina
  }, [pathname]);

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
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error(err);
    } finally {
      localStorage.removeItem("token");
      router.push("/login");
    }
  }

  const linkClass =
  "text-sm font-medium text-muted-foreground hover:text-primary transition-colors";

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-primary">
          Booklist
        </Link>

        {/* Menu desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <Link href="/" className={linkClass}>Home</Link>
          <Link href="/profilo" className={linkClass}>Profilo</Link>
          <Link href="#" className={linkClass}>Impostazioni</Link>
          <Button variant="outline" onClick={logout}>Esci</Button>
        </div>

        {/* Bottone hamburger (solo telefono) */}
        <button
          className="md:hidden"
          onClick={() => setAperto(!aperto)}
          aria-label="Apri menu"
        >
          ☰
        </button>
      </div>

      {/* Menu telefono */}
      {aperto && (
        <div className="flex flex-col gap-3 border-t px-4 py-3 md:hidden">
          <Link href="/" className={linkClass}>Home</Link>
          <Link href="/profilo" className={linkClass}>Profilo</Link>
          <Link href="#" className={linkClass}>Impostazioni</Link>
          <Button variant="outline" onClick={logout}>Esci</Button>
        </div>
      )}
    </nav>
  );
}