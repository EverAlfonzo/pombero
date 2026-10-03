/**
 * Motor de sonido 100% sintetizado con Web Audio API (sin archivos externos).
 *
 * - Ambientes en loop: chicharras (ruido filtrado) de día, grillos de noche.
 * - Silbidos del minijuego: pájaro (trinos cortos con FM rápida) y Pombero
 *   (silbido largo, humano, con portamento suave).
 * - Efectos de interfaz.
 *
 * El AudioContext se crea recién con un gesto del usuario (`unlock`), como
 * exigen los navegadores. Si Web Audio no existe, todo es un no-op.
 */
import type { AmbientId, SfxId, WhistleKind } from "./types";

// ──────────────────────────────────────────────── Patrones de silbido
// Los patrones son datos puros: se usan para sintetizar el sonido y también
// para dibujar la onda animada (así se puede jugar sin audio).

export interface BirdNote {
  start: number;
  dur: number;
  f0: number;
  f1: number;
  fmRate: number;
  fmDepth: number;
}

export interface PitchKey {
  t: number;
  f: number;
}

export type WhistlePattern =
  | { kind: "pajaro"; duration: number; notes: BirdNote[] }
  | { kind: "pombero"; duration: number; keys: PitchKey[]; vibrato: number };

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/** Genera un trino de pájaro: 4–7 notas cortas, rápidas y variadas. */
function createBirdPattern(): WhistlePattern {
  const notes: BirdNote[] = [];
  const count = Math.floor(rand(4, 8));
  let t = 0.05;
  for (let i = 0; i < count; i++) {
    const dur = rand(0.04, 0.1);
    const f0 = rand(2400, 4200);
    notes.push({ start: t, dur, f0, f1: f0 * rand(0.6, 1.5), fmRate: rand(35, 75), fmDepth: rand(200, 600) });
    t += dur + rand(0.025, 0.09);
  }
  return { kind: "pajaro", duration: t + 0.05, notes };
}

/** Genera un silbido de Pombero: largo, sube y baja despacio. */
function createPomberoPattern(): WhistlePattern {
  const duration = rand(2.2, 2.8);
  const base = rand(850, 1000);
  const keys: PitchKey[] = [
    { t: 0, f: base },
    { t: duration * 0.28, f: base * rand(1.35, 1.5) },
    { t: duration * 0.55, f: base * rand(0.85, 0.95) },
    { t: duration * 0.8, f: base * rand(1.25, 1.4) },
    { t: duration, f: base * rand(0.95, 1.05) },
  ];
  return { kind: "pombero", duration, keys, vibrato: rand(4.5, 5.5) };
}

export function createWhistle(kind: WhistleKind): WhistlePattern {
  return kind === "pajaro" ? createBirdPattern() : createPomberoPattern();
}

/** Frecuencia del Pombero en el instante t (interpolación coseno = portamento suave). */
export function pomberoFreqAt(keys: PitchKey[], t: number): number {
  if (t <= keys[0].t) return keys[0].f;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (t <= b.t) {
      const x = (t - a.t) / (b.t - a.t);
      const s = (1 - Math.cos(Math.PI * x)) / 2;
      return a.f + (b.f - a.f) * s;
    }
  }
  return keys[keys.length - 1].f;
}

// ──────────────────────────────────────────────── Motor

type UiSound = "click" | "up" | "down" | "ending-good" | "ending-bad" | "ending-neutral";

interface AmbientLayer {
  id: AmbientId;
  out: GainNode;
  sources: AudioScheduledSourceNode[];
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private ambientBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;
  private noise: AudioBuffer | null = null;
  private layer: AmbientLayer | null = null;
  private wantedAmbient: AmbientId = "silence";
  private muted = false;
  private visibilityBound = false;

