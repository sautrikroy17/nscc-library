// Web Audio API synthesizer — zero external audio files
let _audioCtx = null;
let _soundLevel = parseInt(localStorage.getItem('librax_sound_level') ?? '2', 10);
if (isNaN(_soundLevel) || _soundLevel < 0 || _soundLevel > 2) {
  _soundLevel = localStorage.getItem('librax_sfx_enabled') === 'false' ? 0 : 2;
}
let _soundEnabled = _soundLevel > 0;

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
  return _soundLevel > 0;
}

export function getSoundLevel() {
  return _soundLevel; // 0 = Off, 1 = Soft, 2 = Normal
}

export function setSoundLevel(level) {
  _soundLevel = Math.max(0, Math.min(2, parseInt(level, 10) || 0));
  _soundEnabled = _soundLevel > 0;
  localStorage.setItem('librax_sound_level', _soundLevel.toString());
  localStorage.setItem('librax_sfx_enabled', _soundEnabled ? 'true' : 'false');
  if (_soundEnabled) {
    playClick();
  }
  return _soundLevel;
}

export function setSoundEnabled(enabled) {
  return setSoundLevel(enabled ? 2 : 0);
}

export function toggleSound() {
  // Cycle between 0 (Muted) and 2 (Normal), or 0 -> 1 -> 2
  const nextLevel = _soundLevel === 0 ? 2 : 0;
  return setSoundLevel(nextLevel);
}

export function cycleSoundLevel() {
  const next = (_soundLevel + 1) % 3;
  return setSoundLevel(next);
}

function playTone(freq, duration, type = 'sine', gainVal = 0.25) {
  if (_soundLevel === 0) return;
  try {
    const ctx = getCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    // Scale gain by sound level (Level 1: 50% volume, Level 2: 100% volume)
    const multiplier = _soundLevel === 1 ? 0.45 : 1.0;
    const scaledGain = gainVal * multiplier;
    gain.gain.setValueAtTime(scaledGain, ctx.currentTime);
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

