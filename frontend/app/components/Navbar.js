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

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoggato(!!token);
    setAperto(false);
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
      sessionStorage.removeItem("ricerca");
      sessionStorage.removeItem("libri");
      router.push("/login");
    }
  }

  const linkClass =
    "text-base font-medium text-muted-foreground hover:text-primary transition-colors";

  return (
    <nav className="border-b bg-background">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-bold text-primary"
        >
          <img src="/logo.png" alt="Logo Booklist" className="h-5 w-auto" />
          Booklist 
        </Link>

        {/* Menu desktop */}
        <div className="hidden items-center gap-8 md:flex">
          <Link href="/" className={linkClass}>
            Home
          </Link>
          <Link href="/profilo" className={linkClass}>
            Profilo
          </Link>
          <Link href="/consigli" className={linkClass}>
            Consigliami
          </Link>
          <Link href="/impostazioni" className={linkClass}>
            Impostazioni
          </Link>
          <Button variant="outline" className="h-10 text-base" onClick={logout}>
            Esci
          </Button>
        </div>

        {/* Bottone hamburger (solo telefono) */}
        <button
          className="text-2xl md:hidden"
          onClick={() => setAperto(!aperto)}
          aria-label="Apri menu"
        >
          ☰
        </button>
      </div>

      {/* Menu telefono */}
      {aperto && (
        <div className="flex flex-col gap-4 border-t px-4 py-4 md:hidden">
          <Link href="/" className={`${linkClass} text-lg`}>
            Home
          </Link>
          <Link href="/profilo" className={`${linkClass} text-lg`}>
            Profilo
          </Link>
          <Link href="/consigli" className={linkClass}>
            Consigliami
          </Link>
          <Link href="/impostazioni" className={`${linkClass} text-lg`}>
            Impostazioni
          </Link>
          <Button variant="outline" className="h-11 text-base" onClick={logout}>
            Esci
          </Button>
        </div>
      )}
    </nav>
  );
}
