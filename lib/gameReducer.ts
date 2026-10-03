/**
 * Máquina de estados del juego (useReducer).
 *
 * Pantallas:
 *   title ─┬─> scene ─┬─> scene …
 *          │          ├─> offerings ─> scene
 *          │          ├─> minigame  ─> scene
 *          │          └─> ending
 *          ├─> howto
 *          └─> gallery
 *
 * Dentro de "scene" hay dos fases: "lines" (texto letra por letra) y
 * "choices" (opciones). Las consecuencias de una opción se muestran como
 * nuevas líneas antes de seguir al destino (`afterQueue`).
 */
import {
  ENDINGS,
  FIRST_SCENE,
  MAX_OFFERINGS,
  MINIGAME,
  OFFERINGS,
  RESPECT,
  SCENES,
  computeEnding,
} from "@/data/story";
import type { EndingId, Goto, Line, OfferingId, SceneId } from "./types";

export type Screen = "title" | "howto" | "gallery" | "scene" | "offerings" | "minigame" | "ending";

export interface RespectChange {
  delta: number;
  /** Identificador incremental para reiniciar la animación aunque el delta se repita. */
  id: number;
}

export interface GameState {
  screen: Screen;
  /** Se incrementa en cada partida nueva (sirve como `key` de React). */
  runId: number;
  sceneId: SceneId;
  phase: "lines" | "choices";
  queue: Line[];
  lineIndex: number;
  /** Destino cuando termina la cola de líneas; `null` = mostrar opciones. */
  afterQueue: Goto | null;
  /** Escena a la que se va después de las ofrendas o del minijuego. */
  pendingScene: SceneId;
  respect: number;
  respectChange: RespectChange | null;
  inventory: OfferingId[];
  givenOfferings: OfferingId[];
  ofrendaEntregada: boolean;
  endingId: EndingId | null;
  /** Finales desbloqueados (se persisten en localStorage). */
  unlocked: EndingId[];
  /** true si el final actual se desbloqueó por primera vez en esta partida. */
  newEnding: boolean;
  /** Sonido apagado (preferencia guardada). */
  muted: boolean;
  /** true cuando ya se leyó localStorage (evita pisar datos guardados). */
  hydrated: boolean;
}

export type GameAction =
  | { type: "START" }
  | { type: "GO_TITLE" }
  | { type: "SHOW_HOWTO" }
  | { type: "SHOW_GALLERY" }
  | { type: "ADVANCE" }
  | { type: "CHOOSE"; choiceId: string }
  | { type: "CONFIRM_OFFERINGS"; items: OfferingId[] }
  | { type: "MINIGAME_ANSWER"; correct: boolean }
  | { type: "MINIGAME_DONE" }
  | { type: "TOGGLE_MUTE" }
  | { type: "HYDRATE"; ids: EndingId[]; muted: boolean };

export const initialState: GameState = {
  screen: "title",
  runId: 0,
  sceneId: FIRST_SCENE,
  phase: "lines",
  queue: [],
  lineIndex: 0,
  afterQueue: null,
  pendingScene: FIRST_SCENE,
  respect: RESPECT.initial,
  respectChange: null,
  inventory: [],
  givenOfferings: [],
  ofrendaEntregada: false,
  endingId: null,
  unlocked: [],
  newEnding: false,
  muted: false,
  hydrated: false,
};

const clamp = (n: number) => Math.max(RESPECT.min, Math.min(RESPECT.max, n));

/** Aplica un cambio de respeto y registra el delta para animarlo. */
function applyRespect(state: GameState, delta: number | undefined): GameState {
  if (!delta) return state;
  return {
    ...state,
    respect: clamp(state.respect + delta),
    respectChange: { delta, id: (state.respectChange?.id ?? 0) + 1 },
  };
}

/** Entra a una escena: carga sus líneas y define qué pasa al terminar. */
function enterScene(state: GameState, sceneId: SceneId): GameState {
  const scene = SCENES[sceneId];
  return {
    ...state,
    screen: "scene",
    sceneId,
    phase: "lines",
    queue: scene.lines,
    lineIndex: 0,
    afterQueue: scene.choices?.length ? null : (scene.after ?? null),
  };
}

