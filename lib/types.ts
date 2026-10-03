/**
 * Tipos compartidos del juego. El contenido narrativo vive en /data/story.ts
 * y usa estos tipos para que el editor tenga autocompletado y validación.
 */

/** Identificadores de escenas jugables. */
export type SceneId = "siesta" | "pitogue" | "senales" | "claro";

/** Identificadores de finales. */
export type EndingId = "aguyje" | "vueltas" | "nombra" | "siesta";

/** Ofrendas que se pueden llevar desde la cocina. */
export type OfferingId = "miel" | "huevo" | "naco";

/** Personajes que pueden hablar. Si una línea no tiene `speaker`, es narración. */
export type SpeakerId = "chela" | "tito" | "pombero";

/** Fondos ilustrados disponibles (ver components/illustrations/SceneBackground.tsx). */
export type BackgroundId =
  | "titulo"
  | "rancho"
  | "rancho-siesta"
  | "naranjal"
  | "naranjal-vacio"
  | "naranjal-luna"
  | "monte"
  | "claro"
  | "claro-ojos"
  | "claro-vacio"
  | "amanecer"
  | "oscuridad";

/** Ambientes sonoros sintetizados (ver lib/audio.ts). */
export type AmbientId = "day" | "forest" | "night" | "silence";

/** Efectos de sonido que una línea puede disparar al aparecer. */
export type SfxId = "pitogue" | "hondita" | "silbido-tito" | "silbido-pombero" | "muchos-silbidos";

/** Una línea de diálogo o narración. */
export interface Line {
  speaker?: SpeakerId;
  /** Texto. Admite el marcador {ofrendas} (p. ej. "la miel y el naco"). */
  text: string;
  /** Cambia el fondo a partir de esta línea. */
  background?: BackgroundId;
  /** Cambia el ambiente sonoro a partir de esta línea. */
  ambient?: AmbientId;
  /** Sonido que se reproduce cuando aparece la línea. */
  sfx?: SfxId;
}

/** Adónde lleva una opción (o el final de una escena sin opciones). */
export type Goto =
  | { type: "scene"; scene: SceneId }
  | { type: "offerings"; then: SceneId }
  | { type: "minigame"; then: SceneId }
  | { type: "ending"; ending: EndingId }
  | { type: "computeEnding" };

export interface Choice {
  id: string;
  label: string;
  /** Cambio en el medidor "Respeto al monte". */
  respect?: number;
  /** Solo se muestra si el inventario tiene al menos una ofrenda. */
  requiresOffering?: boolean;
  /** Entrega todas las ofrendas y marca `ofrendaEntregada`. */
  givesOffering?: boolean;
  /** Líneas que se muestran como consecuencia antes de seguir. */
  outcome?: Line[];
  goto: Goto;
}

export interface Scene {
  id: SceneId;
  number: number;
  title: string;
  /** Hora o momento del día que se muestra en la cabecera. */
  time: string;
  background: BackgroundId;
  ambient: AmbientId;
  lines: Line[];
  /** Opciones al terminar las líneas (2 a 4). */
  choices?: Choice[];
  /** Si no hay opciones, adónde se va al terminar las líneas. */
  after?: Goto;
}

export interface Ending {
  id: EndingId;
  title: string;
  /** "Final secreto" se muestra distinto en la pantalla y la galería. */
  secret?: boolean;
  tone: "good" | "neutral" | "bad" | "secret";
  background: BackgroundId;
  ambient: AmbientId;
  /** Párrafos de cierre. Admite {ofrendas}. */
  paragraphs: string[];
  /** Resumen breve que aparece en la galería una vez desbloqueado. */
  summary: string;
}

export interface Offering {
  id: OfferingId;
  name: string;
  /** Con artículo, para armar frases: "la miel". */
  withArticle: string;
  description: string;
}

/** Tipos de sonido del minijuego. */
export type WhistleKind = "pajaro" | "pombero";
