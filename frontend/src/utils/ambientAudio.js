// Web Audio API Ambient Sound Generator — 100% Client Synthesized, 0MB Assets
let audioCtx = null;
let activeNodes = {};

function getContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Generate White Noise Buffer (5 seconds looped)
function createNoiseBuffer(ctx) {
  const bufferSize = ctx.sampleRate * 5;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

// 1. Rain Generator (Filtered Pink Noise with Resonance)
export function startRain(volume = 0.3) {
  stopSound('rain');
  const ctx = getContext();
  if (!ctx) return;

  const noiseBuffer = createNoiseBuffer(ctx);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;

  // Dual filters for realistic rainfall on glass
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(900, ctx.currentTime);

  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.setValueAtTime(150, ctx.currentTime);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(volume * 0.4, ctx.currentTime + 1.2);

  noiseSource.connect(lowpass);
  lowpass.connect(highpass);
  highpass.connect(gainNode);
  gainNode.connect(ctx.destination);

  noiseSource.start();
  activeNodes['rain'] = { source: noiseSource, gain: gainNode };
}

// 2. 432Hz Alpha Waves / Cosmic Focus Drone
export function startBinauralAlpha(volume = 0.3) {
  stopSound('alpha');
  const ctx = getContext();
  if (!ctx) return;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const sub = ctx.createOscillator();

  // 108Hz Fundamental + 8Hz Alpha differential
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(108, ctx.currentTime);

  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(116, ctx.currentTime);

  sub.type = 'triangle';
  sub.frequency.setValueAtTime(54, ctx.currentTime);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(volume * 0.25, ctx.currentTime + 1.5);

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  sub.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc1.start();
  osc2.start();
  sub.start();

  activeNodes['alpha'] = { 
    source: { stop: () => { osc1.stop(); osc2.stop(); sub.stop(); } }, 
    gain: gainNode 
  };
}

// 3. Fireplace / Cozy Hearth (Warm Low Hum with Flutter)
export function startFireplace(volume = 0.3) {
  stopSound('fire');
  const ctx = getContext();
  if (!ctx) return;

  const noiseBuffer = createNoiseBuffer(ctx);
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(320, ctx.currentTime);

  const gainNode = ctx.createGain();
  gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(volume * 0.5, ctx.currentTime + 1.2);

  noiseSource.connect(lowpass);
  lowpass.connect(gainNode);
  gainNode.connect(ctx.destination);

  noiseSource.start();
  activeNodes['fire'] = { source: noiseSource, gain: gainNode };
}

export function stopSound(soundKey) {
  if (activeNodes[soundKey]) {
    try {
      const { source, gain } = activeNodes[soundKey];
      if (audioCtx && gain) {
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.5);
      }
      setTimeout(() => {
        try { source.stop(); } catch (e) {}
      }, 500);
    } catch (e) {}
    delete activeNodes[soundKey];
  }
}

export function stopAllAmbient() {
  Object.keys(activeNodes).forEach(stopSound);
}

// 4. Zen Study Gong / Tibetan Bowl completion chime
export function playZenBowlChime() {
  const ctx = getContext();
  if (!ctx) return;

  const freqs = [384, 576, 768, 1152];
  freqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const initialGain = 0.15 / (idx + 1);
    gain.gain.setValueAtTime(initialGain, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 3.8);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 3.8);
  });
}
