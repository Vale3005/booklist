"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";

// ISBN di libri famosi: il browser carica le copertine direttamente da Open Library
const ISBN = [
  "9780451524935", // 1984
  "9780547928227", // The Hobbit
  "9780590353427", // Harry Potter
  "9780141439518", // Pride and Prejudice
  "9780743273565", // The Great Gatsby
  "9780061120084", // To Kill a Mockingbird
  "9780441172719", // Dune
  "9780316769488", // The Catcher in the Rye
  "9780060850524", // Brave New World
  "9781451673319", // Fahrenheit 451
  "9780062315007", // The Alchemist
  "9780547928210", // The Fellowship of the Ring
  "9780553593716", // A Game of Thrones
  "9780307474278", // The Da Vinci Code
  "9780451526342", // Animal Farm
  "9780141441146", // Jane Eyre
  "9780142437247", // Moby Dick
  "9780143058144", // Crime and Punishment
  "9780156012195", // The Little Prince
  "9780439023528", // The Hunger Games
];

export default function PopularSlider() {
  const trackRef = useRef(null);

  function scorri(direzione) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direzione * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <section className="mt-10">
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Precedenti"
          className="absolute -left-3 top-1/2 z-20 hidden -translate-y-1/2 md:flex"
          onClick={() => scorri(-1)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Button>

        <div
          ref={trackRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-2 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {ISBN.map((isbn) => (
            <div key={isbn} className="w-32 shrink-0 snap-start sm:w-36">
              <img
                src={`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg?default=false`}
                alt="Copertina di un libro"
                loading="lazy"
                className="aspect-[2/3] w-full rounded-md object-cover shadow-md"
                onError={(e) => {
                  // se la copertina non esiste, nasconde l'elemento
                  e.currentTarget.parentElement.style.display = "none";
                }}
              />
            </div>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Successivi"
          className="absolute -right-3 top-1/2 z-20 hidden -translate-y-1/2 md:flex"
          onClick={() => scorri(1)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </Button>
      </div>
    </section>
  );
}