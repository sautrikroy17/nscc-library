// Web Audio API synthesizer — zero external dependencies
let _audioCtx = null;

function getCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

function playTone(freq, duration, type = 'sine', gainVal = 0.3) {
  try {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio not available — fail silently
  }
}

export function playScanBeep() {
  // Classic scan laser beep: rising chirp
  playTone(1200, 0.08, 'square', 0.15);
  setTimeout(() => playTone(1800, 0.08, 'square', 0.12), 60);
}

export function playSuccessChime() {
  // Three-note ascending major chord: C-E-G
  playTone(523, 0.25, 'sine', 0.25);
  setTimeout(() => playTone(659, 0.25, 'sine', 0.20), 120);
  setTimeout(() => playTone(784, 0.4, 'sine', 0.18), 240);
}

export function playErrorBeep() {
  // Low warning buzz
  playTone(180, 0.3, 'sawtooth', 0.2);
  setTimeout(() => playTone(120, 0.3, 'sawtooth', 0.15), 200);
}

export function playReturnChime() {
  // Softer success variant (return confirmed)
  playTone(784, 0.2, 'sine', 0.20);
  setTimeout(() => playTone(659, 0.3, 'sine', 0.15), 150);
}
