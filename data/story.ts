/**
 * CONTENIDO NARRATIVO DE "NO SALGAS A LA SIESTA"
 * ------------------------------------------------
 * Todo el texto del juego vive acá para poder editarlo sin tocar componentes.
 *
 * - Las líneas sin `speaker` son narración.
 * - `respect` en una opción suma o resta al medidor "Respeto al monte".
 * - `outcome` son las líneas que se muestran como consecuencia de la opción.
 * - En los textos se puede usar {ofrendas}, que se reemplaza por lo que Tito
 *   lleva (p. ej. "la miel y el naco").
 */
import type {
  Ending,
  EndingId,
  Offering,
  OfferingId,
  Scene,
  SceneId,
  SpeakerId,
  WhistleKind,
} from "@/lib/types";

export const GAME_TITLE = "No salgas a la siesta";
export const GAME_SUBTITLE = "Una leyenda del Karai Pyhare";

/** Valores iniciales y reglas del medidor. */
export const RESPECT = {
  initial: 50,
  min: 0,
  max: 100,
  /** Umbral para el final "Aguyje" (con ofrenda entregada). */
  high: 70,
  /** Por debajo de este valor se llega a "El que nombra". */
  low: 40,
} as const;

export const MAX_OFFERINGS = 2;

export const SPEAKERS: Record<SpeakerId, string> = {
  chela: "Ña Chela",
  tito: "Tito",
  pombero: "???",
};

export const OFFERINGS: Record<OfferingId, Offering> = {
  miel: {
    id: "miel",
    name: "Miel",
    withArticle: "la miel",
    description: "Un frasquito de miel de abeja, espesa y dorada.",
  },
  huevo: {
    id: "huevo",
    name: "Huevo",
    withArticle: "el huevo",
    description: "Un huevo de la gallina bataraza, todavía tibio.",
  },
  naco: {
    id: "naco",
    name: "Naco",
    withArticle: "el naco",
    description: "Un rollito del naco que la abuela guarda en la repisa.",
  },
};

export const OFFERINGS_TEXT = {
  title: "La cocina",
  intro:
    "En la repisa hay cosas que la abuela guarda “para cuando haga falta”. Dicen que al Karai Pyhare le gustan la miel, los huevos y el naco.",
  hint: `Elegí hasta ${MAX_OFFERINGS} ofrendas para llevar.`,
  confirm: "Salir por la ventana",
};

