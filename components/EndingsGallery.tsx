/** Galería de finales. Los bloqueados se muestran como "???". */
import { ENDINGS, ENDING_ORDER } from "@/data/story";
import type { EndingId } from "@/lib/types";
import { LockIcon } from "./illustrations/icons";
import SceneBackground from "./illustrations/SceneBackground";
import { Button } from "./ui";

export default function EndingsGallery({ unlocked, onBack }: { unlocked: EndingId[]; onBack: () => void }) {
  const count = ENDING_ORDER.filter((id) => unlocked.includes(id)).length;

  return (
    <main className="min-h-dvh animate-fade-in bg-noche px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display text-4xl font-bold text-ocre-claro sm:text-5xl">Finales</h1>
          <span className="rounded-full border-2 border-papel/40 px-3 py-1 font-bold tabular-nums">
            {count}/{ENDING_ORDER.length}
          </span>
        </div>
        <p className="mt-1 text-papel/85">Cada decisión de Tito lleva a un final distinto. Uno es secreto.</p>

        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ENDING_ORDER.map((id) => {
            const ending = ENDINGS[id];
            const isUnlocked = unlocked.includes(id);
            return (
              <li
                key={id}
                className="overflow-hidden rounded-2xl border-2 border-papel/25 bg-[#140c09]"
              >
                <div className="relative h-36 overflow-hidden bg-black">
                  {isUnlocked ? (
                    <SceneBackground id={ending.background} />
                  ) : (
                    <div className="flex h-full items-center justify-center text-papel/40">
                      <LockIcon className="h-12 w-12" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-xs font-bold tracking-widest text-papel/70 uppercase">
                    {ending.secret ? "Final secreto" : "Final"}
                  </p>
                  {isUnlocked ? (
                    <>
                      <h2 className="font-display text-3xl font-bold text-ocre-claro">{ending.title}</h2>
                      <p className="mt-1 text-papel/90">{ending.summary}</p>
                    </>
                  ) : (
                    <>
                      <h2 className="font-display text-3xl font-bold text-papel/50" aria-label="Final bloqueado">
                        ???
                      </h2>
                      <p className="mt-1 text-papel/60">Todavía no lo descubriste.</p>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <Button className="mt-6 w-full sm:w-auto" onClick={onBack} autoFocus>
          ◂ Volver
        </Button>
      </div>
    </main>
  );
}
