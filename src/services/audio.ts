/**
 * Gentle synthesized bell / chime for prayer reminders & completed milestone audio feedback.
 * Uses native Web Audio API — works 100% offline with zero external audio assets.
 */

export function playGentleChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic bell frequencies (peaceful meditative tone, ~528Hz Solfeggio / E5)
    const freqs = [528, 1056, 1584];
    const gains = [0.18, 0.08, 0.03];

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(gains[i], now);
      // Gentle decay
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.8);
    });
  } catch {
    // AudioContext might be blocked until user gesture, safely ignore
  }
}

export function playSuccessChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Dual chime for "Mark as Completed" celebration
    const notes = [
      { freq: 440, delay: 0 },
      { freq: 554.37, delay: 0.12 },
      { freq: 659.25, delay: 0.24 },
    ];

    notes.forEach(({ freq, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);

      gain.gain.setValueAtTime(0.12, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + 0.8);
    });
  } catch {
    // ignore
  }
}
