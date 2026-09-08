// Web Audio API synthesizer — zero external audio files
let _audioCtx = null;
let _soundEnabled = localStorage.getItem('librax_sfx_enabled') !== 'false';

function getCtx() {
  if (!_audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      _audioCtx = new AudioContextClass();
    }
  }
  if (_audioCtx && _audioCtx.state === 'suspended') {
    _audioCtx.resume();
  }
  return _audioCtx;
}

export function isSoundEnabled() {
  return _soundEnabled;
}

export function setSoundEnabled(enabled) {
  _soundEnabled = !!enabled;
  localStorage.setItem('librax_sfx_enabled', _soundEnabled ? 'true' : 'false');
  if (_soundEnabled) {
    playClick();
  }
}

export function toggleSound() {
  setSoundEnabled(!_soundEnabled);
  return _soundEnabled;
}

function playTone(freq, duration, type = 'sine', gainVal = 0.25) {
  if (!_soundEnabled) return;
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    // Audio context not allowed or unsupported
  }
}

export function playClick() {
  // Ultra-tactile subtle micro-click
  playTone(850, 0.04, 'sine', 0.08);
}

export function playHover() {
  // Subtle soft blip
  playTone(600, 0.02, 'sine', 0.03);
}

export function playScanBeep() {
  // Classic scan laser beep: dual chirps
  playTone(1200, 0.07, 'square', 0.12);
  setTimeout(() => playTone(1850, 0.08, 'square', 0.10), 60);
}

export function playSuccessChime() {
  // Ascending crystal chord: C-E-G-C
  playTone(523, 0.22, 'sine', 0.20);
  setTimeout(() => playTone(659, 0.22, 'sine', 0.18), 100);
  setTimeout(() => playTone(784, 0.28, 'sine', 0.16), 200);
  setTimeout(() => playTone(1046, 0.40, 'sine', 0.15), 320);
}

export function playErrorBeep() {
  // Low synth alarm
  playTone(220, 0.25, 'sawtooth', 0.16);
  setTimeout(() => playTone(140, 0.35, 'sawtooth', 0.14), 160);
}

export function playReturnChime() {
  // Confirmation chord
  playTone(784, 0.18, 'sine', 0.18);
  setTimeout(() => playTone(880, 0.28, 'sine', 0.15), 110);
}

export function playMicStart() {
  // Rising futuristic chime for voice recording start
  playTone(550, 0.12, 'sine', 0.15);
  setTimeout(() => playTone(880, 0.18, 'sine', 0.18), 80);
}

export function playMicStop() {
  // Descending confirmation for voice recording end
  playTone(880, 0.12, 'sine', 0.15);
  setTimeout(() => playTone(550, 0.18, 'sine', 0.12), 80);
}

