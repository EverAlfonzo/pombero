/**
 * Piezas SVG reutilizables para los fondos, en estilo cartoon con cel shading
 * (contorno de tinta, sombras de borde duro, brillos planos).
 * Todas trabajan en un lienzo de 800 × 500.
 */
import { CelBall, CelBlob, CelPath, INK, INK_W, Limb, type Circle, type Tone } from "./cel";

// ──────────────────────────────────────────────── Paleta cel

export const TONES = {
  bark: { base: "#6b4128", shade: "#43261a", light: "#8f5c3b" },
  barkNight: { base: "#1d1a2a", shade: "#100e18", light: "#2e2a44" },
  lapacho: { base: "#ec74b0", shade: "#b9417f", light: "#ffc2e0" },
  lapachoNight: { base: "#45284f", shade: "#2b1834", light: "#5f3b6c" },
  leaf: { base: "#4f8a3c", shade: "#2f5d2a", light: "#8cc45f" },
  leafNight: { base: "#173149", shade: "#0d1e30", light: "#24476a" },
  orange: { base: "#f59a1f", shade: "#c8650f", light: "#ffd27a" },
  orangeNight: { base: "#8a6327", shade: "#5c3f17", light: "#b48a45" },
  adobe: { base: "#dc916a", shade: "#a85c3d", light: "#f2b591" },
  adobeDawn: { base: "#d68a6c", shade: "#9c5640", light: "#f0b394" },
  thatch: { base: "#e2ab45", shade: "#ae7826", light: "#f7d68a" },
  wood: { base: "#7a4b2b", shade: "#4e2e19", light: "#a06a43" },
  log: { base: "#4a3328", shade: "#2c1d17", light: "#6a4b3b" },
} satisfies Record<string, Tone>;

/** Desplaza y escala una lista de círculos. */
const place = (circles: readonly Circle[], dx: number, dy: number, k = 1): Circle[] =>
  circles.map(([x, y, r]) => [dx + x * k, dy + y * k, r * k] as const);

// ──────────────────────────────────────────────── Vegetación

/** Copa de árbol genérica (cúmulo de círculos con un solo contorno). */
export function Canopy({ x, y, r, tone }: { x: number; y: number; r: number; tone: Tone }) {
  const circles: Circle[] = [
    [x - r * 0.62, y + r * 0.2, r * 0.68],
    [x + r * 0.62, y + r * 0.22, r * 0.7],
    [x, y - r * 0.18, r * 0.86],
    [x - r * 0.3, y + r * 0.42, r * 0.56],
    [x + r * 0.35, y + r * 0.45, r * 0.52],
  ];
  return <CelBlob circles={circles} tone={tone} />;
}

/** Lapacho florecido: tronco torcido y copa rosada. */
export function Lapacho({ x, y, scale = 1, night = false }: { x: number; y: number; scale?: number; night?: boolean }) {
  const bark = night ? TONES.barkNight : TONES.bark;
  const pink = night ? TONES.lapachoNight : TONES.lapacho;
  const crown: Circle[] = [
    [-62, -150, 40],
    [-22, -175, 44],
    [28, -182, 42],
    [64, -152, 42],
    [0, -140, 44],
    [-40, -205, 30],
    [26, -218, 30],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <Limb d="M0 0 C-4 -40 6 -70 -2 -110" w={18} tone={bark} />
      <Limb d="M-2 -90 C-24 -104 -40 -114 -56 -134" w={8} tone={bark} />
      <Limb d="M0 -100 C22 -118 36 -128 52 -142" w={8} tone={bark} />
      <g className="sway">
        <CelBlob circles={crown} tone={pink} />
        {!night &&
          [
            [-80, -150],
            [-40, -200],
            [10, -214],
            [62, -172],
            [-12, -158],
            [84, -142],
            [36, -150],
            [-60, -178],
          ].map(([fx, fy], i) => (
            <g key={i}>
              <circle cx={fx} cy={fy} r={5} fill="#ffd9ec" stroke={INK} strokeWidth={1.6} />
              <circle cx={fx} cy={fy} r={1.6} fill="#f6cf1d" />
            </g>
          ))}
      </g>
    </g>
  );
}