function reachEnding(state: GameState, endingId: EndingId): GameState {
  const isNew = !state.unlocked.includes(endingId);
  return {
    ...state,
    screen: "ending",
    endingId,
    newEnding: isNew,
    unlocked: isNew ? [...state.unlocked, endingId] : state.unlocked,
  };
}

/** Resuelve un destino (`Goto`) y devuelve el nuevo estado. */
function navigate(state: GameState, goto: Goto): GameState {
  switch (goto.type) {
    case "scene":
      return enterScene(state, goto.scene);
    case "offerings":
      return { ...state, screen: "offerings", pendingScene: goto.then };
    case "minigame":
      return { ...state, screen: "minigame", pendingScene: goto.then };
    case "ending":
      return reachEnding(state, goto.ending);
    case "computeEnding":
      return reachEnding(state, computeEnding(state.respect, state.ofrendaEntregada));
  }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START":
      // Partida nueva: se conservan solo los finales desbloqueados.
      return enterScene(
        {
          ...initialState,
          unlocked: state.unlocked,
          muted: state.muted,
          hydrated: state.hydrated,
          runId: state.runId + 1,
        },
        FIRST_SCENE,
      );

    case "GO_TITLE":
      return { ...state, screen: "title" };

    case "SHOW_HOWTO":
      return { ...state, screen: "howto" };

    case "SHOW_GALLERY":
      return { ...state, screen: "gallery" };

    case "ADVANCE": {
      if (state.screen !== "scene" || state.phase !== "lines") return state;
      if (state.lineIndex < state.queue.length - 1) {
        return { ...state, lineIndex: state.lineIndex + 1 };
      }
      // Fin de la cola: opciones o destino pendiente.
      if (state.afterQueue === null) return { ...state, phase: "choices" };
      return navigate(state, state.afterQueue);
    }

    case "CHOOSE": {
      if (state.screen !== "scene" || state.phase !== "choices") return state;
      const choice = SCENES[state.sceneId].choices?.find((c) => c.id === action.choiceId);
      if (!choice) return state;
      if (choice.requiresOffering && state.inventory.length === 0) return state;

      let next = applyRespect(state, choice.respect);
      if (choice.givesOffering) {
        next = {
          ...next,
          ofrendaEntregada: true,
          givenOfferings: next.inventory,
          inventory: [],
        };
      }
      if (choice.outcome?.length) {
        // Mostrar la consecuencia y después ir al destino.
        return { ...next, phase: "lines", queue: choice.outcome, lineIndex: 0, afterQueue: choice.goto };
      }
      return navigate(next, choice.goto);
    }

    case "CONFIRM_OFFERINGS": {
      if (state.screen !== "offerings") return state;
      const items = [...new Set(action.items)]
        .filter((id) => id in OFFERINGS)
        .slice(0, MAX_OFFERINGS);
      return enterScene({ ...state, inventory: items }, state.pendingScene);
    }

    case "MINIGAME_ANSWER":
      if (state.screen !== "minigame") return state;
      return applyRespect(
        state,
        action.correct ? MINIGAME.respectPerAnswer : -MINIGAME.respectPerAnswer,
      );

    case "MINIGAME_DONE":
      if (state.screen !== "minigame") return state;
      return enterScene(state, state.pendingScene);

    case "TOGGLE_MUTE":
      return { ...state, muted: !state.muted };

    case "HYDRATE": {
      const merged = [...new Set([...state.unlocked, ...action.ids])].filter(
        (id): id is EndingId => id in ENDINGS,
      );
      return { ...state, unlocked: merged, muted: action.muted, hydrated: true };
    }
  }
}

/** Reemplaza {ofrendas} por la lista de ofrendas con artículo. */
export function formatText(text: string, state: Pick<GameState, "inventory" | "givenOfferings">): string {
  if (!text.includes("{ofrendas}")) return text;
  const items = state.givenOfferings.length ? state.givenOfferings : state.inventory;
  const names = items.map((id) => OFFERINGS[id].withArticle);
  const list =
    names.length === 0
      ? "algo"
      : names.length === 1
        ? names[0]
        : `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
  return text.replaceAll("{ofrendas}", list);
}
