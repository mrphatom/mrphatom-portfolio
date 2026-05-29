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
 * Plays an organic mechanical/spooky digital static glitch sound effect of multiple randomized patterns.
 * Ensures every single trigger feels distinctive, unique, and unpredictable.
 */
export function playPhantomGlitchSound() {
  if (isMutedGlobal) return;

  try {
    initAudioContext();
    if (!audioCtx || audioCtx.state === 'suspended') return;

    const now = audioCtx.currentTime;
    
    // Choose one of three highly customized algorithmic glitch formulas
    const glitchSelection = Math.floor(Math.random() * 3);

    if (glitchSelection === 0) {
      // 1. Deep Sub Stutter & Low Frequency Digital Corruption rumble
      const osc = audioCtx.createOscillator();
      const subOsc = audioCtx.createOscillator();
      const noiseGain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(45, now);
      osc.frequency.setValueAtTime(90, now + 0.1);
      osc.frequency.setValueAtTime(30, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.35);

      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(32, now);
      subOsc.frequency.linearRampToValueAtTime(120, now + 0.35);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);
      filter.frequency.exponentialRampToValueAtTime(1200, now + 0.35);

      noiseGain.gain.setValueAtTime(0.0, now);
      noiseGain.gain.linearRampToValueAtTime(0.045, now + 0.02);
      noiseGain.gain.setValueAtTime(0.015, now + 0.12);
      // Rapid stutter on / off
      noiseGain.gain.setValueAtTime(0.038, now + 0.15);
      noiseGain.gain.setValueAtTime(0.002, now + 0.22);
      noiseGain.gain.linearRampToValueAtTime(0.025, now + 0.28);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      osc.connect(filter);
      subOsc.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + 0.4);
      subOsc.stop(now + 0.4);

    } else if (glitchSelection === 1) {
      // 2. High Laser Sweep & High-Freq Static Dial friction
      const osc = audioCtx.createOscillator();
      const squareOsc = audioCtx.createOscillator();
      const noiseGain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1200, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);

      squareOsc.type = 'square';
      squareOsc.frequency.setValueAtTime(250, now);
      squareOsc.frequency.setValueAtTime(800, now + 0.08);
      squareOsc.frequency.setValueAtTime(1400, now + 0.18);
      squareOsc.frequency.exponentialRampToValueAtTime(50, now + 0.28);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.28);
      filter.Q.setValueAtTime(4.0, now);

      noiseGain.gain.setValueAtTime(0.0, now);
      noiseGain.gain.linearRampToValueAtTime(0.012, now + 0.015);
      noiseGain.gain.setValueAtTime(0.003, now + 0.1);
      noiseGain.gain.setValueAtTime(0.015, now + 0.15);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

      osc.connect(filter);
      squareOsc.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(audioCtx.destination);

      osc.start(now);
      squareOsc.start(now);
      osc.stop(now + 0.32);
      squareOsc.stop(now + 0.32);

    } else {
      // 3. Erratic Cyber Bleeps & Computer System Corruption Stutter
      const gainNode = audioCtx.createGain();
      gainNode.connect(audioCtx.destination);

      // We trigger a sequence of multiple super short bleep events
      const count = 7;
      for (let i = 0; i < count; i++) {
        const toneTime = now + (i * 0.05);
        if (toneTime >= now + 0.4) break;

        const beepOsc = audioCtx.createOscillator();
        const beepGain = audioCtx.createGain();

        // Alternate waves and chaotic frequencies
        beepOsc.type = i % 2 === 0 ? 'sine' : 'triangle';
        const randomFreq = 300 + Math.random() * 900;
        beepOsc.frequency.setValueAtTime(randomFreq, toneTime);
        beepOsc.frequency.exponentialRampToValueAtTime(randomFreq / 2, toneTime + 0.04);

        beepGain.gain.setValueAtTime(0.0, toneTime);
        beepGain.gain.linearRampToValueAtTime(0.018, toneTime + 0.005);
        beepGain.gain.exponentialRampToValueAtTime(0.0001, toneTime + 0.045);

        beepOsc.connect(beepGain);
        beepGain.connect(gainNode);

        beepOsc.start(toneTime);
        beepOsc.stop(toneTime + 0.05);
      }
    }
  } catch (error) {
    console.debug('Phantom glitch sound bypassed:', error);
  }
}

