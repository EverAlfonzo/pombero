/**
 * Piezas SVG reutilizables para los fondos (estilo plano, sin assets externos).
 * Todas trabajan en un lienzo de 800 × 500.
 */

/** Genera un contorno "peludo": una elipse con el borde dentado (determinista). */
export function furryPath(cx: number, cy: number, rx: number, ry: number, spikes = 42, depth = 5): string {
  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    // Alterna puntas largas y cortas, con una variación pseudoaleatoria estable.
    const wobble = i % 2 === 0 ? depth * (0.6 + 0.4 * Math.abs(Math.sin(i * 12.9898))) : -depth * 0.3;
    const x = cx + Math.cos(a) * (rx + wobble);
    const y = cy + Math.sin(a) * (ry + wobble);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

/** Copa de árbol formada por varios círculos. */
export function Canopy({
  x,
  y,
  r,
  fill,
  dark,
}: {
  x: number;
  y: number;
  r: number;
  fill: string;
  dark?: string;
}) {
  return (
    <g>
      <circle cx={x - r * 0.6} cy={y + r * 0.2} r={r * 0.7} fill={dark ?? fill} />
      <circle cx={x + r * 0.6} cy={y + r * 0.25} r={r * 0.72} fill={dark ?? fill} />
      <circle cx={x} cy={y - r * 0.15} r={r * 0.85} fill={fill} />
      <circle cx={x - r * 0.35} cy={y + r * 0.35} r={r * 0.55} fill={fill} />
      <circle cx={x + r * 0.4} cy={y + r * 0.4} r={r * 0.5} fill={fill} />
    </g>
  );
}

/** Lapacho florecido: tronco torcido y copa rosada. */
export function Lapacho({ x, y, scale = 1, night = false }: { x: number; y: number; scale?: number; night?: boolean }) {
  const trunk = night ? "#120d14" : "#4a2b1e";
  const pink = night ? "#3b2147" : "#e46aa6";
  const pinkDark = night ? "#2a1734" : "#c4508a";
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-8 0 C-6 -40 -14 -70 -4 -110 L6 -110 C0 -70 8 -40 10 0 Z" fill={trunk} />
      <path d="M-4 -80 C-30 -100 -46 -110 -60 -130" stroke={trunk} strokeWidth="6" fill="none" />
      <path d="M2 -95 C26 -115 40 -125 56 -140" stroke={trunk} strokeWidth="6" fill="none" />
      <g className="sway">
        <Canopy x={-50} y={-150} r={42} fill={pink} dark={pinkDark} />
        <Canopy x={45} y={-160} r={46} fill={pink} dark={pinkDark} />
        <Canopy x={0} y={-185} r={44} fill={pink} dark={pinkDark} />
        {!night &&
          [
            [-80, -140],
            [-30, -195],
            [20, -210],
            [70, -175],
            [-10, -150],
            [85, -140],
          ].map(([fx, fy], i) => <circle key={i} cx={fx} cy={fy} r={4} fill="#f8b8d5" />)}
      </g>
    </g>
  );
}

/** Naranjo con frutas. */
export function OrangeTree({ x, y, scale = 1, night = false }: { x: number; y: number; scale?: number; night?: boolean }) {
  const green = night ? "#0f2230" : "#3d6b35";
  const dark = night ? "#0a1824" : "#2c5228";
  const orange = night ? "#7a5520" : "#f08a1c";
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x={-7} y={-70} width={14} height={70} fill={night ? "#0a0f18" : "#5a3a24"} />
      <Canopy x={0} y={-110} r={62} fill={green} dark={dark} />
      {[
        [-40, -100],
        [25, -130],
        [45, -85],
        [-15, -70],
        [-55, -130],
        [10, -95],
      ].map(([ox, oy], i) => (
        <circle key={i} cx={ox} cy={oy} r={7} fill={orange} />
      ))}
    </g>
  );
}

/** Rancho paraguayo con techo de paja y corredor. */
export function Rancho({ x, y, tone = "day" }: { x: number; y: number; tone?: "day" | "dawn" }) {
  const wall = tone === "dawn" ? "#c98060" : "#d2875f";
  const shade = tone === "dawn" ? "#8d4c34" : "#9a5236";
  const thatch = tone === "dawn" ? "#c99a52" : "#d9a441";
  const thatchDark = "#a67a2c";
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* sombra bajo el corredor */}
      <rect x={-130} y={-10} width={260} height={14} fill="#6e2a1b" opacity={0.35} />
      {/* pared */}
      <rect x={-110} y={-95} width={220} height={95} fill={wall} />
      {/* corredor en sombra */}
      <rect x={-130} y={-95} width={260} height={30} fill={shade} opacity={0.55} />
      {/* puerta y ventana */}
      <rect x={-20} y={-70} width={40} height={70} fill="#4a2b1e" />
      <rect x={45} y={-62} width={34} height={28} fill="#2a1710" />
      <line x1={62} y1={-62} x2={62} y2={-34} stroke={wall} strokeWidth={3} />
      {/* techo de paja */}
      <path d="M-150 -90 L0 -165 L150 -90 Z" fill={thatch} />
      <path d="M-150 -90 L150 -90 L140 -80 L-140 -80 Z" fill={thatchDark} />
      {Array.from({ length: 14 }, (_, i) => (
        <line
          key={i}
          x1={-140 + i * 21}
          y1={-82}
          x2={-120 + i * 17}
          y2={-110 + Math.abs(7 - i) * 3}
          stroke={thatchDark}
          strokeWidth={2}
          opacity={0.6}
        />
      ))}
      {/* horcones del corredor */}
      {[-125, 125].map((px) => (
        <rect key={px} x={px - 4} y={-90} width={8} height={90} fill="#5a3a24" />
      ))}
      {/* hamaca */}
      <path d="M-121 -60 Q-75 -20 -32 -62" stroke="#e9dcc0" strokeWidth={6} fill="none" />
      <path d="M-121 -60 Q-75 -26 -32 -62" stroke="#c9b48a" strokeWidth={2} fill="none" />
    </g>
  );
}

