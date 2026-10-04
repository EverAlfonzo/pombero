/**
 * Fondos ilustrados de cada escena, en estilo cartoon con cel shading:
 * cielos en bandas de color, contornos de tinta y sombras de borde duro.
 *
 * El lienzo es 800 × 500 y se recorta con "slice" para cubrir la pantalla;
 * los elementos importantes van en el centro (x 300–500) para que se vean
 * también en celulares en vertical.
 */
import type { BackgroundId } from "@/lib/types";
import { CelBlob, CelPath, INK, Limb, type Circle, type Tone } from "./cel";
import {
  Bush,
  Eyes,
  Feather,
  Fireflies,
  Footprints,
  Lapacho,
  OrangeTree,
  PomberoBack,
  Pitogue,
  Rancho,
  TONES,
} from "./parts";

const W = 800;
const H = 500;

// ──────────────────────────────────────────────── Cielos

/** Degradado "en bandas": cada color termina de golpe, como en un dibujo animado. */
function BandedSky({ id, bands }: { id: string; bands: Array<[offset: number, color: string]> }) {
  const stops: React.ReactNode[] = [];
  bands.forEach(([offset, color], i) => {
    const end = bands[i + 1]?.[0] ?? 1;
    stops.push(<stop key={`${i}a`} offset={offset} stopColor={color} />);
    stops.push(<stop key={`${i}b`} offset={end} stopColor={color} />);
  });
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          {stops}
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={`url(#${id})`} />
    </>
  );
}

const CLOUD: Tone = { base: "#fffdf4", shade: "#eadcbc", light: "#ffffff" };

function Cloud({ x, y, k = 1 }: { x: number; y: number; k?: number }) {
  const circles: Circle[] = [
    [x - 34 * k, y + 4 * k, 20 * k],
    [x, y - 8 * k, 28 * k],
    [x + 34 * k, y + 4 * k, 22 * k],
  ];
  return <CelBlob circles={circles} tone={CLOUD} sw={2.5} highlight={false} />;
}

/** Cielo blanquecino de calor de la siesta, con un sol que encandila. */
function DaySky() {
  return (
    <>
      <BandedSky
        id="sky-day"
        bands={[
          [0, "#f7f2e0"],
          [0.42, "#f6e9c4"],
          [0.58, "#f3dca2"],
          [0.68, "#efcb84"],
        ]}
      />
      {/* sol con halos en anillos */}
      <circle cx={560} cy={170} r={110} fill="#fff8de" opacity={0.45} />
      <circle cx={560} cy={170} r={78} fill="#fff8de" opacity={0.6} />
      <circle cx={560} cy={170} r={46} fill="#fffdf0" stroke="#f3d27a" strokeWidth={3} />
      <Cloud x={190} y={150} k={0.9} />
      <Cloud x={700} y={200} k={0.7} />
    </>
  );
}

/** Cielo nocturno con luna. */
function NightSky({ moon = true, dim = false }: { moon?: boolean; dim?: boolean }) {
  return (
    <>
      <BandedSky
        id={dim ? "sky-night-dim" : "sky-night"}
        bands={
          dim
            ? [
                [0, "#03050c"],
                [0.5, "#060a16"],
              ]
            : [
                [0, "#0a1230"],
                [0.38, "#111d45"],
                [0.55, "#18295c"],
                [0.66, "#213673"],
              ]
        }
      />
      {!dim &&
        [
          [80, 140], [190, 190], [260, 130], [340, 170], [450, 125], [620, 240], [700, 210], [150, 230], [520, 220],
          [40, 200], [380, 215], [740, 140],
        ].map(([x, y], i) => (
          <path
            key={i}
            d={`M${x} ${y - 4} L${x + 1.2} ${y - 1.2} L${x + 4} ${y} L${x + 1.2} ${y + 1.2} L${x} ${y + 4} L${x - 1.2} ${y + 1.2} L${x - 4} ${y} L${x - 1.2} ${y - 1.2} Z`}
            fill="#e8eeff"
          />
        ))}
      {moon && (
        <g>
          <circle cx={600} cy={175} r={58} fill="#f5f1d8" opacity={0.1} />
          <circle cx={600} cy={175} r={44} fill="#f5f1d8" opacity={0.14} />
          <circle cx={600} cy={175} r={30} fill="#d9d2ae" stroke={INK} strokeWidth={3} />
          <circle cx={596} cy={171} r={26} fill="#f7f2d6" />
          <circle cx={608} cy={184} r={5} fill="#d9d2ae" />
          <circle cx={590} cy={164} r={3.5} fill="#e6dfbd" />
        </g>
      )}
    </>
  );
}

