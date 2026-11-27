let audioCtx: AudioContext | null = null;

function AudioCtor(): typeof AudioContext | undefined {
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  );
}

function context(): AudioContext | null {
  const Ctor = AudioCtor();
  if (!Ctor) return null;
  if (!audioCtx) audioCtx = new Ctor();
  return audioCtx;
}

/** Call inside the tap that starts or extends a rest. iOS only unlocks audio in that gesture. */
export function unlockAudio(): void {
  const ctx = context();
  if (!ctx) return;
  if (ctx.state === "suspended") void ctx.resume();
  const buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  try {
    source.start(0);
  } catch {
    /* already started */
  }
}

function tone(frequency: number, when: number, duration: number, peak: number): void {
  const ctx = audioCtx;
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(frequency, when);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(peak, when + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(when);
  osc.stop(when + duration + 0.02);
}

/** Soft confirmation when a rest starts. */
export function playStartTick(): void {
  const ctx = context();
  if (!ctx || ctx.state === "closed") return;
  const when = ctx.currentTime + 0.01;
  tone(660, when, 0.05, 0.035);
}

export function vibrateRestDone(): void {
  try {
    navigator.vibrate?.([180, 80, 180, 80, 240]);
  } catch {
    /* iOS and some browsers throw or ignore vibration */
  }
}

/** Three-note chime. Returns false if the audio device is still locked. */
export async function playEndChime(): Promise<boolean> {
  const ctx = context();
  if (!ctx) return false;
  if (ctx.state === "suspended") {
    try {
      await ctx.resume();
    } catch {
      return false;
    }
  }
  if (ctx.state !== "running") return false;
  const when = ctx.currentTime + 0.02;
  tone(784, when, 0.16, 0.2);
  tone(988, when + 0.22, 0.16, 0.2);
  tone(1175, when + 0.44, 0.22, 0.22);
  return true;
}