  /** Crea/reanuda el AudioContext. Llamar desde un gesto del usuario. */
  unlock(): void {
    if (typeof window === "undefined") return;
    try {
      if (!this.ctx) {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctor) return;
        const ctx = new Ctor();
        this.ctx = ctx;
        this.master = ctx.createGain();
        this.master.gain.value = this.muted ? 0 : 1;
        this.master.connect(ctx.destination);
        this.ambientBus = ctx.createGain();
        this.ambientBus.connect(this.master);
        this.sfxBus = ctx.createGain();
        this.sfxBus.gain.value = 0.9;
        this.sfxBus.connect(this.master);
        this.noise = this.createNoiseBuffer(ctx);
        this.bindVisibility();
        this.applyAmbient(this.wantedAmbient);
      }
      if (this.ctx.state === "suspended") void this.ctx.resume().catch(() => {});
    } catch {
      this.ctx = null;
    }
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    if (!this.ctx || !this.master) return;
    this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.08);
  }

  /** Cambia el ambiente con un fundido cruzado. */
  setAmbient(id: AmbientId): void {
    if (id === this.wantedAmbient && (this.layer?.id === id || !this.ctx)) return;
    this.wantedAmbient = id;
    if (this.ctx) this.applyAmbient(id);
  }

  /** Efectos narrativos y de interfaz. */
  play(sound: SfxId | UiSound): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== "running") return;
    const t = ctx.currentTime + 0.02;
    try {
      switch (sound) {
        case "click":
          this.tone(t, 640, 0.05, 0.06, "sine");
          break;
        case "up":
          this.tone(t, 523, 0.12, 0.08, "triangle");
          this.tone(t + 0.1, 784, 0.18, 0.08, "triangle");
          break;
        case "down":
          this.tone(t, 330, 0.14, 0.09, "triangle");
          this.tone(t + 0.12, 220, 0.24, 0.09, "triangle");
          break;
        case "ending-good":
          [523, 659, 784, 1046].forEach((f, i) => this.tone(t + i * 0.16, f, 0.9, 0.06, "sine"));
          break;
        case "ending-neutral":
          [440, 523, 494].forEach((f, i) => this.tone(t + i * 0.25, f, 0.8, 0.05, "sine"));
          break;
        case "ending-bad":
          this.tone(t, 110, 2.2, 0.12, "sawtooth", 300);
          this.tone(t, 116, 2.2, 0.08, "sawtooth", 300);
          break;
        case "pitogue":
          this.scheduleCall(t);
          break;
        case "hondita":
          this.scheduleSlingshot(t);
          break;
        case "silbido-tito":
          // Un niño imitando: tres notas, menos precisas que el pájaro.
          this.scheduleWhistle(
            {
              kind: "pombero",
              duration: 0.9,
              keys: [
                { t: 0, f: 1500 },
                { t: 0.2, f: 1550 },
                { t: 0.4, f: 1300 },
                { t: 0.6, f: 1700 },
                { t: 0.9, f: 1400 },
              ],
              vibrato: 3,
            },
            t,
            0,
            0.7,
          );
          break;
        case "silbido-pombero":
          this.scheduleWhistle(createPomberoPattern(), t + 0.3, 0.4);
          break;
        case "muchos-silbidos":
          this.scheduleWhistle(createBirdPattern(), t, -0.7, 0.7);
          this.scheduleWhistle(createPomberoPattern(), t + 0.5, 0.8, 0.6);
          this.scheduleWhistle(createBirdPattern(), t + 1.4, 0.3, 0.6);
          this.scheduleWhistle(createPomberoPattern(), t + 2.1, -0.5, 0.5);
          break;
      }
    } catch {
      // Un error de audio nunca debe romper el juego.
    }
  }

  /** Reproduce un patrón del minijuego. */
  playWhistle(pattern: WhistlePattern): void {
    const ctx = this.ctx;
    if (!ctx || ctx.state !== "running") return;
    try {
      this.scheduleWhistle(pattern, ctx.currentTime + 0.05, 0);
    } catch {
      // no-op
    }
  }

  // ──────────────────────────────────────────── internos

  private bindVisibility() {
    if (this.visibilityBound || typeof document === "undefined") return;
    this.visibilityBound = true;
    document.addEventListener("visibilitychange", () => {
      if (!this.ctx) return;
      if (document.hidden) void this.ctx.suspend().catch(() => {});
      else void this.ctx.resume().catch(() => {});
    });
  }

  private createNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  private noiseSource(): AudioBufferSourceNode {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    src.loop = true;
    return src;
  }

  /** Conecta un LFO a un parámetro: param oscila entre base ± depth. */
  private lfo(param: AudioParam, base: number, rate: number, depth: number, type: OscillatorType = "sine") {
    const ctx = this.ctx!;
    param.value = base;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = rate;
    const g = ctx.createGain();
    g.gain.value = depth;
    osc.connect(g).connect(param);
    return osc;
  }

  private applyAmbient(id: AmbientId) {
    const ctx = this.ctx;
    if (!ctx || !this.ambientBus) return;
    const now = ctx.currentTime;

    // Fundido de salida del ambiente anterior.
    const old = this.layer;
    if (old) {
      old.out.gain.cancelScheduledValues(now);
      old.out.gain.setValueAtTime(old.out.gain.value, now);
      old.out.gain.linearRampToValueAtTime(0, now + 1.5);
      setTimeout(() => {
        old.sources.forEach((s) => {
          try {
            s.stop();
          } catch {
            /* ya detenido */
          }
        });
        old.out.disconnect();
      }, 1700);
    }
    this.layer = null;
    if (id === "silence") return;

    const out = ctx.createGain();
    out.gain.value = 0;
    out.connect(this.ambientBus);
    const sources: AudioScheduledSourceNode[] = [];
    let level = 1;

    if (id === "day" || id === "forest") {
      // Chicharras: ruido pasabanda con modulación rápida (zumbido) y lenta (oleadas).
      const cicadas: Array<[number, number, number]> = [
        [5200, 110, 0.07],
        [4100, 72, 0.11],
      ];
      for (const [freq, buzz, swell] of cicadas) {
        const src = this.noiseSource();
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = freq;
        bp.Q.value = 7;
        const am = ctx.createGain();
        const sw = ctx.createGain();
        sources.push(this.lfo(am.gain, 0.6, buzz, 0.4), this.lfo(sw.gain, 0.6, swell, 0.4));
        src.connect(bp).connect(am).connect(sw).connect(out);
        sources.push(src);
      }
      level = id === "day" ? 0.22 : 0.1;
    }

    if (id === "forest" || id === "night") {
      // Viento suave entre los árboles.
      const src = this.noiseSource();
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 380;
      const g = ctx.createGain();
      sources.push(this.lfo(g.gain, id === "forest" ? 0.5 : 0.35, 0.09, 0.25));
      src.connect(lp).connect(g).connect(out);
      sources.push(src);
    }

    if (id === "night") {
      // Grillos: tono agudo pulsado rápido, agrupado en chirridos.
      const crickets: Array<[number, number, number, number]> = [
        [4400, 30, 0.9, 0.05],
        [3900, 26, 0.63, 0.035],
      ];
      for (const [freq, pulse, group, vol] of crickets) {
        const osc = ctx.createOscillator();
        osc.frequency.value = freq;
        const g1 = ctx.createGain();
        const g2 = ctx.createGain();
        const g3 = ctx.createGain();
        g3.gain.value = vol;
        sources.push(this.lfo(g1.gain, 0.5, pulse, 0.5, "square"), this.lfo(g2.gain, 0.5, group, 0.5, "square"));
        osc.connect(g1).connect(g2).connect(g3).connect(out);
        sources.push(osc);
      }
      level = 0.5;
    }

    sources.forEach((s) => s.start(now));
    out.gain.linearRampToValueAtTime(level, now + 1.8);
    this.layer = { id, out, sources };
  }

  /** Tono simple con envolvente. */
  private tone(t: number, freq: number, dur: number, vol: number, type: OscillatorType, lowpass?: number) {
    const ctx = this.ctx!;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let node: AudioNode = osc.connect(g);
    if (lowpass) {
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = lowpass;
      node = node.connect(lp);
    }
    node.connect(this.sfxBus!);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  private panned(pan: number): AudioNode {
    const ctx = this.ctx!;
    if (typeof ctx.createStereoPanner !== "function" || pan === 0) return this.sfxBus!;
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    p.connect(this.sfxBus!);
    return p;
  }

  /** Sintetiza un patrón de silbido a partir del instante t0. */
  private scheduleWhistle(pattern: WhistlePattern, t0: number, pan: number, volume = 1) {
    const ctx = this.ctx!;
    const dest = this.panned(pan);

    if (pattern.kind === "pajaro") {
      for (const n of pattern.notes) {
        const t = t0 + n.start;
        const osc = ctx.createOscillator();
        osc.frequency.setValueAtTime(n.f0, t);
        osc.frequency.exponentialRampToValueAtTime(n.f1, t + n.dur);
        // Modulación de frecuencia rápida: el "temblor" del trino.
        const mod = ctx.createOscillator();
        mod.frequency.value = n.fmRate;
        const modGain = ctx.createGain();
        modGain.gain.value = n.fmDepth;
        mod.connect(modGain).connect(osc.frequency);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.22 * volume, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + n.dur);
        osc.connect(g).connect(dest);
        osc.start(t);
        mod.start(t);
        osc.stop(t + n.dur + 0.02);
        mod.stop(t + n.dur + 0.02);
      }
      return;
    }

    // Pombero: curva de frecuencia suave + vibrato + un poco de aire.
    const { duration, keys, vibrato } = pattern;
    const steps = 128;
    const curve = new Float32Array(steps);
    for (let i = 0; i < steps; i++) curve[i] = pomberoFreqAt(keys, (i / (steps - 1)) * duration);

    const osc = ctx.createOscillator();
    osc.frequency.setValueCurveAtTime(curve, t0, duration);
    const vib = ctx.createOscillator();
    vib.frequency.value = vibrato;
    const vibGain = ctx.createGain();
    vibGain.gain.value = 9;
    vib.connect(vibGain).connect(osc.frequency);

    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t0);
    env.gain.linearRampToValueAtTime(0.2 * volume, t0 + 0.25);
    env.gain.setValueAtTime(0.2 * volume, t0 + duration - 0.4);
    env.gain.linearRampToValueAtTime(0, t0 + duration);
    osc.connect(env).connect(dest);

    // Aire: ruido agudo muy bajito que acompaña al silbido humano.
    const air = this.noiseSource();
    air.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = "bandpass";
    hp.frequency.value = 2400;
    hp.Q.value = 0.8;
    const airGain = ctx.createGain();
    airGain.gain.setValueAtTime(0, t0);
    airGain.gain.linearRampToValueAtTime(0.025 * volume, t0 + 0.3);
    airGain.gain.linearRampToValueAtTime(0, t0 + duration);
    air.connect(hp).connect(airGain).connect(dest);

    for (const s of [osc, vib, air]) {
      s.start(t0);
      s.stop(t0 + duration + 0.05);
    }
  }

  /** Canto del pitogüé: "pi-to-güé". */
  private scheduleCall(t: number) {
    const notes: BirdNote[] = [
      { start: 0, dur: 0.09, f0: 2900, f1: 3100, fmRate: 40, fmDepth: 120 },
      { start: 0.16, dur: 0.09, f0: 2500, f1: 2600, fmRate: 40, fmDepth: 120 },
      { start: 0.32, dur: 0.32, f0: 3300, f1: 2200, fmRate: 45, fmDepth: 180 },
    ];
    this.scheduleWhistle({ kind: "pajaro", duration: 0.7, notes }, t, 0.3);
  }

  /** Chasquido de la hondita: golpe de ruido + "fiu" descendente. */
  private scheduleSlingshot(t: number) {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.noise;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1600;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    src.connect(bp).connect(g).connect(this.sfxBus!);
    src.start(t);
    src.stop(t + 0.1);

    const osc = ctx.createOscillator();
    osc.frequency.setValueAtTime(900, t + 0.03);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.25);
    const g2 = ctx.createGain();
    g2.gain.setValueAtTime(0.0001, t);
    g2.gain.linearRampToValueAtTime(0.1, t + 0.04);
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    osc.connect(g2).connect(this.sfxBus!);
    osc.start(t);
    osc.stop(t + 0.3);
  }
}

/** Instancia única compartida por toda la app. */
export const audio = new AudioEngine();
