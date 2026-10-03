"use client";

/**
 * Caja de diálogo estilo novela visual.
 * - El texto aparece letra por letra.
 * - Clic / toque / Espacio: si el texto se está escribiendo, lo completa;
 *   si ya está completo, avanza (`onAdvance`).
 * - El componente padre debe cambiar la `key` en cada línea nueva para
 *   reiniciar el efecto de máquina de escribir.
 */
import { useEffect, useEffectEvent, useState } from "react";

const MS_PER_CHAR = 28;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

interface Props {
  speaker?: string;
  text: string;
  /** Si es false, la caja solo muestra el texto (p. ej. mientras hay opciones). */
  interactive?: boolean;
  onAdvance?: () => void;
}

export default function DialogueBox({ speaker, text, interactive = true, onAdvance }: Props) {
  const [shown, setShown] = useState(() =>
    !interactive || prefersReducedMotion() ? text.length : 0,
  );
  const done = shown >= text.length;

  // Máquina de escribir.
  useEffect(() => {
    if (done) return;
    const id = window.setInterval(() => {
      setShown((s) => Math.min(text.length, s + 1));
    }, MS_PER_CHAR);
    return () => window.clearInterval(id);
  }, [done, text.length]);

  const handleActivate = () => {
    if (!interactive) return;
    if (!done) setShown(text.length);
    else onAdvance?.();
  };

  // Espacio avanza (salvo que el foco esté en otro botón, que lo usa nativamente).
  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.code !== "Space" && e.key !== " ") return;
    if (e.repeat) return;
    const target = e.target as HTMLElement | null;
    if (target?.closest("button, a, input, textarea, select")) return;
    e.preventDefault();
    handleActivate();
  });

  useEffect(() => {
    if (!interactive) return;
    const listener = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [interactive]);

  const body = (
    <>
      {speaker && (
        <span className="absolute -top-4 left-4 rounded-lg border-2 border-ocre-claro bg-ocre px-3 py-0.5 font-display text-xl font-bold text-tinta shadow">
          {speaker}
        </span>
      )}
      {/* Texto visible animado (oculto a lectores de pantalla). */}
      <p
        aria-hidden="true"
        className={`min-h-[4.5em] text-lg leading-relaxed sm:text-xl ${speaker ? "pt-2 text-papel" : "text-papel/95 italic"}`}
      >
        {text.slice(0, shown)}
        {/* El resto del texto ocupa lugar para que la caja no "salte". */}
        <span className="invisible">{text.slice(shown)}</span>
      </p>
      {/* Texto completo para lectores de pantalla. */}
      <span className="sr-only" aria-live="polite">
        {speaker ? `${speaker}: ` : ""}
        {text}
      </span>
      {interactive && (
        <span
          aria-hidden="true"
          className={`absolute right-4 bottom-2 text-sm font-bold text-ocre-claro ${done ? "" : "opacity-0"}`}
          style={done ? { animation: "caret 1.2s step-end infinite" } : undefined}
        >
          Seguir ▸
        </span>
      )}
    </>
  );

  const boxClass =
    "relative block w-full rounded-2xl border-2 border-papel/30 bg-[#140c09]/90 px-5 pt-5 pb-8 text-left shadow-2xl backdrop-blur-sm";

  if (!interactive) return <div className={boxClass}>{body}</div>;

  return (
    <button
      type="button"
      onClick={handleActivate}
      className={`${boxClass} cursor-pointer hover:border-papel/50`}
      aria-label={done ? "Seguir" : "Mostrar todo el texto"}
    >
      {body}
    </button>
  );
}
