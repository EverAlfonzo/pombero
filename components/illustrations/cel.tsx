/**
 * Herramientas de "cel shading" para SVG: contorno de tinta grueso, sombra de
 * borde duro y brillo plano, como en un dibujo animado.
 *
 * Truco del contorno: primero se dibujan todas las formas en tinta con un trazo
 * grueso y después se rellenan encima. Así un grupo de círculos (una copa de
 * árbol, un arbusto) queda con un único contorno exterior.
 */
import { useId } from "react";

export const INK = "#1a120e";
/** Grosor de contorno por defecto (en unidades del lienzo 800 × 500). */
export const INK_W = 3.5;

/** Tríada de colores de cel shading. */
export interface Tone {
  base: string;
  shade: string;
  light: string;
}

/** `useId` devuelve caracteres que no sirven en `url(#…)`: los limpiamos. */
export function useSvgId(prefix = "cel"): string {
  return prefix + useId().replace(/[^a-zA-Z0-9_-]/g, "");
}

export type Circle = readonly [cx: number, cy: number, r: number];

/**
 * Masa de círculos con contorno único, sombra abajo-derecha y brillo
 * arriba-izquierda (luz del sol desde la izquierda).
 */
export function CelBlob({
  circles,
  tone,
  sw = INK_W,
  highlight = true,
  ink = INK,
}: {
  circles: readonly Circle[];
  tone: Tone;
  sw?: number;
  highlight?: boolean;
  ink?: string;
}) {
  const id = useSvgId("blob");
  return (
    <g>
      <defs>
        <clipPath id={id}>
          {circles.map(([x, y, r], i) => (
            <circle key={i} cx={x} cy={y} r={r} />
          ))}
        </clipPath>
      </defs>
      {/* 1. contorno */}
      {circles.map(([x, y, r], i) => (
        <circle key={`o${i}`} cx={x} cy={y} r={r} fill={ink} stroke={ink} strokeWidth={sw * 2} />
      ))}
      {/* 2. sombra (todo el volumen) */}
      {circles.map(([x, y, r], i) => (
        <circle key={`s${i}`} cx={x} cy={y} r={r} fill={tone.shade} />
      ))}
      {/* 3. luz: círculos corridos hacia la luz, recortados al volumen */}
      <g clipPath={`url(#${id})`}>
        {circles.map(([x, y, r], i) => (
          <circle key={`b${i}`} cx={x - r * 0.18} cy={y - r * 0.22} r={r * 0.84} fill={tone.base} />
        ))}
        {highlight &&
          circles.map(([x, y, r], i) =>
            r > 8 ? (
              <ellipse
                key={`h${i}`}
                cx={x - r * 0.4}
                cy={y - r * 0.45}
                rx={r * 0.26}
                ry={r * 0.14}
                fill={tone.light}
                transform={`rotate(-35 ${x - r * 0.4} ${y - r * 0.45})`}
              />
            ) : (
              <circle key={`h${i}`} cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.25} fill={tone.light} />
            ),
          )}
      </g>
    </g>
  );
}

/**
 * Forma libre con contorno y sombreado. `shade` y `light` son caminos extra que
 * se recortan a la forma base (así pueden "pasarse" sin ensuciar el borde).
 */
export function CelPath({
  d,
  tone,
  shade,
  light,
  sw = INK_W,
  ink = INK,
}: {
  d: string;
  tone: Tone;
  shade?: string;
  light?: string;
  sw?: number;
  ink?: string;
}) {
  const id = useSvgId("path");
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <path d={d} />
        </clipPath>
      </defs>
      <path d={d} fill={tone.base} />
      {(shade || light) && (
        <g clipPath={`url(#${id})`}>
          {shade && <path d={shade} fill={tone.shade} />}
          {light && <path d={light} fill={tone.light} />}
        </g>
      )}
      <path d={d} fill="none" stroke={ink} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round" />
    </g>
  );
}

/**
 * Extremidad o rama dibujada como trazo grueso: contorno, color y una franja
 * de sombra corrida hacia la derecha.
 */
export function Limb({
  d,
  w,
  tone,
  sw = INK_W,
  ink = INK,
}: {
  d: string;
  w: number;
  tone: Tone;
  sw?: number;
  ink?: string;
}) {
  const common = { d, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;
  return (
    <g>
      <path {...common} stroke={ink} strokeWidth={w + sw * 2} />
      <path {...common} stroke={tone.base} strokeWidth={w} />
      <path {...common} stroke={tone.shade} strokeWidth={w * 0.42} transform={`translate(${w * 0.27} 0)`} />
    </g>
  );
}

/** Esfera chica (naranja, fruta): círculo con sombra, luz y brillo. */
export function CelBall({ cx, cy, r, tone, sw = INK_W * 0.7 }: { cx: number; cy: number; r: number; tone: Tone; sw?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={tone.shade} />
      <circle cx={cx - r * 0.13} cy={cy - r * 0.13} r={r * 0.8} fill={tone.base} />
      <circle cx={cx - r * 0.38} cy={cy - r * 0.38} r={r * 0.24} fill={tone.light} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={INK} strokeWidth={sw} />
    </g>
  );
}
