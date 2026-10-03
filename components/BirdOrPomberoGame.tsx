"use client";

/**
 * Minijuego "¿Pájaro o Pombero?"
 * 5 rondas: suena un silbido sintetizado y el jugador decide quién lo hizo.
 * Se puede jugar sin audio: cada sonido tiene subtítulo descriptivo y una
 * onda animada que dibuja la curva de tono (trinos cortos vs. silbido largo).
 *
 * Teclado: 1 = Pájaro, 2 = Pombero, R = repetir, Espacio/Enter = seguir.
 */
import { useEffect, useEffectEvent, useState } from "react";
import { MINIGAME } from "@/data/story";
import { audio, createWhistle, pomberoFreqAt, type WhistlePattern } from "@/lib/audio";
import type { WhistleKind } from "@/lib/types";
import { Button, Kbd } from "./ui";

interface Round {
  kind: WhistleKind;
  pattern: WhistlePattern;
  caption: string;
}

const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

/** Mezcla de rondas con al menos 2 de cada tipo. */
function createRounds(): WhistleKind[] {
  const kinds: WhistleKind[] = ["pajaro", "pajaro", "pombero", "pombero"];
  while (kinds.length < MINIGAME.rounds) kinds.push(pick<WhistleKind>(["pajaro", "pombero"]));
  for (let i = kinds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kinds[i], kinds[j]] = [kinds[j], kinds[i]];
  }
  return kinds;
}

function createRound(kind: WhistleKind): Round {
  return { kind, pattern: createWhistle(kind), caption: pick(MINIGAME.captions[kind]) };
}

// ──────────────────────────────────────────── Onda animada

const WAVE_W = 320;
const WAVE_H = 110;
const F_MIN = 500;
const F_MAX = 6500;

/** Frecuencia → altura (escala logarítmica: agudo arriba). */
const yFor = (f: number) => {
  const k = Math.log(Math.max(F_MIN, Math.min(F_MAX, f)) / F_MIN) / Math.log(F_MAX / F_MIN);
  return WAVE_H - 10 - k * (WAVE_H - 20);
};

function wavePath(pattern: WhistlePattern): string {
  // Ambos tipos se dibujan sobre la misma escala de tiempo (3 s) para que se
  // note que el trino es corto y el silbido largo.
  const span = 3;
  const xFor = (t: number) => 8 + (t / span) * (WAVE_W - 16);
  const parts: string[] = [];
  if (pattern.kind === "pajaro") {
    for (const n of pattern.notes) {
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        const x = i / steps;
        const t = n.start + x * n.dur;
        // Exageramos el temblor de la FM para que se vea.
        const f = n.f0 * Math.pow(n.f1 / n.f0, x) + Math.sin(i * 2.2) * n.fmDepth * 1.6;
        parts.push(`${i === 0 ? "M" : "L"}${xFor(t).toFixed(1)},${yFor(f).toFixed(1)}`);
      }
    }
  } else {
    const steps = 90;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * pattern.duration;
      const f = pomberoFreqAt(pattern.keys, t) + Math.sin(t * Math.PI * 2 * pattern.vibrato) * 12;
      parts.push(`${i === 0 ? "M" : "L"}${xFor(t).toFixed(1)},${yFor(f).toFixed(1)}`);
    }
  }
  return parts.join(" ");
}