/** Naranjo con frutas. */
export function OrangeTree({ x, y, scale = 1, night = false }: { x: number; y: number; scale?: number; night?: boolean }) {
  const crown: Circle[] = [
    [-40, -100, 42],
    [40, -98, 44],
    [0, -128, 50],
    [-18, -78, 34],
    [22, -76, 34],
  ];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <Limb d="M0 0 L0 -64" w={14} tone={night ? TONES.barkNight : TONES.bark} />
      <CelBlob circles={crown} tone={night ? TONES.leafNight : TONES.leaf} />
      {[
        [-42, -96],
        [26, -132],
        [48, -84],
        [-12, -70],
        [-56, -126],
        [12, -98],
      ].map(([ox, oy], i) => (
        <CelBall key={i} cx={ox} cy={oy} r={8} tone={night ? TONES.orangeNight : TONES.orange} sw={2} />
      ))}
    </g>
  );
}

/** Arbusto bajo. */
export function Bush({ x, y, r, tone }: { x: number; y: number; r: number; tone: Tone }) {
  return (
    <CelBlob
      circles={place(
        [
          [-0.7, 0.1, 0.55],
          [0, -0.15, 0.7],
          [0.7, 0.1, 0.55],
        ],
        x,
        y,
        r,
      )}
      tone={tone}
    />
  );
}

// ──────────────────────────────────────────────── Rancho

/** Rancho paraguayo con techo de paja, corredor y hamaca. */
export function Rancho({ x, y, tone = "day" }: { x: number; y: number; tone?: "day" | "dawn" }) {
  const wall = tone === "dawn" ? TONES.adobeDawn : TONES.adobe;
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* sombra proyectada en el suelo */}
      <ellipse cx={20} cy={4} rx={160} ry={12} fill={INK} opacity={0.25} />
      {/* pared de adobe; la parte de arriba queda en sombra bajo el alero */}
      <CelPath
        d="M-110 0 L-110 -96 L110 -96 L110 0 Z"
        tone={wall}
        shade="M-120 -100 L120 -100 L120 -62 L-120 -70 Z M60 -100 L120 -100 L120 10 L80 10 Z"
        light="M-100 -50 L-60 -50 L-70 -10 L-104 -10 Z"
      />
      {/* puerta */}
      <CelPath d="M-22 0 L-22 -66 L22 -66 L22 0 Z" tone={TONES.wood} shade="M6 -70 L30 -70 L30 4 L6 4 Z" />
      <circle cx={-12} cy={-32} r={2.5} fill="#e2ab45" stroke={INK} strokeWidth={1} />
      {/* ventana con postigos */}
      <CelPath d="M44 -60 L82 -60 L82 -30 L44 -30 Z" tone={{ base: "#2a1710", shade: "#1a0e09", light: "#3a2216" }} />
      <line x1={63} y1={-60} x2={63} y2={-30} stroke={INK} strokeWidth={INK_W} />
      {/* techo de paja */}
      <CelPath
        d="M-156 -86 L0 -170 L156 -86 L146 -74 L-146 -74 Z"
        tone={TONES.thatch}
        shade="M0 -175 L160 -86 L150 -70 L0 -70 Z M-160 -86 L160 -86 L150 -70 L-150 -70 Z"
        light="M-120 -96 L-20 -152 L-12 -146 L-104 -94 Z"
      />
      {Array.from({ length: 12 }, (_, i) => {
        const px = -126 + i * 23;
        return (
          <path
            key={i}
            d={`M${px} -80 L${px * 0.55} ${-114 + Math.abs(px) * 0.12}`}
            stroke={INK}
            strokeWidth={1.6}
            strokeLinecap="round"
            opacity={0.55}
          />
        );
      })}
      {/* horcones del corredor */}
      {[-128, 128].map((px) => (
        <Limb key={px} d={`M${px} 0 L${px} -80`} w={10} tone={TONES.wood} />
      ))}
      {/* hamaca */}
      <path d="M-126 -60 Q-80 -14 -34 -62" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d="M-126 -60 Q-80 -14 -34 -62" stroke="#f1e6cc" strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M-110 -44 Q-80 -22 -50 -46" stroke="#c94a3a" strokeWidth={2.5} fill="none" />
    </g>
  );
}

// ──────────────────────────────────────────────── Personajes y objetos

