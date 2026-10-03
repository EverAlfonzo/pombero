/**
 * Fondos ilustrados de cada escena. SVG inline, planos y simples.
 * El lienzo es 800 × 500 y se recorta con "slice" para cubrir la pantalla;
 * los elementos importantes van en el centro (x 300–500) para que se vean
 * también en celulares en vertical.
 */
import type { BackgroundId } from "@/lib/types";
import {
  Canopy,
  Eyes,
  Feather,
  Fireflies,
  Footprints,
  Lapacho,
  OrangeTree,
  PomberoBack,
  Pitogue,
  Rancho,
} from "./parts";

const W = 800;
const H = 500;

/** Cielo blanquecino de calor con sol difuso. */
function DaySky() {
  return (
    <>
      <defs>
        <linearGradient id="sky-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7f3e6" />
          <stop offset="0.7" stopColor="#f3e3b8" />
          <stop offset="1" stopColor="#ecc98a" />
        </linearGradient>
        <radialGradient id="sun-haze">
          <stop offset="0" stopColor="#fffbe8" stopOpacity="1" />
          <stop offset="0.35" stopColor="#fff3c4" stopOpacity="0.8" />
          <stop offset="1" stopColor="#fff3c4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#sky-day)" />
      <circle cx={560} cy={170} r={150} fill="url(#sun-haze)" />
    </>
  );
}

/** Cielo nocturno con luna. */
function NightSky({ moon = true, dim = false }: { moon?: boolean; dim?: boolean }) {
  return (
    <>
      <defs>
        <linearGradient id={dim ? "sky-night-dim" : "sky-night"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={dim ? "#03060f" : "#070f26"} />
          <stop offset="1" stopColor={dim ? "#070b18" : "#1c2f66"} />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={dim ? "url(#sky-night-dim)" : "url(#sky-night)"} />
      {!dim &&
        [
          [80, 140], [190, 190], [260, 130], [340, 170], [450, 125], [620, 150], [700, 210], [150, 230], [520, 220],
          [40, 200], [380, 215], [740, 140],
        ].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.3} fill="#dfe6ff" opacity={0.8} />)}
      {moon && (
        <g>
          <circle cx={600} cy={175} r={48} fill="#f5f1d8" opacity={0.15} />
          <circle cx={600} cy={175} r={30} fill="#f5f1d8" />
        </g>
      )}
    </>
  );
}

/** Pared de monte espeso en el horizonte. */
function MonteWall({ y, color, dark, floor = true }: { y: number; color: string; dark: string; floor?: boolean }) {
  return (
    <g>
      {Array.from({ length: 11 }, (_, i) => (
        <Canopy key={i} x={i * 80 - 10} y={y - (i % 3) * 12} r={60 + (i % 2) * 12} fill={color} dark={dark} />
      ))}
      {floor && <rect x={0} y={y + 20} width={W} height={H} fill={dark} />}
    </g>
  );
}

function Shimmer() {
  return (
    <g className="shimmer" stroke="#fff8e0" strokeWidth={2} fill="none" opacity={0.4}>
      <path d="M200 300 q20 -6 40 0 t40 0 t40 0" />
      <path d="M470 290 q20 -6 40 0 t40 0" />
      <path d="M330 320 q20 -6 40 0 t40 0 t40 0" />
    </g>
  );
}

