/**
 * Tito en tercera persona: lo vemos de espaldas, como la cámara de un juego,
 * mirando hacia la escena. Mismo estilo cel shading que los fondos.
 *
 * Lienzo propio de 200 × 300 (los pies tocan y ≈ 290).
 */
import type { HonditaState, TitoPose } from "@/lib/types";
import { CelBlob, CelPath, INK, Limb, type Tone } from "./cel";

const SKIN: Tone = { base: "#c07a4c", shade: "#8e5333", light: "#e09c6e" };
const HAIR: Tone = { base: "#2e1d13", shade: "#170e09", light: "#6a4630" };
const TANK: Tone = { base: "#f3ecda", shade: "#c9bea4", light: "#ffffff" };
const SHORTS: Tone = { base: "#3f6198", shade: "#2a4470", light: "#6688c0" };
const WOOD: Tone = { base: "#8b5a2b", shade: "#5e3a17", light: "#b07a46" };
const SW = 3.5;

interface PoseDef {
  /** Brazos izquierdo y derecho: hombro → codo → mano. */
  left: string;
  right: string;
  /** true si las manos quedan delante del cuerpo (tapadas por la espalda). */
  armsBehind?: boolean;
  /** Corrimiento y giro de la cabeza (mirar arriba, agacharse). */
  head?: { dy?: number; rot?: number };
  /** Hombros encogidos. */
  shrug?: number;
}

const POSES: Record<TitoPose, PoseDef> = {
  idle: { left: "M74 128 Q64 164 68 198", right: "M126 128 Q136 164 132 198" },
  walk: { left: "M74 128 Q62 162 62 194", right: "M126 128 Q140 160 140 192" },
  aim: { left: "M74 128 Q56 100 70 64", right: "M126 128 Q144 108 120 92", head: { dy: -2, rot: -4 } },
  whistle: { left: "M74 128 Q64 164 68 198", right: "M126 128 Q150 116 134 94", head: { dy: -3, rot: 8 } },
  scared: { left: "M74 132 Q66 154 86 146", right: "M126 132 Q134 154 114 146", armsBehind: true, head: { dy: 6 }, shrug: 6 },
  sleepy: { left: "M74 128 Q58 92 74 50", right: "M126 128 Q142 92 126 50", head: { dy: 2, rot: -6 } },
  shout: { left: "M74 128 Q50 110 68 84", right: "M126 128 Q150 110 132 84", head: { dy: -4 } },
  bow: { left: "M74 130 Q70 166 90 188", right: "M126 130 Q130 166 110 188", armsBehind: true, head: { dy: 12 } },
  offer: { left: "M74 128 Q66 88 90 52", right: "M126 128 Q134 88 110 52", head: { dy: -3 } },
};

/** Hondita: horqueta de madera con la goma roja. */
function Hondita({ x, y, rot = 0, band = true }: { x: number; y: number; rot?: number; band?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <Limb d="M0 0 L0 -18" w={5} tone={WOOD} sw={2} />
      <Limb d="M0 -16 L-8 -30 M0 -16 L8 -30" w={4} tone={WOOD} sw={2} />
      {band && <path d="M-8 -30 Q0 -22 8 -30" stroke="#c0392b" strokeWidth={2.2} fill="none" />}
    </g>
  );
}

function Arm({ d }: { d: string }) {
  // La mano es el último punto del camino.
  const nums = d.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
  const hx = nums[nums.length - 2];
  const hy = nums[nums.length - 1];
  return (
    <g>
      <Limb d={d} w={13} tone={SKIN} sw={SW} />
      <circle cx={hx} cy={hy} r={8} fill={SKIN.base} stroke={INK} strokeWidth={SW} />
      <path d={`M${hx + 1} ${hy - 7} A8 8 0 0 1 ${hx + 1} ${hy + 7} Z`} fill={SKIN.shade} />
    </g>
  );
}

