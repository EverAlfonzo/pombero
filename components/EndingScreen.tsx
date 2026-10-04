"use client";

/** Pantalla de final: nombre, texto de cierre y "Volver a jugar". */
import { useEffect } from "react";
import { ENDINGS } from "@/data/story";
import { audio } from "@/lib/audio";
import type { EndingId } from "@/lib/types";
import SceneBackground from "./illustrations/SceneBackground";
import { Button, SoundToggle } from "./ui";

const TONE_SOUND = {
  good: "ending-good",
  neutral: "ending-neutral",
  bad: "ending-bad",
  secret: "ending-neutral",
} as const;

const TONE_COLOR = {
  good: "text-[#9fdc8a]",
  neutral: "text-ocre-claro",
  bad: "text-[#ff9a82]",
  secret: "text-lapacho",
} as const;

interface Props {
  endingId: EndingId;
  isNew: boolean;
  respect: number;
  /** Convierte {ofrendas} en texto. */
  format: (text: string) => string;
  muted: boolean;
  onToggleMute: () => void;
  onRestart: () => void;
  onGallery: () => void;
  onMenu: () => void;
}

export default function EndingScreen({
  endingId,
  isNew,
  respect,
  format,
  muted,
  onToggleMute,
  onRestart,
  onGallery,
  onMenu,
}: Props) {
  const ending = ENDINGS[endingId];

  useEffect(() => {
    audio.play(TONE_SOUND[ending.tone]);
  }, [ending.tone]);

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <SceneBackground id={ending.background} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/20" />

      <div className="absolute top-3 right-3 z-10">
        <SoundToggle muted={muted} onToggle={onToggleMute} />
      </div>

      <div className="flex-1" />

      <section className="relative z-10 mx-auto w-full max-w-2xl animate-fade-in px-4 pb-6 sm:pb-10">
        <p className="text-sm font-bold tracking-[0.25em] text-papel/80 uppercase">
          {ending.secret ? "Final secreto" : "Final"}
          {isNew && (
            <span className="ml-2 rounded-full border-2 border-tinta bg-luciernaga px-2 py-0.5 tracking-normal text-tinta normal-case">
              ¡Nuevo!
            </span>
          )}
        </p>
        <h1
          className={`font-display text-5xl leading-tight font-bold drop-shadow-[3px_3px_0_#1d1410] sm:text-6xl ${TONE_COLOR[ending.tone]}`}
        >
          {ending.title}
        </h1>

        <div className="comic-panel mt-4 space-y-3 p-5 text-lg leading-relaxed">
          {ending.paragraphs.map((p, i) => (
            <p key={i} className="animate-rise" style={{ animationDelay: `${300 + i * 650}ms` }}>
              {format(p)}
            </p>
          ))}
          {ending.id !== "siesta" && (
            <p className="pt-1 text-sm text-tinta/70">Respeto al monte final: {respect}/100</p>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
          <Button onClick={onRestart} autoFocus className="sm:flex-1">
            Volver a jugar
          </Button>
          <Button variant="secondary" onClick={onGallery}>
            Finales
          </Button>
          <Button variant="secondary" onClick={onMenu}>
            Menú
          </Button>
        </div>
      </section>
    </main>
  );
}