// ──────────────────────────────────────────────── Terreno

/** Pared de monte espeso: muchos círculos con un solo contorno. */
function MonteWall({ y, tone, floor, wobble = 12 }: { y: number; tone: Tone; floor?: string; wobble?: number }) {
  const circles: Circle[] = [];
  for (let i = 0; i < 12; i++) {
    circles.push([i * 74 - 20, y - (i % 3) * wobble, 52 + (i % 2) * 14]);
    circles.push([i * 74 + 18, y + 26, 44]);
  }
  return (
    <g>
      {floor && <rect x={-20} y={y + 30} width={W + 40} height={H} fill={floor} />}
      <CelBlob circles={circles} tone={tone} />
    </g>
  );
}

/** Banda de suelo con contorno en el borde superior (el resto queda fuera de cuadro). */
function Ground({ top, tone, shade, light }: { top: string; tone: Tone; shade?: string; light?: string }) {
  return <CelPath d={`${top} L820 640 L-20 640 Z`} tone={tone} shade={shade} light={light} />;
}

const EARTH: Tone = { base: "#b9502f", shade: "#8c3520", light: "#d8714a" };
const EARTH_FAR: Tone = { base: "#c96a3f", shade: "#a3492b", light: "#e08a5c" };
const EARTH_NIGHT: Tone = { base: "#1a2140", shade: "#10162c", light: "#2a3560" };

/** Aire que tiembla con el calor. */
function Shimmer() {
  return (
    <g className="shimmer" stroke="#fff8e0" strokeWidth={2.5} strokeLinecap="round" fill="none" opacity={0.5}>
      <path d="M40 318 q20 -6 40 0 t40 0 t40 0" />
      <path d="M640 322 q20 -6 40 0 t40 0" />
      <path d="M300 352 q20 -6 40 0 t40 0 t40 0" />
    </g>
  );
}

// ──────────────────────────────────────────────── Escenas

function RanchoScene({ eyes = false }: { eyes?: boolean }) {
  return (
    <>
      <DaySky />
      <MonteWall y={262} tone={{ base: "#6d9a4c", shade: "#4b7638", light: "#9cc66e" }} floor="#4b7638" />
      <Ground top="M-20 300 Q400 280 820 300" tone={EARTH_FAR} light="M-20 300 Q400 280 820 300 L820 312 Q400 292 -20 312 Z" />
      <Ground
        top="M-20 362 Q400 342 820 372"
        tone={EARTH}
        shade="M-20 430 Q400 410 820 440 L820 640 L-20 640 Z"
      />
      <Lapacho x={250} y={330} scale={1.05} />
      {eyes && <Eyes x={240} y={180} size={0.8} />}
      <Rancho x={470} y={335} />
      <Shimmer />
    </>
  );
}

function NaranjalScene({ bird, night = false }: { bird: boolean; night?: boolean }) {
  return (
    <>
      {night ? <NightSky /> : <DaySky />}
      <MonteWall
        y={240}
        tone={night ? TONES.leafNight : { base: "#3f7438", shade: "#285024", light: "#6ea252" }}
        floor={night ? "#0d1e30" : "#285024"}
      />
      <Ground top="M-20 330 Q400 310 820 335" tone={night ? EARTH_NIGHT : { base: "#8a5a32", shade: "#653f22", light: "#a87448" }} />
      <Ground
        top="M-20 380 Q400 360 820 390"
        tone={night ? EARTH_NIGHT : EARTH}
        shade="M-20 440 Q400 420 820 450 L820 640 L-20 640 Z"
      />
      <OrangeTree x={190} y={360} scale={1.15} night={night} />
      <OrangeTree x={630} y={370} scale={1.1} night={night} />
      <OrangeTree x={420} y={330} scale={0.9} night={night} />
      {/* rama baja donde canta el pitogüé */}
      <Limb d="M326 252 C370 240 420 246 484 236" w={7} tone={night ? TONES.barkNight : TONES.bark} />
      {bird && <Pitogue x={410} y={225} scale={1.35} />}
      {!bird && !night && <Feather x={440} y={320} rotate={60} scale={0.45} />}
      {night && (
        <>
          <Eyes x={560} y={280} size={0.7} />
          <Fireflies count={8} />
        </>
      )}
      {!night && <Shimmer />}
    </>
  );
}