/** Pequeñas marcas de cómic según la pose. */
function PoseFx({ pose }: { pose: TitoPose }) {
  switch (pose) {
    case "whistle":
      return (
        <g className="tito-notes" fill="#ffe55c" stroke={INK} strokeWidth={2}>
          <path d="M150 60 l0 -22 l12 -4 l0 20" fill="none" strokeWidth={3} stroke={INK} />
          <ellipse cx={146} cy={61} rx={6} ry={4.5} />
          <ellipse cx={158} cy={55} rx={6} ry={4.5} />
          <path d="M172 34 l0 -16" fill="none" strokeWidth={3} />
          <ellipse cx={168} cy={35} rx={5.5} ry={4} />
        </g>
      );
    case "scared":
      return (
        <g fill="#bfe6ff" stroke={INK} strokeWidth={2}>
          <path d="M146 54 q6 10 0 14 q-6 -4 0 -14 Z" />
          <path d="M54 66 q5 8 0 11 q-5 -3 0 -11 Z" />
          <path d="M60 30 l-8 -10 M100 22 l0 -14 M140 30 l8 -10" stroke={INK} strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    case "sleepy":
      return (
        <g className="tito-notes" fontFamily="var(--font-display), serif" fontWeight={700} fill="#fbf6ea" stroke={INK} strokeWidth={1.5}>
          <text x={140} y={40} fontSize={22}>z</text>
          <text x={156} y={22} fontSize={28}>Z</text>
        </g>
      );
    case "shout":
      return (
        <g stroke={INK} strokeWidth={4} strokeLinecap="round">
          <path d="M100 20 l0 -16 M70 26 l-8 -12 M130 26 l8 -12 M50 44 l-12 -6 M150 44 l12 -6" />
          <path d="M100 20 l0 -16 M70 26 l-8 -12 M130 26 l8 -12 M50 44 l-12 -6 M150 44 l12 -6" stroke="#ffe55c" strokeWidth={2} />
        </g>
      );
    case "offer":
      // Un frasquito de miel en alto.
      return (
        <g>
          <rect x={92} y={22} width={16} height={6} rx={2} fill="#8a5a2b" stroke={INK} strokeWidth={2} />
          <path d="M90 28 H110 C113 34 113 46 108 50 H92 C87 46 87 34 90 28 Z" fill="#e8a317" stroke={INK} strokeWidth={2.5} />
          <path d="M102 30 H108 C110 36 110 44 106 48 H102 Z" fill="#c4840e" />
          <circle cx={95} cy={34} r={2} fill="#ffe7a6" />
        </g>
      );
    default:
      return null;
  }
}

export default function Tito({ pose, hondita }: { pose: TitoPose; hondita: HonditaState }) {
  const p = POSES[pose];
  const headDy = p.head?.dy ?? 0;
  const headRot = p.head?.rot ?? 0;
  const shrug = p.shrug ?? 0;
  const holdsInHand = hondita === "hand";

  const arms = (
    <>
      <Arm d={p.left} />
      <Arm d={p.right} />
    </>
  );

  return (
    <svg viewBox="0 0 200 300" className="h-full w-full overflow-visible" aria-hidden="true" focusable="false">
      <g className={`tito tito-${pose}`}>
        {/* sombra en el suelo */}
        <ellipse cx={100} cy={290} rx={52} ry={9} fill="#000" opacity={0.3} />

        {/* piernas y talones (descalzo) */}
        <Limb d={pose === "walk" ? "M88 232 L80 280" : "M88 232 L85 280"} w={17} tone={SKIN} sw={SW} />
        <Limb d={pose === "walk" ? "M112 232 L118 276" : "M112 232 L115 280"} w={17} tone={SKIN} sw={SW} />
        <ellipse cx={pose === "walk" ? 80 : 85} cy={286} rx={11} ry={6} fill="#d9a07a" stroke={INK} strokeWidth={SW} />
        <ellipse cx={pose === "walk" ? 118 : 115} cy={pose === "walk" ? 282 : 286} rx={11} ry={6} fill="#d9a07a" stroke={INK} strokeWidth={SW} />

        {p.armsBehind && arms}

        {/* cuello y nuca */}
        <Limb d={`M100 ${104 + shrug} L100 122`} w={18} tone={SKIN} sw={SW} />

        {/* musculosa */}
        <g transform={`translate(0 ${shrug * 0.4})`}>
          <CelPath
            d="M70 124 Q84 116 90 118 Q100 128 110 118 Q116 116 130 124 Q134 160 128 200 L72 200 Q66 160 70 124 Z"
            tone={TANK}
            shade="M108 112 L140 120 L140 206 L112 206 Q118 160 108 112 Z"
            light="M76 130 Q80 128 84 130 L80 170 L76 168 Z"
            sw={SW}
          />
          <path d="M72 186 Q100 192 128 186" stroke="#c8392b" strokeWidth={4} fill="none" />
        </g>

        {/* short de jean con bolsillos */}
        <CelPath
          d="M72 194 L128 194 L132 238 L104 240 L100 224 L96 240 L68 238 Z"
          tone={SHORTS}
          shade="M106 190 L136 190 L136 244 L104 244 L100 224 Z"
          light="M76 198 L84 198 L80 226 L74 226 Z"
          sw={SW}
        />
        <path d="M78 204 L94 204 L93 218 L79 218 Z M106 204 L122 204 L121 218 L107 218 Z" fill="none" stroke={INK} strokeWidth={1.8} />

        {/* hondita en el bolsillo de atrás */}
        {hondita === "pocket" && <Hondita x={114} y={210} rot={12} />}

        {!p.armsBehind && arms}

        {/* hondita en la mano */}
        {holdsInHand && pose === "aim" && (
          <>
            <Hondita x={70} y={60} band={false} />
            <path d="M62 30 L118 88 L78 30" stroke="#c0392b" strokeWidth={2.4} fill="none" strokeLinejoin="round" />
          </>
        )}
        {holdsInHand && pose !== "aim" && <Hondita x={134} y={204} rot={175} />}

        {/* cabeza: de espaldas solo se ven el pelo y las orejas */}
        <g transform={`translate(0 ${headDy + shrug}) rotate(${headRot} 100 100)`}>
          <ellipse cx={64} cy={84} rx={8} ry={11} fill={SKIN.base} stroke={INK} strokeWidth={SW} />
          <ellipse cx={136} cy={84} rx={8} ry={11} fill={SKIN.shade} stroke={INK} strokeWidth={SW} />
          <path d="M63 80 q3 4 0 8" stroke={SKIN.shade} strokeWidth={2.5} fill="none" />
          <CelBlob
            circles={[
              [100, 78, 36],
              [82, 50, 14],
              [100, 44, 15],
              [118, 50, 14],
              [72, 66, 12],
              [128, 66, 12],
            ]}
            tone={HAIR}
            sw={SW}
          />
          {/* remolino y mechones */}
          <path d="M98 64 q8 -2 6 6 q-4 4 -8 0" stroke={HAIR.light} strokeWidth={2.5} fill="none" strokeLinecap="round" />
          <path d="M86 104 l4 8 l4 -8 M106 104 l4 8 l4 -8" fill={HAIR.base} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
        </g>

        <PoseFx pose={pose} />
      </g>
    </svg>
  );
}
