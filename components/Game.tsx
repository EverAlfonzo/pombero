"use client";

/**
 * Orquestador del juego: conecta la máquina de estados (useReducer) con las
 * pantallas, el sonido y la persistencia.
 */
import { useEffect, useReducer } from "react";
import { ENDINGS, SCENES, SPEAKERS } from "@/data/story";
import { audio } from "@/lib/audio";
import { formatText, gameReducer, initialState, type GameState } from "@/lib/gameReducer";
import { loadMuted, loadUnlockedEndings, saveMuted, saveUnlockedEndings } from "@/lib/storage";
import type { AmbientId, BackgroundId } from "@/lib/types";
import BirdOrPomberoGame from "./BirdOrPomberoGame";
import ChoiceList from "./ChoiceList";
import DialogueBox from "./DialogueBox";
import EndingScreen from "./EndingScreen";
import EndingsGallery from "./EndingsGallery";
import HowToPlay from "./HowToPlay";
import OfferingPicker from "./OfferingPicker";
import SceneView from "./SceneView";
import TitleScreen from "./TitleScreen";

/** Fondo y ambiente de la escena actual, aplicando los cambios de cada línea ya mostrada. */
function resolveSceneLook(state: GameState): { background: BackgroundId; ambient: AmbientId } {
  const scene = SCENES[state.sceneId];
  let background = scene.background;
  let ambient = scene.ambient;
  for (const line of state.queue.slice(0, state.lineIndex + 1)) {
    if (line.background) background = line.background;
    if (line.ambient) ambient = line.ambient;
  }
  if (state.screen === "minigame") ambient = "forest";
  return { background, ambient };
}

function resolveAmbient(state: GameState): AmbientId {
  switch (state.screen) {
    case "scene":
    case "offerings":
    case "minigame":
      return resolveSceneLook(state).ambient;
    case "ending":
      return state.endingId ? ENDINGS[state.endingId].ambient : "silence";
    default:
      return "day";
  }
}

export default function Game() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // ── Persistencia: leer al montar, guardar cuando cambian los finales.
  useEffect(() => {
    dispatch({ type: "HYDRATE", ids: loadUnlockedEndings(), muted: loadMuted() });
  }, []);

  useEffect(() => {
    if (state.hydrated) saveUnlockedEndings(state.unlocked);
  }, [state.hydrated, state.unlocked]);

  // ── Audio: el navegador exige un gesto del usuario para empezar a sonar.
  useEffect(() => {
    const unlock = () => audio.unlock();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    audio.setMuted(state.muted);
  }, [state.muted]);

  const ambient = resolveAmbient(state);
  useEffect(() => {
    audio.setAmbient(ambient);
  }, [ambient]);

  // Efecto de sonido de la línea que acaba de aparecer.
  const currentLine =
    state.screen === "scene" && state.phase === "lines" ? state.queue[state.lineIndex] : undefined;
  useEffect(() => {
    if (currentLine?.sfx) audio.play(currentLine.sfx);
  }, [currentLine]);

  // Sonido al subir o bajar el respeto.
  const change = state.respectChange;
  useEffect(() => {
    if (change) audio.play(change.delta > 0 ? "up" : "down");
  }, [change]);

  const toggleMute = () => {
    audio.unlock();
    saveMuted(!state.muted);
    dispatch({ type: "TOGGLE_MUTE" });
  };

  const format = (text: string) => formatText(text, state);

  // ── Pantallas fuera de la partida
  switch (state.screen) {
    case "title":
      return (
        <TitleScreen
          unlockedCount={state.unlocked.length}
          muted={state.muted}
          onToggleMute={toggleMute}
          onPlay={() => dispatch({ type: "START" })}
          onHowTo={() => dispatch({ type: "SHOW_HOWTO" })}
          onGallery={() => dispatch({ type: "SHOW_GALLERY" })}
        />
      );
    case "howto":
      return <HowToPlay onBack={() => dispatch({ type: "GO_TITLE" })} />;
    case "gallery":
      return <EndingsGallery unlocked={state.unlocked} onBack={() => dispatch({ type: "GO_TITLE" })} />;
    case "ending":
      return state.endingId ? (
        <EndingScreen
          key={state.runId}
          endingId={state.endingId}
          isNew={state.newEnding}
          respect={state.respect}
          format={format}
          muted={state.muted}
          onToggleMute={toggleMute}
          onRestart={() => dispatch({ type: "START" })}
          onGallery={() => dispatch({ type: "SHOW_GALLERY" })}
          onMenu={() => dispatch({ type: "GO_TITLE" })}
        />
      ) : null;
  }

  // ── Partida en curso: escena, cocina o minijuego dentro del mismo marco
  // (así el medidor y el inventario no se vuelven a montar).
  const scene = SCENES[state.sceneId];
  const { background } = resolveSceneLook(state);
  const line = state.queue[state.lineIndex];

  let content: React.ReactNode = null;
  if (state.screen === "offerings") {
    content = <OfferingPicker onConfirm={(items) => dispatch({ type: "CONFIRM_OFFERINGS", items })} />;
  } else if (state.screen === "minigame") {
    content = (
      <BirdOrPomberoGame
        onAnswer={(correct) => dispatch({ type: "MINIGAME_ANSWER", correct })}
        onDone={() => dispatch({ type: "MINIGAME_DONE" })}
      />
    );
  } else if (line) {
    const visibleChoices = (scene.choices ?? []).filter(
      (c) => !c.requiresOffering || state.inventory.length > 0,
    );
    content = (
      <div className="flex flex-col gap-3">
        <DialogueBox
          // Una key por línea reinicia la máquina de escribir.
          key={`${state.runId}-${state.sceneId}-${state.phase === "choices" ? "c" : "l"}-${state.queue === scene.lines ? "s" : "o"}-${state.lineIndex}`}
          speaker={line.speaker ? SPEAKERS[line.speaker] : undefined}
          text={format(line.text)}
          interactive={state.phase === "lines"}
          onAdvance={() => dispatch({ type: "ADVANCE" })}
        />
        {state.phase === "choices" && (
          <ChoiceList
            choices={visibleChoices}
            onChoose={(choiceId) => {
              audio.play("click");
              dispatch({ type: "CHOOSE", choiceId });
            }}
          />
        )}
      </div>
    );
  }

  return (
    <SceneView
      background={background}
      sceneNumber={scene.number}
      sceneTitle={scene.title}
      time={scene.time}
      respect={state.respect}
      respectChange={state.respectChange}
      inventory={state.inventory}
      muted={state.muted}
      onToggleMute={toggleMute}
      onMenu={() => dispatch({ type: "GO_TITLE" })}
      transitionKey={`${state.runId}-${state.sceneId}-${state.screen}`}
    >
      {content}
    </SceneView>
  );
}