export const SCENES: Record<SceneId, Scene> = {
  // ─────────────────────────────────────────────────────────────── ESCENA 1
  siesta: {
    id: "siesta",
    number: 1,
    title: "La siesta",
    time: "13:30",
    background: "rancho",
    ambient: "day",
    lines: [
      {
        text: "Una compañía de tierra colorada, a la hora en que el kuarahy aprieta. Las chicharras no se callan nunca.",
      },
      {
        speaker: "chela",
        text: "Mitã, a dormir. A esta hora anda el Karai Pyhare, y no le gusta que molesten a sus pájaros.",
      },
      { speaker: "tito", text: "Sí, abuela…" },
      {
        text: "Tito se hace el dormido. Debajo de la almohada tiene escondida su hondita nueva.",
      },
      {
        text: "Al rato, Ña Chela ronca en la hamaca del corredor. Afuera, el lapacho florecido tiembla con el calor.",
      },
    ],
    choices: [
      {
        id: "ventana",
        label: "Escaparse por la ventana con la hondita",
        outcome: [
          {
            text: "Tito salta por la ventana sin hacer ruido y corre descalzo hacia los naranjos.",
          },
        ],
        goto: { type: "scene", scene: "pitogue" },
      },
      {
        id: "cocina",
        label: "Pasar antes por la cocina",
        outcome: [{ text: "Tito entra en puntas de pie a la cocina, conteniendo la respiración." }],
        goto: { type: "offerings", then: "pitogue" },
      },
      {
        id: "dormir",
        label: "Quedarse a dormir",
        outcome: [
          { text: "Tito suelta la hondita, se da vuelta y cierra los ojos. Esta vez, de verdad." },
        ],
        goto: { type: "ending", ending: "siesta" },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────── ESCENA 2
  pitogue: {
    id: "pitogue",
    number: 2,
    title: "El pitogüé",
    time: "14:00",
    background: "naranjal",
    ambient: "day",
    lines: [
      {
        text: "Al borde del ka'aguy, el naranjal huele a azahar y a fruta caída. Todo zumba de calor.",
      },
      {
        text: "En una rama baja, un pitogüé infla su pecho amarillo y canta: «¡pi-to-güé!»",
        sfx: "pitogue",
      },
      { speaker: "tito", text: "Ese es fácil…" },
    ],
    choices: [
      {
        id: "tirar",
        label: "Tirarle con la hondita",
        respect: -20,
        outcome: [
          {
            text: "¡Zas! La piedrita pasa lejos. El pitogüé escapa ileso…",
            sfx: "hondita",
            background: "naranjal-vacio",
          },
          {
            text: "…y de golpe el monte se queda en silencio. Ni una chicharra. Tito siente que alguien lo mira desde los árboles.",
            ambient: "silence",
          },
        ],
        goto: { type: "scene", scene: "senales" },
      },
      {
        id: "seguir",
        label: "Seguirlo para ver adónde va",
        respect: 10,
        outcome: [
          {
            text: "Tito guarda la hondita y sigue al pitogüé de rama en rama, cada vez más adentro del monte.",
            background: "naranjal-vacio",
          },
        ],
        goto: { type: "scene", scene: "senales" },
      },
      {
        id: "imitar",
        label: "Imitar su silbido",
        respect: 5,
        outcome: [
          {
            text: "Tito junta los labios y silba: «pi-to-güé». El pájaro inclina la cabeza, curioso.",
            sfx: "silbido-tito",
          },
          {
            text: "Entonces, desde lo hondo del monte, alguien le contesta el silbido. Igualito. Demasiado igualito.",
            sfx: "silbido-pombero",
          },
        ],
        goto: { type: "scene", scene: "senales" },
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────── ESCENA 3
  senales: {
    id: "senales",
    number: 3,
    title: "Las señales",
    time: "¿?",
    background: "monte",
    ambient: "forest",
    lines: [
      {
        text: "El sendero ya no es el mismo. Los árboles se cierran arriba y la luz cae en hilos, como por un techo de paja.",
      },
      { text: "Tito mete la mano en el bolsillo. La hondita desapareció." },
      { speaker: "tito", text: "¿Dónde…? Si la tenía recién…" },
      {
        text: "En el barro hay huellas pequeñas, de pies anchos. Demasiado anchos para un niño.",
      },
      {
        text: "Y empiezan los silbidos. Desde la izquierda, desde atrás, desde arriba. Algunos son pájaros. Otros… no.",
        sfx: "muchos-silbidos",
      },
    ],
    after: { type: "minigame", then: "claro" },
  },

  // ─────────────────────────────────────────────────────────────── ESCENA 4
  claro: {
    id: "claro",
    number: 4,
    title: "El claro",
    time: "Anochecer",
    background: "claro",
    ambient: "night",
    lines: [
      { text: "Sin saber cómo, ya es de noche. Tito llega a un claro lleno de luciérnagas." },
      {
        text: "Sobre un tronco caído hay una figura pequeña y peluda, de espaldas. No se mueve.",
      },
      {
        text: "Solo se le ven las manos: enormes, demasiado grandes para ese cuerpo, apoyadas sobre la madera.",
      },
      { speaker: "tito", text: "(No grites, Tito. No grites…)" },
    ],
    choices: [
      {
        id: "gritar",
        label: "Gritarle: «¡Pombero!»",
        respect: -30,
        outcome: [
          { speaker: "tito", text: "¡POMBERO!" },
          {
            text: "Las luciérnagas se apagan todas a la vez. El tronco está vacío.",
            background: "claro-vacio",
            ambient: "silence",
          },
        ],
        goto: { type: "computeEnding" },
      },
      {
        id: "saludar",
        label: "Saludar con respeto: «Buenas noches, Karai»",
        respect: 15,
        outcome: [
          { speaker: "tito", text: "Buenas noches, Karai." },
          {
            text: "La figura gira apenas la cabeza. Dos ojos brillan, amarillos como luciérnagas, y se quedan mirándolo un largo rato.",
            background: "claro-ojos",
          },
        ],
        goto: { type: "computeEnding" },
      },
      {
        id: "ofrenda",
        label: "Dejarle una ofrenda en el tronco",
        respect: 25,
        requiresOffering: true,
        givesOffering: true,
        outcome: [
          {
            text: "Tito se acerca despacito y deja {ofrendas} sobre el tronco, al lado de esas manos enormes.",
          },
          {
            text: "Una mano se cierra sobre la ofrenda. Un silbido suave, casi una risa, recorre el claro.",
            sfx: "silbido-pombero",
            background: "claro-ojos",
          },
        ],
        goto: { type: "computeEnding" },
      },
      {
        id: "correr",
        label: "Salir corriendo",
        respect: -10,
        outcome: [
          {
            text: "Tito corre sin mirar atrás. Las ramas le arañan los brazos y los silbidos lo siguen, riéndose.",
            background: "claro-vacio",
          },
        ],
        goto: { type: "computeEnding" },
      },
    ],
  },
};

export const FIRST_SCENE: SceneId = "siesta";

export const ENDINGS: Record<EndingId, Ending> = {
  aguyje: {
    id: "aguyje",
    title: "Aguyje",
    tone: "good",
    background: "amanecer",
    ambient: "day",
    summary: "El Karai Pyhare aceptó la ofrenda y un pitogüé guió a Tito a casa.",
    paragraphs: [
      "El Karai Pyhare silba una vez, largo y suave. Desde una rama, el pitogüé contesta y empieza a volar despacito, esperando a Tito en cada árbol.",
      "Así, de naranjo en naranjo, el pájaro lo guía hasta el rancho.",
      "Tito se despierta en su hamaca. ¿Fue un sueño? A su lado hay una pluma amarilla.",
      "A la tarde, Ña Chela nota que en la cocina falta algo: {ofrendas}. Mira la pluma, mira a Tito… y sonríe sin decir nada.",
    ],
  },
  vueltas: {
    id: "vueltas",
    title: "Vueltas en el monte",
    tone: "neutral",
    background: "naranjal-luna",
    ambient: "night",
    summary: "Tito caminó en círculos hasta que salió la luna.",
    paragraphs: [
      "Tito camina y camina. Cada sendero lo devuelve al mismo árbol, a la misma piedra, al mismo silencio.",
      "Recién cuando sale la jasy, grande y blanca, encuentra el camino. Llega al rancho tarde, embarrado hasta las rodillas.",
      "Desde esa noche, alguien le silba desde los naranjos. Nunca de cerca. Nunca del todo lejos.",
    ],
  },
  nombra: {
    id: "nombra",
    title: "El que nombra",
    tone: "bad",
    background: "oscuridad",
    ambient: "silence",
    summary: "Tito desapareció tres días en el monte.",
    paragraphs: [
      "Todo se oscurece, como si alguien hubiera soplado la luna.",
      "Lo buscan por toda la compañía. Tito aparece tres días después, sentado en el corredor, sin poder explicar dónde estuvo.",
      "Nunca más volvió a tocar una hondita. Y cuando alguien dice ese nombre en voz alta, Tito mira hacia el monte y se queda callado.",
    ],
  },
  siesta: {
    id: "siesta",
    title: "Siesta tranquila",
    secret: true,
    tone: "secret",
    background: "rancho-siesta",
    ambient: "day",
    summary: "Tito hizo caso a la abuela y durmió la siesta.",
    paragraphs: [
      "Tito durmió la siesta entera, como le pidió la abuela. Soñó con naranjas y con pájaros que conversaban.",
      "Afuera, entre las flores del lapacho, alguien silbó decepcionado.",
    ],
  },
};

/** Orden en que se muestran los finales en la galería. */
export const ENDING_ORDER: EndingId[] = ["aguyje", "vueltas", "nombra", "siesta"];

/**
 * Regla para calcular el final después de la escena 4.
 * - respeto < 40                       → "El que nombra"
 * - respeto ≥ 70 y ofrenda entregada   → "Aguyje"
 * - cualquier otro caso                → "Vueltas en el monte"
 */
export function computeEnding(respect: number, ofrendaEntregada: boolean): EndingId {
  if (respect < RESPECT.low) return "nombra";
  if (respect >= RESPECT.high && ofrendaEntregada) return "aguyje";
  return "vueltas";
}

// ─────────────────────────────────────────────────────── MINIJUEGO
export const MINIGAME = {
  title: "¿Pájaro o Pombero?",
  intro:
    "Escuchá cada silbido y decidí quién lo hizo. Los pájaros trinan corto y rápido; el Karai Pyhare silba largo, como una persona.",
  rounds: 5,
  respectPerAnswer: 4,
  /** Subtítulos descriptivos (accesibilidad). Se elige uno al azar por ronda. */
  captions: {
    pajaro: [
      "trino corto y rápido",
      "varios trinos cortos, saltarines",
      "trino agudo y rápido que se corta de golpe",
    ],
    pombero: [
      "silbido largo que sube y baja",
      "silbido lento, como de persona, que sube y baja",
      "silbido largo y suave, que se estira",
    ],
  } satisfies Record<WhistleKind, string[]>,
  labels: { pajaro: "Pájaro", pombero: "Pombero" } satisfies Record<WhistleKind, string>,
  feedback: {
    correct: { pajaro: "¡Bien! Era un pájaro de verdad.", pombero: "¡Bien! Ese silbido no era de ningún pájaro…" },
    wrong: { pajaro: "No… era un pájaro de verdad.", pombero: "No… ese era el Karai Pyhare, imitando." },
  },
  outroGood:
    "Tito aprende a distinguir las voces del monte. Los silbidos falsos se alejan, como si estuvieran conformes.",
  outroBad:
    "Tito ya no sabe qué es pájaro y qué no. Los silbidos lo rodean y lo empujan, despacito, hacia un claro.",
  /** A partir de cuántos aciertos se muestra `outroGood`. */
  goodThreshold: 4,
  continueLabel: "Seguir los silbidos",
};

// ─────────────────────────────────────────────────────── CÓMO JUGAR
export const HOW_TO_PLAY = {
  paragraphs: [
    "Tito, un mitã de diez años, se escapa a la hora de la siesta para cazar pájaros en el monte. Su abuela le advirtió que a esa hora anda el Karai Pyhare, el Pombero: bajito, peludo, de manos grandes, protector de las aves y del monte.",
    "Leé la historia y elegí qué hace Tito. Cada decisión cambia el medidor “Respeto al monte” (la pluma). Las ofrendas que lleves pueden cambiarlo todo.",
    "En el monte vas a tener que distinguir el canto de un pájaro del silbido del Pombero. Si jugás sin sonido, mirá la onda y leé el subtítulo.",
    "Hay cuatro finales. Uno es secreto.",
  ],
  controls: [
    { keys: "Clic / toque", action: "Completar el texto o avanzar" },
    { keys: "Espacio", action: "Completar el texto o avanzar" },
    { keys: "1 – 4", action: "Elegir una opción" },
    { keys: "R", action: "Repetir el sonido en el minijuego" },
  ],
  glossary: [
    { word: "Karai Pyhare", meaning: "señor de la noche; otro nombre del Pombero" },
    { word: "mitã", meaning: "niño" },
    { word: "aguyje", meaning: "gracias" },
    { word: "naco", meaning: "tabaco (en rollo, para mascar)" },
    { word: "pitogüé", meaning: "benteveo, pájaro de pecho amarillo" },
    { word: "ka'aguy", meaning: "monte, bosque" },
    { word: "kuarahy", meaning: "sol" },
    { word: "jasy", meaning: "luna" },
  ],
};
