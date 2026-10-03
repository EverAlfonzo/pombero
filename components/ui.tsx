/** Piezas de interfaz compartidas: botones grandes y de alto contraste. */
import { SpeakerOffIcon, SpeakerOnIcon } from "./illustrations/icons";

type Variant = "primary" | "secondary" | "ghost";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-ocre text-tinta border-ocre-claro hover:bg-ocre-claro active:translate-y-px shadow-[0_4px_0_#7a5418]",
  secondary:
    "bg-tinta/85 text-papel border-papel/60 hover:bg-tinta hover:border-papel active:translate-y-px",
  ghost: "bg-transparent text-papel border-transparent hover:bg-papel/10",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`min-h-12 rounded-xl border-2 px-5 py-3 text-lg font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}

export function SoundToggle({ muted, onToggle }: { muted: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={!muted}
      aria-label={muted ? "Activar sonido" : "Silenciar sonido"}
      title={muted ? "Sonido apagado" : "Sonido encendido"}
      className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-papel/60 bg-tinta/80 text-papel hover:border-papel"
    >
      {muted ? <SpeakerOffIcon className="h-6 w-6" /> : <SpeakerOnIcon className="h-6 w-6" />}
    </button>
  );
}

/** Teclas visibles en las ayudas (1, 2, Espacio…). */
export function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex min-w-7 items-center justify-center rounded-md border border-papel/50 bg-papel/10 px-1.5 font-body text-sm font-bold">
      {children}
    </kbd>
  );
}