function WhistleWave({ pattern, playId }: { pattern: WhistlePattern; playId: number }) {
  const color = "#ffe55c";
  return (
    <div className="relative" aria-hidden="true">
      <svg
        viewBox={`0 0 ${WAVE_W} ${WAVE_H}`}
        preserveAspectRatio="none"
        className="h-28 w-full rounded-xl border-2 border-papel/25 bg-[#0b1630]"
      >
        {[0.25, 0.5, 0.75].map((r) => (
          <line
            key={r}
            x1="0"
            x2={WAVE_W}
            y1={WAVE_H * r}
            y2={WAVE_H * r}
            stroke="#fbf6ea"
            strokeOpacity="0.1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path
          // La key reinicia la animación de dibujo en cada reproducción.
          key={playId}
          vectorEffect="non-scaling-stroke"
          d={wavePath(pattern)}
          pathLength={1}
          fill="none"
          stroke={color}
          strokeWidth={pattern.kind === "pajaro" ? 2.2 : 3.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={
            {
              "--len": 1,
              strokeDasharray: 1,
              strokeDashoffset: 0,
              filter: `drop-shadow(0 0 4px ${color})`,
              animation: `wave-draw ${pattern.duration}s linear both`,
            } as React.CSSProperties
          }
        />
      </svg>
      <span className="absolute top-1 left-2 text-xs text-papel/60">agudo</span>
      <span className="absolute bottom-1 left-2 text-xs text-papel/60">grave</span>
    </div>
  );
}

// ──────────────────────────────────────────── Minijuego

interface Props {
  onAnswer: (correct: boolean) => void;
  onDone: () => void;
}

type Phase = "intro" | "listen" | "feedback" | "outro";

export default function BirdOrPomberoGame({ onAnswer, onDone }: Props) {
  const [kinds] = useState(createRounds);
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState<Round | null>(null);
  const [phase, setPhase] = useState<Phase>("intro");
  const [lastAnswer, setLastAnswer] = useState<{ choice: WhistleKind; correct: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const [playId, setPlayId] = useState(0);

  const play = (r: Round) => {
    audio.playWhistle(r.pattern);
    setPlayId((p) => p + 1);
  };

  const startRound = (i: number) => {
    const r = createRound(kinds[i]);
    setIndex(i);
    setRound(r);
    setLastAnswer(null);
    setPhase("listen");
    play(r);
  };

  const answer = (choice: WhistleKind) => {
    if (phase !== "listen" || !round) return;
    const correct = choice === round.kind;
    setLastAnswer({ choice, correct });
    if (correct) setScore((s) => s + 1);
    setPhase("feedback");
    onAnswer(correct);
  };

  const next = () => {
    if (index + 1 < kinds.length) startRound(index + 1);
    else setPhase("outro");
  };

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
    const onButton = !!(e.target as HTMLElement | null)?.closest("button");
    const key = e.key.toLowerCase();
    if (phase === "listen") {
      if (key === "1") answer("pajaro");
      else if (key === "2") answer("pombero");
      else if (key === "r" && round) play(round);
      else return;
      e.preventDefault();
    } else if ((key === " " || key === "enter") && !onButton) {
      e.preventDefault();
      if (phase === "intro") startRound(0);
      else if (phase === "feedback") next();
      else if (phase === "outro") onDone();
    } else if (key === "r" && round && phase === "feedback") {
      play(round);
    }
  });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  const panel = "rounded-2xl border-2 border-papel/30 bg-[#140c09]/92 p-5 shadow-2xl";

  if (phase === "intro") {
    return (
      <div className={panel}>
        <h2 className="font-display text-3xl font-bold text-luciernaga">{MINIGAME.title}</h2>
        <p className="mt-2 text-lg leading-relaxed">{MINIGAME.intro}</p>
        <p className="mt-2 text-sm text-papel/80">
          Sin sonido también se puede: mirá la onda y leé el subtítulo. <Kbd>R</Kbd> repite el sonido.
        </p>
        <Button className="mt-4 w-full sm:w-auto" onClick={() => startRound(0)} autoFocus>
          Escuchar el primer silbido ▸
        </Button>
      </div>
    );
  }

  if (phase === "outro") {
    return (
      <div className={panel}>
        <h2 className="font-display text-3xl font-bold text-luciernaga">
          Acertaste {score} de {kinds.length}
        </h2>
        <p className="mt-2 text-lg leading-relaxed italic">
          {score >= MINIGAME.goodThreshold ? MINIGAME.outroGood : MINIGAME.outroBad}
        </p>
        <Button className="mt-4 w-full sm:w-auto" onClick={onDone} autoFocus>
          {MINIGAME.continueLabel} ▸
        </Button>
      </div>
    );
  }

  if (!round) return null;

  return (
    <div className={panel}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-display text-2xl font-bold text-luciernaga sm:text-3xl">{MINIGAME.title}</h2>
        <span className="font-bold tabular-nums text-papel/85">
          Ronda {index + 1}/{kinds.length}
        </span>
      </div>

      <div className="mt-3">
        <WhistleWave pattern={round.pattern} playId={playId} />
        <p className="mt-2 text-center text-lg">
          <span className="sr-only">Subtítulo del sonido: </span>
          <span className="rounded bg-black/60 px-2 py-0.5 font-bold text-papel">[{round.caption}]</span>
        </p>
      </div>

      {phase === "listen" ? (
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <Button onClick={() => answer("pajaro")}>
            <Kbd>1</Kbd> {MINIGAME.labels.pajaro}
          </Button>
          <Button onClick={() => answer("pombero")}>
            <Kbd>2</Kbd> {MINIGAME.labels.pombero}
          </Button>
          <Button variant="secondary" className="col-span-2" onClick={() => play(round)}>
            ↻ Repetir sonido <Kbd>R</Kbd>
          </Button>
        </div>
      ) : (
        <div className="mt-4 animate-rise">
          <p
            role="status"
            className={`rounded-xl px-4 py-3 text-lg font-bold ${
              lastAnswer?.correct ? "bg-[#5fae4f] text-tinta" : "bg-[#d4553a] text-papel"
            }`}
          >
            {lastAnswer?.correct ? MINIGAME.feedback.correct[round.kind] : MINIGAME.feedback.wrong[round.kind]}{" "}
            <span className="whitespace-nowrap">
              ({lastAnswer?.correct ? "+" : "−"}
              {MINIGAME.respectPerAnswer} respeto)
            </span>
          </p>
          <div className="mt-3 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
            <Button variant="secondary" onClick={() => play(round)}>
              ↻ Repetir sonido
            </Button>
            <Button onClick={next} autoFocus>
              {index + 1 < kinds.length ? "Siguiente silbido ▸" : "Terminar ▸"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
