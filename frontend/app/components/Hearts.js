"use client";

//Valutazione da 1 a 5 cuori. Se `onChange` è assente è di sola lettura

export default function Hearts({ value, onChange, size = "md" }) {
  const dimension = size === "sm" ? "text-base" : "text-2xl";
  const interactive = typeof onChange === "function"; //se è una funzione è true:
  // permette di evitare i cuori in sola lettura (perché onChange è undefined) quindi false 
  // oppure di vedere la funzione e quindi renderlo true per quelli letti

  return (
    <div className={`flex items-center gap-1 ${dimension}`}>
      {[1, 2, 3, 4, 5].map((heart) => {
        const filled = value !== null && heart <= value; //se c'è un voto e 
        // il numero è minore del valore di heart (5) allora è filled

        if (!interactive) { //se è false restituisce span, non cliccabile, 
        // con il cuore grigio se non è filled e rosso se è filled
          return (
            <span
              key={heart}
              className={filled ? "text-red-500" : "text-stone-300"}
              aria-hidden="true"
            >
              ♥
            </span>
          );
        }

        return ( //se è true restituisce un button senza fare submit grazie al type
          <button
            key={heart}
            type="button"
            onClick={() => onChange(heart === value ? null : heart)} //deseleziona 
            // un cuore selezionato
            className={`transition hover:scale-110 ${
              filled ? "text-red-500" : "text-stone-300 hover:text-red-300"
            }`}
            aria-label={`Valuta ${heart} su 5`}
          >
            ♥
          </button>
        );
      })}
    </div>
  );
}