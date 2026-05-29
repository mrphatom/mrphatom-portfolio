// Creative high-fidelity Web Audio API tactile feedback synthesizer
let audioCtx: AudioContext | null = null;
let isMutedGlobal = true; // Muted by default per user requests

export function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

export function setGlobalMute(muted: boolean) {
  isMutedGlobal = muted;
  if (!muted) {
    initAudioContext();
  }
}

export function getGlobalMute(): boolean {
  return isMutedGlobal;
}

/**
 * Triggers an incredibly subtle, warm tactile click sound.
 * Designed to mimic high-end physical hardware (like premium haptic trackpads).
 */
export function playSoftClick() {
  if (isMutedGlobal) return;
  
  try {
    initAudioContext();
    if (!audioCtx || audioCtx.state === 'suspended') return;

    const now = audioCtx.currentTime;
    
    // Create oscillators and gain nodes
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'sine';
    
    // Frequency sweep: start low, decay pitch rapidly for a organic woody "pop" or smooth bump
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.04);

    // Dynamic bandpass filter to keep it extremely warm and airy
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(180, now);
    filter.Q.setValueAtTime(1.5, now);

    // Tiny gain envelope (ultra transient) to avoid audible pops or clipping
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.004); // peak volume extremely quiet
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045); // decay fully

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  } catch (error) {
    // Graceful catch for safe browsing environments
    console.debug('Haptic sound execution bypassed: ', error);
  }
}

/**
 * Play a slightly different, high-pitched metallic minimalist tick for navigation
 */
export function playNavTick() {
  if (isMutedGlobal) return;

  try {
    initAudioContext();
    if (!audioCtx || audioCtx.state === 'suspended') return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.035);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.015, now + 0.003); // ultra-soft, almost subliminal
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.045);
  } catch (error) {
    console.debug('Tactile tick sound bypassed: ', error);
  }
}

/**
 * Plays an organic mechanical/spooky digital static glitch sound effect,
 * mimicking a fleeting cyber apparition disrupting the circuitry.
 */
export function playPhantomGlitchSound() {
  if (isMutedGlobal) return;

  try {
    initAudioContext();
    if (!audioCtx || audioCtx.state === 'suspended') return;

    const now = audioCtx.currentTime;
    
    // Create oscillators and gain control
    const osc = audioCtx.createOscillator();
    const subOsc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    // Spooky digital sweep and stutter frequency curves
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, now);
    osc.frequency.linearRampToValueAtTime(220, now + 0.1);
    osc.frequency.setValueAtTime(45, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.28);

    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(32, now);
    subOsc.frequency.linearRampToValueAtTime(110, now + 0.28);

    // Bandpass sweep mimicking quick radio-dial friction
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.exponentialRampToValueAtTime(2300, now + 0.28);
    filter.Q.setValueAtTime(2.5, now);

    // Staccato flickering gain envelopes
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.018, now + 0.015);
    gain.gain.setValueAtTime(0.005, now + 0.08); // micro drop
    gain.gain.setValueAtTime(0.022, now + 0.1);  // glitch pulse peak
    gain.gain.setValueAtTime(0.002, now + 0.18);
    gain.gain.linearRampToValueAtTime(0.015, now + 0.22);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    osc.connect(filter);
    subOsc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    subOsc.start(now);
    
    osc.stop(now + 0.32);
    subOsc.stop(now + 0.32);
  } catch (error) {
    console.debug('Phantom glitch sound bypassed:', error);
  }
}