function MonteScene() {
  const deep: Tone = { base: "#2c5a33", shade: "#1b3d22", light: "#4f8a4a" };
  return (
    <>
      <rect width={W} height={H} fill="#1b3d22" />
      {/* monte del fondo */}
      <MonteWall y={262} tone={{ base: "#24492b", shade: "#17331d", light: "#356b3c" }} floor="#17331d" />
      {/* luz filtrada: haces de borde duro */}
      <g className="shaft" fill="#fff4c2">
        <polygon points="300,0 340,0 460,440 380,440" />
        <polygon points="430,0 455,0 540,420 500,420" />
        <polygon points="190,0 210,0 300,400 270,400" opacity={0.6} />
      </g>
      {/* troncos */}
      {[40, 130, 250, 560, 660, 760].map((x, i) => (
        <CelPath
          key={x}
          d={`M${x} -20 L${x + 24 + (i % 3) * 10} -20 L${x + 28 + (i % 3) * 10} 520 L${x - 4} 520 Z`}
          tone={TONES.bark}
          shade={`M${x + 14 + (i % 3) * 6} -20 L${x + 40} -20 L${x + 44} 520 L${x + 16 + (i % 3) * 6} 520 Z`}
        />
      ))}
      {/* follaje alto que tapa el cielo */}
      <rect x={-20} y={-20} width={W + 40} height={70} fill="#1b3d22" />
      <MonteWall y={40} tone={deep} wobble={16} />
      {/* sendero de barro */}
      <Ground top="M-20 380 Q400 350 820 380" tone={{ base: "#1f4527", shade: "#163320", light: "#2e5c35" }} />
      <CelPath
        d="M290 520 C330 430 370 390 400 345 C430 390 480 440 530 520 Z"
        tone={{ base: "#6b4428", shade: "#4b2e1a", light: "#8a5c3a" }}
        shade="M400 345 C430 390 480 440 530 520 L440 520 C430 450 415 400 400 345 Z"
      />
      <Footprints x={385} y={430} />
      {/* arbustos al frente, con ojos entre las hojas */}
      <Bush x={150} y={360} r={95} tone={deep} />
      <Bush x={660} y={360} r={100} tone={deep} />
      <Eyes x={480} y={300} size={0.55} />
    </>
  );
}

function ClaroScene({ variant }: { variant: "normal" | "ojos" | "vacio" }) {
  const empty = variant === "vacio";
  return (
    <>
      <NightSky dim={empty} moon={!empty} />
      <MonteWall
        y={240}
        tone={empty ? { base: "#070c18", shade: "#04070f", light: "#0d1526" } : TONES.leafNight}
        floor={empty ? "#04070f" : "#0d1e30"}
      />
      {/* claro iluminado por la luna */}
      <CelPath
        d="M-30 380 Q400 250 830 380 L830 640 L-30 640 Z"
        tone={empty ? EARTH_NIGHT : { base: "#22356e", shade: "#16234c", light: "#3550a0" }}
        shade="M-30 430 Q400 330 830 430 L830 640 L-30 640 Z"
        light={empty ? undefined : "M240 300 Q400 270 560 300 Q400 288 240 300 Z"}
      />
      {/* tronco caído */}
      <Limb d="M480 300 L494 278" w={6} tone={TONES.log} />
      <Limb d="M302 302 L290 284" w={6} tone={TONES.log} />
      <CelPath
        d="M272 300 Q270 318 272 336 L540 336 L540 300 Z"
        tone={TONES.log}
        shade="M272 322 L540 322 L540 340 L272 340 Z"
        light="M290 304 L520 304 L520 308 L290 308 Z"
      />
      <ellipse cx={540} cy={318} rx={12} ry={18} fill="#8a6a52" stroke={INK} strokeWidth={3} />
      <ellipse cx={540} cy={318} rx={6} ry={10} fill="none" stroke="#5a4232" strokeWidth={2} />
      {!empty && <PomberoBack x={405} y={302} eyes={variant === "ojos"} />}
      {!empty && <Fireflies />}
      {empty && <Eyes x={150} y={270} size={0.5} />}
    </>
  );
}

