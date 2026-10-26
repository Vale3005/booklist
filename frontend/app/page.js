"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem ("token"); //legge se il valore di setItem nel login con il get 
    if (!token) { //se utente non è loggato
      router.push("/login");
    }
  }, [router]);

  return (
    <main className="container py-5">
      <h1>Booklist</h1>
    </main>
  );
}