"use client";

/**
 * Marco de una escena: fondo ilustrado a pantalla completa, barra superior
 * (escena, ofrendas, respeto, sonido, menú) y un espacio inferior para la
 * caja de diálogo, las opciones, la cocina o el minijuego.
 */
import type { BackgroundId, OfferingId } from "@/lib/types";
import type { RespectChange } from "@/lib/gameReducer";
import SceneBackground from "./illustrations/SceneBackground";
import Inventory from "./Inventory";
import RespectMeter from "./RespectMeter";
import { SoundToggle } from "./ui";

interface Props {
  background: BackgroundId;
  sceneNumber: number;
  sceneTitle: string;
  time: string;
  respect: number;
  respectChange: RespectChange | null;
  inventory: OfferingId[];
  muted: boolean;
  onToggleMute: () => void;
  onMenu: () => void;
  /** Cambia en cada escena para disparar el fundido. */
  transitionKey: string;
  children: React.ReactNode;
}

export default function SceneView({
  background,
  sceneNumber,
  sceneTitle,
  time,
  respect,
  respectChange,
  inventory,
  muted,
  onToggleMute,
  onMenu,
  transitionKey,
  children,
}: Props) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <SceneBackground id={background} />
      {/* Degradados para asegurar contraste del texto. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <header className="relative z-10 flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4">
        <div key={transitionKey} className="animate-fade-in rounded-xl bg-tinta/85 px-3 py-1.5">
          <div className="text-xs font-bold tracking-widest text-ocre-claro uppercase">
            Escena {sceneNumber} · {time}
          </div>
          <h1 className="font-display text-2xl leading-none font-bold sm:text-3xl">{sceneTitle}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Inventory items={inventory} />
          <RespectMeter value={respect} change={respectChange} />
          <SoundToggle muted={muted} onToggle={onToggleMute} />
          <button
            type="button"
            onClick={onMenu}
            className="h-11 rounded-full border-2 border-papel/60 bg-tinta/80 px-3 text-sm font-bold hover:border-papel"
          >
            Menú
          </button>
        </div>
      </header>

      <div className="flex-1" />

      <section
        key={transitionKey}
        className="relative z-10 mx-auto w-full max-w-3xl animate-fade-in px-3 pb-4 sm:px-4 sm:pb-8"
      >
        {children}
      </section>
    </main>
  );
}
