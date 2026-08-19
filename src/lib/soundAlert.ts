"use client";

/** Short two-tone chime for in-app alerts, synthesized with WebAudio so no audio asset is needed. */
export function playAlertSound() {
  if (typeof window === "undefined") return;

  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();

    const playTone = (freq: number, startOffset: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const startTime = ctx.currentTime + startOffset;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    playTone(660, 0, 0.16);
    playTone(880, 0.12, 0.22);

    setTimeout(() => ctx.close().catch(() => {}), 600);
  } catch {
    // Autoplay policies can reject AudioContext without a prior user gesture - ignore.
  }
}