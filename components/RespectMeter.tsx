"use client";

/**
 * Medidor "Respeto al monte": una pluma que se llena de 0 a 100.
 * Cada cambio anima la pluma (late si sube, tiembla si baja), llena o vacía
 * el relleno con una transición y hace flotar
 * el número (+10 / −20).
 */
import { useEffect, useRef } from "react";
import { RESPECT } from "@/data/story";
import type { RespectChange } from "@/lib/gameReducer";

const FEATHER = "M20 2 C34 16 36 48 20 74 C4 48 6 16 20 2 Z";
const TOP = 2;
const HEIGHT = 72;

function fillColor(value: number) {
  if (value >= RESPECT.high) return "#5fae4f";
  if (value >= RESPECT.low) return "#e7b247";
  return "#d4553a";
}

export default function RespectMeter({ value, change }: { value: number; change: RespectChange | null }) {
  const offset = ((RESPECT.max - value) / (RESPECT.max - RESPECT.min)) * HEIGHT;
  const up = (change?.delta ?? 0) > 0;
  const featherRef = useRef<SVGSVGElement>(null);

  // Anima la pluma con Web Animations (sin remontar el SVG, así el relleno
  // también hace su transición suave).
  useEffect(() => {
    const el = featherRef.current;
    if (!change || !el || typeof el.animate !== "function") return;
    const frames =
      change.delta > 0
        ? [
            { transform: "rotate(-12deg) scale(1)" },
            { transform: "rotate(-4deg) scale(1.25)", offset: 0.4 },
            { transform: "rotate(-12deg) scale(1)" },
          ]
        : [
            { transform: "rotate(-12deg)" },
            { transform: "rotate(-24deg)", offset: 0.2 },
            { transform: "rotate(0deg)", offset: 0.4 },
            { transform: "rotate(-20deg)", offset: 0.6 },
            { transform: "rotate(-6deg)", offset: 0.8 },
            { transform: "rotate(-12deg)" },
          ];
    el.animate(frames, { duration: 700, easing: "ease-out" });
  }, [change]);

  return (
    <div className="comic-shadow relative flex items-center gap-2 rounded-full border-[3px] border-tinta bg-papel py-1 pr-3 pl-2 text-tinta">
      <svg
        ref={featherRef}
        viewBox="0 0 40 80"
        className="h-10 w-6 shrink-0"
        style={{ transform: "rotate(-12deg)" }}
        aria-hidden="true"
      >
        <defs>
          <clipPath id="feather-clip">
            <path d={FEATHER} />
          </clipPath>
        </defs>
        <path d={FEATHER} fill="#3a2a22" />
        <g clipPath="url(#feather-clip)">
          <rect
            x="0"
            y={TOP}
            width="40"
            height={HEIGHT + 4}
            fill={fillColor(value)}
            style={{ transform: `translateY(${offset}px)`, transition: "transform 0.8s ease-out, fill 0.8s" }}
          />
        </g>
        <path d={FEATHER} fill="none" stroke="#1d1410" strokeWidth="3" />
        <path d="M20 10 V78" stroke="#1d1410" strokeWidth="2" />
      </svg>
      <div className="leading-tight">
        <div className="hidden text-[0.7rem] font-bold tracking-wide text-tinta/75 uppercase sm:block">
          Respeto al monte
        </div>
        <div className="text-lg font-bold tabular-nums">
          {value}
          <span className="text-sm font-normal text-tinta/60">/100</span>
        </div>
      </div>

      {change && (
        <span
          key={`delta-${change.id}`}
          className={`pointer-events-none absolute -top-3 left-1/2 rounded-full border-2 border-tinta px-2 text-base font-bold ${
            up ? "bg-[#5fae4f] text-tinta" : "bg-[#d4553a] text-papel"
          }`}
          style={{ animation: "float-delta 1.6s ease-out forwards" }}
          aria-hidden="true"
        >
          {up ? `+${change.delta}` : `−${Math.abs(change.delta)}`}
        </span>
      )}

      <span className="sr-only" role="status" aria-live="polite">
        {change
          ? `Respeto al monte ${up ? "sube" : "baja"} ${Math.abs(change.delta)}. Ahora: ${value} de 100.`
          : `Respeto al monte: ${value} de 100.`}
      </span>
    </div>
  );
}
