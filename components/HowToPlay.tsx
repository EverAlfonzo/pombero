/** "Cómo jugar": reglas, controles y glosario guaraní. */
import { HOW_TO_PLAY } from "@/data/story";
import { Button, Kbd } from "./ui";

export default function HowToPlay({ onBack }: { onBack: () => void }) {
  return (
    <main className="min-h-dvh animate-fade-in bg-noche px-4 py-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl font-bold text-ocre-claro sm:text-5xl">Cómo jugar</h1>

        <div className="mt-4 space-y-3 text-lg leading-relaxed">
          {HOW_TO_PLAY.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <h2 className="mt-8 font-display text-3xl font-bold text-ocre-claro">Controles</h2>
        <ul className="mt-3 space-y-2 text-lg">
          {HOW_TO_PLAY.controls.map((c) => (
            <li key={c.keys} className="flex flex-wrap items-center gap-3">
              <Kbd>{c.keys}</Kbd>
              <span>{c.action}</span>
            </li>
          ))}
        </ul>

        <h2 className="mt-8 font-display text-3xl font-bold text-ocre-claro">Glosario</h2>
        <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {HOW_TO_PLAY.glossary.map((g) => (
            <div key={g.word} className="rounded-xl border-2 border-papel/20 bg-[#140c09] px-4 py-3">
              <dt className="text-lg font-bold text-luciernaga italic">
                {g.word}
              </dt>
              <dd className="text-papel/90">{g.meaning}</dd>
            </div>
          ))}
        </dl>

        <Button className="mt-8 w-full sm:w-auto" onClick={onBack} autoFocus>
          ◂ Volver
        </Button>
      </div>
    </main>
  );
}
