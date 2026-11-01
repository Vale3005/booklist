"use client";

/** Valutazione da 1 a 5 cuori. Se `onChange` è assente è di sola lettura. */
export default function Hearts({ value, onChange, size = "md" }) {
  const dimension = size === "sm" ? "text-base" : "text-2xl";
  const interactive = typeof onChange === "function";

  return (
    <div className={`flex items-center gap-1 ${dimension}`}>
      {[1, 2, 3, 4, 5].map((heart) => {
        const filled = value !== null && heart <= value;

        if (!interactive) {
          return (
            <span
              key={heart}
              className={filled ? "text-red-500" : "text-stone-300"}
              aria-hidden
            >
              ♥
            </span>
          );
        }

        return (
          <button
            key={heart}
            type="button"
            onClick={() => onChange(heart)}
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