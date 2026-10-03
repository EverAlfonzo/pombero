"use client";

/**
 * Lista de opciones (2 a 4). Se eligen con clic/toque o con las teclas 1–4.
 */
import { useEffect, useEffectEvent } from "react";

export interface ChoiceItem {
  id: string;
  label: string;
}

export default function ChoiceList({
  choices,
  onChoose,
}: {
  choices: ChoiceItem[];
  onChoose: (id: string) => void;
}) {
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
    const n = Number.parseInt(e.key, 10);
    if (n >= 1 && n <= choices.length) {
      e.preventDefault();
      onChoose(choices[n - 1].id);
    }
  });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  return (
    <ol className="flex flex-col gap-2.5" aria-label="Opciones">
      {choices.map((choice, i) => (
        <li key={choice.id} className="animate-rise" style={{ animationDelay: `${i * 90}ms` }}>
          <button
            type="button"
            onClick={() => onChoose(choice.id)}
            className="group flex min-h-14 w-full items-center gap-3 rounded-xl border-2 border-papel/60 bg-tinta/90 px-4 py-3 text-left text-lg font-bold text-papel transition-colors hover:border-ocre hover:bg-[#2a1a12] sm:text-xl"
          >
            <span
              aria-hidden="true"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ocre text-base text-tinta group-hover:bg-ocre-claro"
            >
              {i + 1}
            </span>
            <span>{choice.label}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}
