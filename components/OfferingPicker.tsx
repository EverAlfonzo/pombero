"use client";

/**
 * La cocina: elegir hasta 2 ofrendas (miel, huevo, naco).
 * Teclado: 1–3 marcan/desmarcan, Enter confirma.
 */
import { useEffect, useEffectEvent, useState } from "react";
import { MAX_OFFERINGS, OFFERINGS, OFFERINGS_TEXT } from "@/data/story";
import type { OfferingId } from "@/lib/types";
import { OFFERING_ICONS } from "./illustrations/icons";
import { Button, Kbd } from "./ui";

const IDS = Object.keys(OFFERINGS) as OfferingId[];

export default function OfferingPicker({ onConfirm }: { onConfirm: (items: OfferingId[]) => void }) {
  const [selected, setSelected] = useState<OfferingId[]>([]);
  const full = selected.length >= MAX_OFFERINGS;

  const toggle = (id: OfferingId) => {
    setSelected((cur) => {
      if (cur.includes(id)) return cur.filter((x) => x !== id);
      if (cur.length >= MAX_OFFERINGS) return cur;
      return [...cur, id];
    });
  };

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
    const n = Number.parseInt(e.key, 10);
    if (n >= 1 && n <= IDS.length) {
      e.preventDefault();
      toggle(IDS[n - 1]);
    } else if (e.key === "Enter" && !(e.target as HTMLElement | null)?.closest("button")) {
      e.preventDefault();
      onConfirm(selected);
    }
  });

  useEffect(() => {
    const listener = (e: KeyboardEvent) => onKey(e);
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  return (
    <div className="rounded-2xl border-2 border-papel/30 bg-[#140c09]/92 p-5 shadow-2xl">
      <h2 className="font-display text-3xl font-bold text-ocre-claro">{OFFERINGS_TEXT.title}</h2>
      <p className="mt-2 text-lg leading-relaxed">{OFFERINGS_TEXT.intro}</p>
      <p className="mt-2 font-bold text-ocre-claro" aria-live="polite">
        {OFFERINGS_TEXT.hint} ({selected.length}/{MAX_OFFERINGS})
      </p>

      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3" role="group" aria-label="Ofrendas">
        {IDS.map((id, i) => {
          const o = OFFERINGS[id];
          const Icon = OFFERING_ICONS[id];
          const isOn = selected.includes(id);
          const disabled = !isOn && full;
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              aria-pressed={isOn}
              disabled={disabled}
              className={`flex items-center gap-3 rounded-xl border-2 p-3 text-left transition-colors sm:flex-col sm:text-center ${
                isOn
                  ? "border-ocre bg-ocre/20"
                  : "border-papel/40 bg-tinta/80 hover:border-papel disabled:opacity-45"
              }`}
            >
              <Icon className="h-12 w-12 shrink-0" />
              <span>
                <span className="flex items-center gap-2 text-lg font-bold sm:justify-center">
                  <Kbd>{i + 1}</Kbd> {o.name} {isOn && <span aria-hidden="true">✓</span>}
                </span>
                <span className="block text-sm text-papel/85">{o.description}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={() => onConfirm(selected)} className="w-full sm:w-auto">
          {OFFERINGS_TEXT.confirm} ▸
        </Button>
      </div>
    </div>
  );
}