/** Pitogüé (benteveo): pecho amarillo, antifaz negro y ceja blanca. */
export function Pitogue({ x, y, scale = 1, flip = false }: { x: number; y: number; scale?: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <path d="M-14 4 L-30 14 L-26 4 Z" fill="#6b4a2a" />
      <ellipse cx={0} cy={0} rx={16} ry={12} fill="#7a5530" />
      <ellipse cx={3} cy={4} rx={12} ry={9} fill="#f6cf1d" />
      <circle cx={12} cy={-10} r={9} fill="#1d1410" />
      <path d="M5 -13 L20 -13" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" />
      <circle cx={14} cy={-9} r={1.6} fill="#ffffff" />
      <path d="M20 -9 L30 -7 L20 -5 Z" fill="#1d1410" />
      <line x1={-2} y1={11} x2={-4} y2={18} stroke="#1d1410" strokeWidth={2} />
      <line x1={4} y1={11} x2={4} y2={18} stroke="#1d1410" strokeWidth={2} />
    </g>
  );
}

/** Pluma (para el final "Aguyje"). */
export function Feather({
  x,
  y,
  rotate = -30,
  scale = 1,
  color = "#f6cf1d",
}: {
  x: number;
  y: number;
  rotate?: number;
  scale?: number;
  color?: string;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
      <path d="M0 0 C14 -20 14 -50 0 -70 C-14 -50 -14 -20 0 0 Z" fill={color} />
      <line x1={0} y1={8} x2={0} y2={-66} stroke="#7a5530" strokeWidth={2} />
    </g>
  );
}

/** Ojos brillantes del Pombero. */
export function Eyes({ x, y, size = 1, color = "#ffe55c" }: { x: number; y: number; size?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${size})`}>
      {/* La animación va en un grupo interno para no pisar el transform de posición. */}
      <g className="eyes">
        <circle cx={-9} cy={0} r={9} fill={color} opacity={0.25} />
        <circle cx={9} cy={0} r={9} fill={color} opacity={0.25} />
        <ellipse cx={-9} cy={0} rx={4} ry={3} fill={color} />
        <ellipse cx={9} cy={0} rx={4} ry={3} fill={color} />
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
        <circle
          key={i}
          className="firefly"
          cx={x}
          cy={y}
          r={2.6}
          fill="#ffe55c"
          style={
            {
              "--dur": `${5 + (i % 4)}s`,
              "--blink": `${1.8 + (i % 5) * 0.5}s`,
              "--delay": `${(i * 0.37) % 3}s`,
              filter: "drop-shadow(0 0 4px #ffe55c)",
            } as React.CSSProperties
          }
        />
      ))}
    </g>
  );
}

/** El Pombero de espaldas, sentado: silueta peluda y manos enormes. */
export function PomberoBack({ x, y, eyes = false }: { x: number; y: number; eyes?: boolean }) {
  const body = "#0a0807";
  return (
    <g transform={`translate(${x} ${y})`}>
      {/* cuerpo y cabeza */}
      <path d={furryPath(0, -30, 30, 34, 70, 3.5)} fill={body} />
      <path d={furryPath(eyes ? -4 : 0, -78, 22, 21, 56, 2.5)} fill={body} />
      {/* manos enormes apoyadas en el tronco */}
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${side * 44} 2) scale(${side} 1)`}>
          <path d="M-14 -24 C-6 -30 4 -26 8 -18 L10 -2 L-16 -2 Z" fill={body} />
          {[-16, -9, -2, 5].map((fx, i) => (
            <rect key={i} x={fx} y={-6} width={6} height={14} rx={3} fill={body} />
          ))}
          <rect x={8} y={-10} width={6} height={10} rx={3} fill={body} transform="rotate(-30 11 -5)" />
        </g>
      ))}
      {eyes && <Eyes x={-12} y={-80} size={0.85} />}
    </g>
  );
}

/** Huellas pequeñas de pies anchos. */
export function Footprints({ x, y }: { x: number; y: number }) {
  const prints: Array<[number, number, number]> = [
    [0, 0, -10],
    [26, -22, 8],
    [6, -46, -12],
    [34, -70, 6],
  ];
  return (
    <g transform={`translate(${x} ${y})`} fill="#3d2414" opacity={0.85}>
      {prints.map(([px, py, r], i) => (
        <g key={i} transform={`translate(${px} ${py}) rotate(${r})`}>
          <ellipse cx={0} cy={0} rx={9} ry={11} />
          {[-8, -3, 2, 7].map((tx) => (
            <circle key={tx} cx={tx} cy={-14} r={2.6} />
          ))}
        </g>
      ))}
    </g>
  );
}