function RanchoScene({ eyes = false }: { eyes?: boolean }) {
  return (
    <>
      <DaySky />
      <MonteWall y={250} color="#4f7a3e" dark="#3a6531" />
      {/* tierra colorada */}
      <path d="M0 300 Q400 280 800 300 L800 500 L0 500 Z" fill="#b14b2e" />
      <path d="M0 360 Q400 340 800 370 L800 500 L0 500 Z" fill="#a3412a" />
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
      <MonteWall y={230} color={night ? "#0c1a2a" : "#2f5d34"} dark={night ? "#081322" : "#183a22"} />
      <path d="M0 330 Q400 310 800 335 L800 500 L0 500 Z" fill={night ? "#121a2c" : "#7b4a2a"} />
      <path d="M0 380 Q400 360 800 390 L800 500 L0 500 Z" fill={night ? "#0e1524" : "#a3412a"} />
      <OrangeTree x={190} y={360} scale={1.15} night={night} />
      <OrangeTree x={630} y={370} scale={1.1} night={night} />
      <OrangeTree x={420} y={330} scale={0.9} night={night} />
      {/* rama baja donde canta el pitogüé */}
      <path
        d="M330 250 C370 240 420 245 480 236"
        stroke={night ? "#0a0f18" : "#5a3a24"}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
      />
      {bird && <Pitogue x={410} y={226} scale={1.3} />}
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
  return (
    <>
      <rect width={W} height={H} fill="#1d3b24" />
      {/* monte del fondo */}
      <MonteWall y={260} color="#244a2c" dark="#183a22" />
      {/* luz filtrada */}
      <g className="shaft" fill="#fff4c2">
        <polygon points="300,0 340,0 460,440 380,440" />
        <polygon points="430,0 455,0 540,420 500,420" />
        <polygon points="190,0 210,0 300,400 270,400" opacity={0.6} />
      </g>
      {/* troncos */}
      {[40, 130, 250, 560, 660, 760].map((x, i) => (
        <rect key={x} x={x} y={0} width={22 + (i % 3) * 10} height={H} fill="#24170f" />
      ))}
      {/* follaje alto que tapa el cielo */}
      <rect x={0} y={0} width={W} height={50} fill="#183a22" />
      <MonteWall y={40} color="#2f5d34" dark="#183a22" floor={false} />
      {/* sendero de barro */}
      <path d="M0 380 Q400 350 800 380 L800 500 L0 500 Z" fill="#183a22" />
      <path d="M290 500 C330 430 370 390 400 345 C430 390 480 440 530 500 Z" fill="#5a3a24" />
      <Footprints x={385} y={430} />
      {/* arbustos al frente, con ojos entre las hojas */}
      <Canopy x={150} y={350} r={70} fill="#234a2b" dark="#163521" />
      <Canopy x={660} y={350} r={75} fill="#234a2b" dark="#163521" />
      <Eyes x={480} y={300} size={0.55} />
    </>
  );
}

function ClaroScene({ variant }: { variant: "normal" | "ojos" | "vacio" }) {
  const empty = variant === "vacio";
  return (
    <>
      <NightSky dim={empty} moon={!empty} />
      <MonteWall y={230} color={empty ? "#060b16" : "#0c1a2a"} dark={empty ? "#04070f" : "#081322"} />
      <ellipse cx={400} cy={380} rx={430} ry={120} fill={empty ? "#070b16" : "#13224a"} />
      {/* tronco caído */}
      <g>
        <rect x={270} y={300} width={270} height={36} rx={18} fill="#2a1d18" />
        <ellipse cx={540} cy={318} rx={12} ry={18} fill="#3b2a22" />
        <ellipse cx={540} cy={318} rx={6} ry={10} fill="#2a1d18" />
        <path d="M300 300 L290 284 M480 300 L494 280" stroke="#2a1d18" strokeWidth={5} />
      </g>
      {!empty && <PomberoBack x={405} y={302} eyes={variant === "ojos"} />}
      {!empty && <Fireflies />}
      {empty && <Eyes x={150} y={270} size={0.5} />}
    </>
  );
}

function AmanecerScene() {
  return (
    <>
      <defs>
        <linearGradient id="sky-dawn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6d9c4" />
          <stop offset="0.6" stopColor="#f6c48a" />
          <stop offset="1" stopColor="#eaa86a" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="url(#sky-dawn)" />
      <circle cx={200} cy={250} r={60} fill="#fff1c9" opacity={0.7} />
      <MonteWall y={250} color="#56794a" dark="#3f6438" />
      <path d="M0 300 Q400 280 800 300 L800 500 L0 500 Z" fill="#b5553a" />
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
      <MonteWall y={260} color="#05070f" dark="#03050b" />
      <Eyes x={400} y={250} size={0.6} color="#d9c24a" />
    </>
  );
}

function TituloScene() {
  return (
    <>
      <DaySky />
      <MonteWall y={260} color="#2f5d34" dark="#183a22" />
      <path d="M0 330 Q400 310 800 335 L800 500 L0 500 Z" fill="#a3412a" />
      <Lapacho x={180} y={340} scale={1.2} />
      <OrangeTree x={640} y={350} />
      {/* hueco oscuro en el monte con ojos */}
      <ellipse cx={420} cy={300} rx={60} ry={40} fill="#0c1a12" />
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
  titulo: "#a3412a",
  rancho: "#a3412a",
  "rancho-siesta": "#a3412a",
  naranjal: "#a3412a",
  "naranjal-vacio": "#a3412a",
  "naranjal-luna": "#0e1524",
  monte: "#183a22",
  claro: "#081322",
  "claro-ojos": "#081322",
  "claro-vacio": "#04070f",
  amanecer: "#b5553a",
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
