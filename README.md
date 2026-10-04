# No salgas a la siesta

Juego web narrativo basado en el mito paraguayo del **Pombero** (Karai Pyhare).
Tito, un mitã de 10 años, se escapa a la hora de la siesta con su hondita para
cazar pájaros en el monte, aunque su abuela Ña Chela le advirtió que a esa hora
anda el Karai Pyhare, protector de las aves.

- Novela visual con texto letra por letra, 4 escenas y 4 finales (uno secreto).
- Medidor "Respeto al monte" (una pluma) e inventario de ofrendas.
- Minijuego **¿Pájaro o Pombero?** con silbidos sintetizados, subtítulos y onda
  animada (jugable sin audio).
- Estilo cartoon con *cel shading*: contornos de tinta, sombras de borde duro,
  cielos en bandas e interfaz tipo cómic.
- Tito en tercera persona: se lo ve de espaldas, con poses que cambian según la
  historia (apunta con la hondita, silba, se asusta, saluda, ofrece…).
- Sin assets externos: ilustraciones SVG inline y sonido con Web Audio API.
- Mouse, táctil y teclado (`1`–`4` opciones, `Espacio` avanzar, `R` repetir sonido).

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de producción (listo para Vercel)
npm run lint
npm run typecheck
```

## Estructura

| Ruta | Contenido |
| --- | --- |
| `data/story.ts` | **Todo el contenido narrativo**: escenas, opciones, finales, minijuego, glosario. |
| `lib/gameReducer.ts` | Máquina de estados del juego (`useReducer`). |
| `lib/audio.ts` | Motor de sonido sintetizado (ambientes, silbidos, efectos). |
| `lib/storage.ts` | Persistencia de finales y preferencia de sonido en `localStorage`. |
| `components/` | `Game`, `SceneView`, `DialogueBox`, `ChoiceList`, `RespectMeter`, `Inventory`, `OfferingPicker`, `BirdOrPomberoGame`, `EndingScreen`, `EndingsGallery`, `TitleScreen`, `HowToPlay`. |
| `components/illustrations/` | `cel.tsx` (herramientas de cel shading), `parts.tsx` (rancho, lapacho, naranjos, Pombero en silueta…), `SceneBackground.tsx` (fondos) y `Tito.tsx` (Tito de espaldas, con poses). |

### Editar la historia

Las escenas viven en `SCENES` dentro de `data/story.ts`. Cada opción puede
sumar o restar respeto (`respect`), mostrar consecuencias (`outcome`) y llevar a
otra escena, a la cocina, al minijuego o a un final (`goto`). Una línea puede
cambiar el fondo (`background`), el ambiente sonoro (`ambient`), la pose de
Tito (`titoPose`), dónde tiene la hondita (`hondita`) o disparar un sonido
(`sfx`). El marcador `{ofrendas}` se reemplaza por lo que lleva Tito.

La regla de finales está en `computeEnding()`:

- respeto < 40 → **El que nombra**
- respeto ≥ 70 y ofrenda entregada → **Aguyje**
- cualquier otro caso → **Vueltas en el monte**
- quedarse a dormir en la escena 1 → **Siesta tranquila** (secreto)