function AmanecerScene() {
  return (
    <>
      <BandedSky
        id="sky-dawn"
        bands={[
          [0, "#f7dcc8"],
          [0.4, "#f8cfa4"],
          [0.55, "#f6bd84"],
          [0.66, "#eea36a"],
        ]}
      />
      <circle cx={200} cy={250} r={70} fill="#fff1c9" opacity={0.4} />
      <circle cx={200} cy={250} r={44} fill="#fff6d8" stroke="#f0b765" strokeWidth={3} />
      <Cloud x={620} y={170} k={0.8} />
      <MonteWall y={262} tone={{ base: "#6f9156", shade: "#4f6f3e", light: "#9cbc78" }} floor="#4f6f3e" />
      <Ground top="M-20 300 Q400 280 820 300" tone={{ base: "#c2603f", shade: "#94442a", light: "#de8160" }} />
      <Rancho x={430} y={335} tone="dawn" />
      <Pitogue x={470} y={164} scale={1} flip />
      <Feather x={350} y={360} rotate={-70} scale={0.5} />
    </>
  );
}

function OscuridadScene() {
  return (
    <>
      <rect width={W} height={H} fill="#020309" />
      <MonteWall y={262} tone={{ base: "#070a14", shade: "#04060d", light: "#0c1120" }} floor="#04060d" />
      <Eyes x={400} y={250} size={0.6} color="#d9c24a" />
    </>
  );
}

function TituloScene() {
  return (
    <>
      <DaySky />
      <MonteWall y={262} tone={{ base: "#3f7438", shade: "#285024", light: "#6ea252" }} floor="#285024" />
      <Ground top="M-20 330 Q400 310 820 335" tone={EARTH} shade="M-20 400 Q400 380 820 405 L820 640 L-20 640 Z" />
      <Lapacho x={180} y={340} scale={1.2} />
      <OrangeTree x={640} y={350} />
      {/* hueco oscuro en el monte con ojos */}
      <ellipse cx={420} cy={300} rx={62} ry={42} fill="#0a140e" stroke={INK} strokeWidth={3.5} />
      <Eyes x={420} y={296} size={0.9} />
      <Shimmer />
    </>
  );
}

/**
 * Color del suelo de cada fondo. Las escenas se dibujan corridas hacia arriba
 * (ver SHIFT) y este color rellena la franja inferior que queda libre.
 */
const FLOOR: Record<BackgroundId, string> = {
  titulo: "#8c3520",
  rancho: "#8c3520",
  "rancho-siesta": "#8c3520",
  naranjal: "#8c3520",
  "naranjal-vacio": "#8c3520",
  "naranjal-luna": "#10162c",
  monte: "#163320",
  claro: "#16234c",
  "claro-ojos": "#16234c",
  "claro-vacio": "#10162c",
  amanecer: "#94442a",
  oscuridad: "#020309",
};

/**
 * Cuánto se sube la ilustración. La caja de diálogo ocupa la parte baja de la
 * pantalla; subiendo la escena, el rancho, el pitogüé o el Pombero quedan
 * siempre a la vista. La pantalla de título no se desplaza.
 */
const SHIFT = 110;

export default function SceneBackground({ id }: { id: BackgroundId }) {
  let content: React.ReactNode;
  switch (id) {
    case "titulo":
      content = <TituloScene />;
      break;
    case "rancho":
      content = <RanchoScene />;
      break;
    case "rancho-siesta":
      content = <RanchoScene eyes />;
      break;
    case "naranjal":
      content = <NaranjalScene bird />;
      break;
    case "naranjal-vacio":
      content = <NaranjalScene bird={false} />;
      break;
    case "naranjal-luna":
      content = <NaranjalScene bird={false} night />;
      break;
    case "monte":
      content = <MonteScene />;
      break;
    case "claro":
      content = <ClaroScene variant="normal" />;
      break;
    case "claro-ojos":
      content = <ClaroScene variant="ojos" />;
      break;
    case "claro-vacio":
      content = <ClaroScene variant="vacio" />;
      break;
    case "amanecer":
      content = <AmanecerScene />;
      break;
    case "oscuridad":
      content = <OscuridadScene />;
      break;
  }

  return (
    <svg
      key={id}
      className="absolute inset-0 h-full w-full animate-fade-in"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      {id === "titulo" ? (
        content
      ) : (
        <>
          <rect x={0} y={H - SHIFT - 10} width={W} height={SHIFT + 10} fill={FLOOR[id]} />
          <g transform={`translate(0 ${-SHIFT})`}>{content}</g>
        </>
      )}
    </svg>
  );
}