/** Pitogüé (benteveo): pecho amarillo, antifaz negro y ceja blanca. */
export function Pitogue({ x, y, scale = 1, flip = false }: { x: number; y: number; scale?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`} strokeLinejoin="round">
      {/* cola */}
      <path d="M-12 2 L-32 14 L-28 2 L-34 -4 Z" fill="#7a5530" stroke={INK} strokeWidth={2} />
      {/* cuerpo */}
      <ellipse cx={0} cy={0} rx={17} ry={13} fill="#8a6136" stroke={INK} strokeWidth={2.2} />
      <path d="M-6 -6 Q4 -12 14 -6 Q8 -2 -4 -2 Z" fill="#a9794a" />
      {/* pecho amarillo con sombra */}
      <path d="M-6 2 Q2 -4 16 0 Q14 13 2 13 Q-6 12 -6 2 Z" fill="#f8d62a" stroke={INK} strokeWidth={2} />
      <path d="M2 9 Q10 10 14 4 Q14 12 4 13 Z" fill="#d9a514" />
      {/* cabeza */}
      <circle cx={12} cy={-11} r={10} fill="#1f1812" stroke={INK} strokeWidth={2} />
      <path d="M3 -15 Q12 -19 22 -14" stroke="#ffffff" strokeWidth={3.4} fill="none" strokeLinecap="round" />
      <circle cx={15} cy={-9} r={2.4} fill="#ffffff" />
      <circle cx={15.6} cy={-9} r={1.2} fill={INK} />
      {/* pico */}
      <path d="M21 -10 L33 -8 L21 -5 Z" fill="#2b2420" stroke={INK} strokeWidth={1.6} />
      {/* patas */}
      <path d="M-2 12 L-4 19 M5 12 L5 19" stroke={INK} strokeWidth={2.2} strokeLinecap="round" />
    </g>
  );
}

/** Pluma amarilla. */
export function Feather({
  x,
  y,
  rotate = -30,
  scale = 1,
  color = "#f8d62a",
}: {
  x: number;
  y: number;
  rotate?: number;
  scale?: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path d="M0 0 C16 -20 16 -52 0 -72 C-16 -52 -16 -20 0 0 Z" fill={color} stroke={INK} strokeWidth={3} />
      <path d="M0 -4 C10 -22 10 -50 0 -68 Z" fill="#d9a514" />
      <path d="M-6 -50 C-8 -40 -8 -30 -5 -22" stroke="#fff6c2" strokeWidth={3} strokeLinecap="round" fill="none" />
      <line x1={0} y1={8} x2={0} y2={-66} stroke={INK} strokeWidth={2} />
    </g>
  );
}

/** Ojos brillantes del Pombero. */
export function Eyes({ x, y, size = 1, color = "#ffe55c" }: { x: number; y: number; size?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      {/* La animación va en un grupo interno para no pisar el transform de posición. */}
      <g className="eyes">
        <circle cx={-10} cy={0} r={11} fill={color} opacity={0.18} />
        <circle cx={10} cy={0} r={11} fill={color} opacity={0.18} />
        <path d="M-15 0 Q-10 -6 -5 0 Q-10 4 -15 0 Z" fill={color} stroke={INK} strokeWidth={1.2} />
        <path d="M5 0 Q10 -6 15 0 Q10 4 5 0 Z" fill={color} stroke={INK} strokeWidth={1.2} />
        <circle cx={-9} cy={-1} r={1.1} fill="#fffbe0" />
        <circle cx={11} cy={-1} r={1.1} fill="#fffbe0" />
      </g>
    </g>
  );
}

/** Luciérnagas animadas en posiciones fijas. */
const FIREFLIES: Array<[number, number]> = [
  [120, 260], [210, 180], [280, 320], [330, 140], [380, 250], [440, 190], [500, 300],
  [560, 160], [620, 260], [680, 200], [250, 240], [470, 120], [600, 330], [160, 330],
  [720, 300], [90, 170], [350, 330], [530, 230],
];

export function Fireflies({ count = FIREFLIES.length }: { count?: number }) {
  return (
    <g>
      {FIREFLIES.slice(0, count).map(([x, y], i) => (
        <g
          key={i}
          className="firefly"
          style={
            {
              "--dur": `${5 + (i % 4)}s`,
              "--blink": `${1.8 + (i % 5) * 0.5}s`,
              "--delay": `${(i * 0.37) % 3}s`,
            } as React.CSSProperties
          }
        >
          <circle cx={x} cy={y} r={7} fill="#ffe55c" opacity={0.22} />
          <circle cx={x} cy={y} r={3} fill="#fff7b0" stroke="#d9b21f" strokeWidth={1} />
        </g>
      ))}
    </g>
  );
}

/**
 * Contorno "peludo" de dibujo animado: una elipse hecha de mechones redondeados
 * (curvas que se abren hacia afuera). Determinista para evitar diferencias
 * entre servidor y cliente.
 */
export function furryPath(cx: number, cy: number, rx: number, ry: number, tufts = 18, depth = 6): string {
  const at = (a: number, k: number) => [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k] as const;
  const step = (Math.PI * 2) / tufts;
  const [sx, sy] = at(0, 1);
  let d = `M${sx.toFixed(1)},${sy.toFixed(1)}`;
  for (let i = 0; i < tufts; i++) {
    const a1 = (i + 1) * step;
    // Cada mechón se inclina un poco (como pelo peinado hacia abajo).
    const mid = i * step + step * 0.62;
    const k = 1 + (depth / Math.min(rx, ry)) * (0.8 + 0.4 * Math.abs(Math.sin(i * 7.31)));
    const [qx, qy] = at(mid, k * 1.12);
    const [ex, ey] = at(a1, 1);
    d += ` Q${qx.toFixed(1)},${qy.toFixed(1)} ${ex.toFixed(1)},${ey.toFixed(1)}`;
  }
  return `${d}Z`;
}

/**
 * El Pombero de espaldas, sentado: silueta peluda y manos enormes.
 * Nunca se lo ve del todo: es negro, con un borde de luz de luna (rim light).
 */
export function PomberoBack({ x, y, eyes = false }: { x: number; y: number; eyes?: boolean }) {
  const body = "#0b0908";
  const rim = "#5d74b8";
  const torso = furryPath(0, -30, 28, 33, 16, 7);
  const head = furryPath(eyes ? -4 : 0, -78, 20, 19, 13, 6);
  return (
    <g transform={`translate(${x} ${y})`} strokeLinejoin="round">
      {/* luz de luna: la misma silueta corrida, asoma por el borde superior izquierdo */}
      <g transform="translate(-3 -3)" fill={rim}>
        <path d={torso} />
        <path d={head} />
      </g>
      <path d={torso} fill={body} stroke={INK} strokeWidth={2} />
      <path d={head} fill={body} stroke={INK} strokeWidth={2} />
      {/* manos enormes apoyadas en el tronco */}
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${side * 46} 2) scale(${side} 1)`}>
          <path d="M-16 -26 C-6 -32 6 -28 10 -18 L12 -2 L-18 -2 Z" fill={rim} transform="translate(-2 -2)" />
          <path d="M-16 -26 C-6 -32 6 -28 10 -18 L12 -2 L-18 -2 Z" fill={body} stroke={INK} strokeWidth={2} />
          {[-17, -10, -3, 4].map((fx, i) => (
            <rect key={i} x={fx} y={-6} width={7} height={16} rx={3.5} fill={body} stroke={rim} strokeWidth={1.2} />
          ))}
          <rect x={9} y={-12} width={7} height={12} rx={3.5} fill={body} stroke={rim} strokeWidth={1.2} transform="rotate(-30 12 -6)" />
        </g>
      ))}
      {eyes && <Eyes x={-12} y={-80} size={0.85} />}
    </g>
  );
}

/** Huellas pequeñas de pies anchos en el barro. */
export function Footprints({ x, y }: { x: number; y: number }) {
  const prints: Array<[number, number, number]> = [
    [0, 0, -10],
    [26, -22, 8],
    [6, -46, -12],
    [34, -70, 6],
  ];
  return (
    <g transform={`translate(${x} ${y})`}>
      {prints.map(([px, py, r], i) => (
        <g key={i} transform={`translate(${px} ${py}) rotate(${r})`}>
          <ellipse cx={0} cy={0} rx={10} ry={12} fill="#2e1a0f" stroke="#8a5a36" strokeWidth={1.5} />
          {[-8, -3, 2, 7].map((tx) => (
            <circle key={tx} cx={tx} cy={-15} r={2.8} fill="#2e1a0f" stroke="#8a5a36" strokeWidth={1} />
          ))}
        </g>
      ))}
    </g>
  );
}
