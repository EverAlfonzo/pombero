/**
 * Persistencia en localStorage. Todo va envuelto en try/catch porque el
 * almacenamiento puede no estar disponible (modo privado, cookies bloqueadas).
 */
import type { EndingId } from "./types";

const ENDINGS_KEY = "pombero:finales";
const MUTED_KEY = "pombero:silencio";

export function loadUnlockedEndings(): EndingId[] {
  try {
    const raw = window.localStorage.getItem(ENDINGS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is EndingId => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function saveUnlockedEndings(ids: EndingId[]): void {
  try {
    window.localStorage.setItem(ENDINGS_KEY, JSON.stringify(ids));
  } catch {
    // Sin almacenamiento: el progreso solo dura esta sesión.
  }
}

export function loadMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(MUTED_KEY, muted ? "1" : "0");
  } catch {
    // Ignorar: es solo una preferencia.
  }
}
