"use client";

/**
 * Marco de una escena: fondo ilustrado a pantalla completa, barra superior
 * (escena, ofrendas, respeto, sonido, menú) y un espacio inferior para la
 * caja de diálogo, las opciones, la cocina o el minijuego.
 */
import type { BackgroundId, HonditaState, OfferingId, TitoPose } from "@/lib/types";
import type { RespectChange } from "@/lib/gameReducer";
import SceneBackground from "./illustrations/SceneBackground";
import Tito from "./illustrations/Tito";
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
  /** Tito en tercera persona (de espaldas). */
  tito: { pose: TitoPose; hondita: HonditaState };
  /** Si es false, Tito solo se muestra en pantallas medianas o grandes. */
  titoOnMobile: boolean;
  children: React.ReactNode;
}

/**
 * Iluminación de Tito según el fondo: de noche se oscurece y le pega un borde
 * de luz de luna (rim light); en el monte cerrado queda en penumbra.
 */
function titoLighting(background: BackgroundId): string | undefined {
  if (background.startsWith("claro") || background === "naranjal-luna" || background === "oscuridad") {
    return "brightness(0.62) saturate(0.7) drop-shadow(-3px -2px 0 rgba(130, 160, 240, 0.6))";
  }
  if (background === "monte") return "brightness(0.85) saturate(0.9) drop-shadow(-2px -2px 0 rgba(255, 244, 194, 0.35))";
  return undefined;
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
  tito,
  titoOnMobile,
  children,
}: Props) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <SceneBackground id={background} />
      {/* Degradados para asegurar contraste del texto. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      <header className="relative z-10 flex flex-wrap items-center justify-between gap-2 p-3 sm:p-4">
        <div
          key={transitionKey}
          className="comic-shadow animate-fade-in -rotate-1 rounded-xl border-[3px] border-tinta bg-papel px-3 py-1.5 text-tinta"
        >
          <div className="text-xs font-bold tracking-widest text-tierra uppercase">
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
            className="comic-shadow comic-press h-11 rounded-full border-[3px] border-tinta bg-papel px-3 text-sm font-bold text-tinta hover:bg-ocre-claro"
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
        {/* Tito de espaldas, parado detrás de la caja de texto: cámara en tercera persona. */}
        <div
          className={`pointer-events-none absolute bottom-[calc(100%-1.75rem)] left-1 h-48 w-32 sm:bottom-[calc(100%-3rem)] sm:left-0 sm:h-72 lg:-left-28 sm:w-48 ${
            titoOnMobile ? "" : "hidden sm:block"
          }`}
          style={{ filter: titoLighting(background) }}
        >
          <Tito pose={tito.pose} hondita={tito.hondita} />
        </div>
        <div className="relative">{children}</div>
      </section>
    </main>
  );
}
