/** Pantalla de inicio. */
import { ENDING_ORDER, GAME_SUBTITLE, GAME_TITLE } from "@/data/story";
import SceneBackground from "./illustrations/SceneBackground";
import { Button, SoundToggle } from "./ui";

interface Props {
  unlockedCount: number;
  muted: boolean;
  onToggleMute: () => void;
  onPlay: () => void;
  onHowTo: () => void;
  onGallery: () => void;
}

export default function TitleScreen({ unlockedCount, muted, onToggleMute, onPlay, onHowTo, onGallery }: Props) {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <SceneBackground id="titulo" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/85" />

      <div className="absolute top-3 right-3 z-10">
        <SoundToggle muted={muted} onToggle={onToggleMute} />
      </div>

      <header className="relative z-10 mx-auto mt-14 w-full max-w-2xl animate-fade-in px-4 text-center sm:mt-20">
        <p className="text-sm font-bold tracking-[0.3em] text-ocre-claro uppercase drop-shadow">
          {GAME_SUBTITLE}
        </p>
        <h1 className="mt-2 font-display text-6xl leading-[0.95] font-bold text-papel drop-shadow-[0_4px_0_rgba(110,42,27,0.9)] sm:text-8xl">
          {GAME_TITLE}
        </h1>
      </header>

      <div className="flex-1" />

      <nav
        className="relative z-10 mx-auto flex w-full max-w-sm animate-rise flex-col gap-3 px-4 pb-10"
        aria-label="Menú principal"
      >
        <Button onClick={onPlay} className="text-2xl" autoFocus>
          Jugar
        </Button>
        <Button variant="secondary" onClick={onHowTo}>
          Cómo jugar
        </Button>
        <Button variant="secondary" onClick={onGallery}>
          Finales ({unlockedCount}/{ENDING_ORDER.length})
        </Button>
        <p className="mt-2 text-center text-sm text-papel/80">
          Basado en el mito paraguayo del Pombero · Con sonido es mejor
        </p>
      </nav>
    </main>
  );
}
