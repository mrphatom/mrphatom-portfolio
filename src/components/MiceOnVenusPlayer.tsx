import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Music, Volume2, VolumeX, Disc, Sparkles, SkipBack, SkipForward, GripVertical, Maximize2 } from 'lucide-react';
import { playSoftClick, playNavTick } from '../utils/audio';

// Dynamic playlist containing same-origin self-healing proxy cache paths
const PLAYLIST = [
  {
    title: "Mice on Venus",
    artist: "C418",
    album: "Volume Alpha",
    url: "/api/music/mice-on-venus.mp3"
  },
  {
    title: "Sweden",
    artist: "C418",
    album: "Volume Alpha",
    url: "/api/music/sweden.mp3"
  },
  {
    title: "Aria Math",
    artist: "C418",
    album: "Volume Beta",
    url: "/api/music/aria-math.mp3"
  },
  {
    title: "Sunroof",
    artist: "Nicky Youre Ft. Dazy",
    album: "Sunroof - Single",
    url: "/api/music/sunroof.mp3"
  }
];

// Apple iOS Control Center style corner resizer brackets (glassy jelly-pill tactile look)
function GlassyCornerBracket() {
  return (
    <svg 
      viewBox="0 0 32 32" 
      className="w-9 h-9 pointer-events-none drop-shadow-[0_2.5px_5px_rgba(0,0,0,0.22)]"
    >
      {/* Thick dark underlying shadow for high contrast on light/dark backgrounds */}
      <path
        d="M 4,28 A 24,24 0 0,0 28,4"
        fill="none"
        stroke="rgba(0, 0, 0, 0.16)"
        strokeWidth="7"
        strokeLinecap="round"
        className="dark:stroke-black/40"
      />
      {/* Translucent white premium frosted-glass pill */}
      <path
        d="M 4,28 A 24,24 0 0,0 28,4"
        fill="none"
        stroke="rgba(255, 255, 255, 0.42)"
        strokeWidth="4.8"
        strokeLinecap="round"
        className="dark:stroke-white/20"
      />
      {/* Solid bright white 3D highlight inner edge */}
      <path
        d="M 5.5,26.5 A 21,21 0 0,0 26.5,5.5"
        fill="none"
        stroke="rgba(255, 255, 255, 0.85)"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="dark:stroke-white/45"
      />
    </svg>
  );
}

export default function MiceOnVenusPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.12); // Default sweet-spot background level
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sizing and state engine for Captain Glance Capsule
  const [glanceWidth, setGlanceWidth] = useState(220);
  const [glanceHeight, setGlanceHeight] = useState(44);
  const [isResizeMode, setIsResizeMode] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);

  // Safe manual position coordinate tracking for full drag control
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const positionRef = useRef({ x: 0, y: 0 });
  const playerElementRef = useRef<HTMLDivElement | null>(null);
  const dimensionsRef = useRef({ width: 220, height: 44 });
  const blockClickRef = useRef(false);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  useEffect(() => {
    dimensionsRef.current = { width: glanceWidth, height: glanceHeight };
  }, [glanceWidth, glanceHeight]);

  // Frame-calibrated unified pointer gesture manager for perfect dragging & iOS-style jiggle-free resizing
  useEffect(() => {
    let active = true;
    let cleanupFn: (() => void) | null = null;
    let longPressTimer: NodeJS.Timeout | null = null;

    const setupListeners = () => {
      const element = document.getElementById("MiceOnVenusPlayer");
      if (!element) {
        if (active) {
          requestAnimationFrame(setupListeners);
        }
        return;
      }

      let isPressed = false;
      let mode: 'idle' | 'possible' | 'dragging' | 'resizing' = 'idle';
      let startX = 0;
      let startY = 0;
      let startWidth = 220;
      let startHeight = 44;
      let startPosX = positionRef.current.x;
      let startPosY = positionRef.current.y;
      let pointerId = -1;

      const onPointerDown = (e: PointerEvent) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;

        isPressed = true;
        pointerId = e.pointerId;
        mode = 'possible';
        startX = e.clientX;
        startY = e.clientY;
        startWidth = dimensionsRef.current.width;
        startHeight = dimensionsRef.current.height;
        startPosX = positionRef.current.x;
        startPosY = positionRef.current.y;
        setIsInteracting(true);

        try {
          element.setPointerCapture(e.pointerId);
        } catch (err) {}

        longPressTimer = setTimeout(() => {
          if (mode === 'possible' && !isExpanded) {
            mode = 'resizing';
            setIsResizeMode(true);
            playSoftClick();
          }
        }, 500);

        blockClickRef.current = false;
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!isPressed || e.pointerId !== pointerId) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (mode === 'possible') {
          if (Math.sqrt(dx * dx + dy * dy) > 6) {
            if (longPressTimer) {
              clearTimeout(longPressTimer);
              longPressTimer = null;
            }
            mode = 'dragging';
          }
        }

        if (mode === 'dragging') {
          setPosition({
            x: startPosX + dx,
            y: startPosY + dy,
          });
        } else if (mode === 'resizing') {
          // Dynamic stretch logic optimized for touch screen and cursors alike
          const newWidth = Math.max(140, Math.min(320, startWidth + dx));
          const newHeight = Math.max(38, Math.min(100, startHeight + dy));
          setGlanceWidth(newWidth);
          setGlanceHeight(newHeight);
        }
      };

      const onPointerUp = (e: PointerEvent) => {
        if (!isPressed || e.pointerId !== pointerId) return;

        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }

        try {
          element.releasePointerCapture(e.pointerId);
        } catch (err) {}

        const finalMode = mode;
        isPressed = false;
        pointerId = -1;
        mode = 'idle';
        setIsInteracting(false);

        if (finalMode === 'resizing' || finalMode === 'dragging') {
          if (finalMode === 'resizing') {
            setIsResizeMode(false);
            playSoftClick();
          }

          blockClickRef.current = true;
          setTimeout(() => {
            blockClickRef.current = false;
          }, 150);
        }
      };

      const onPointerCancel = (e: PointerEvent) => {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
        try {
          element.releasePointerCapture(e.pointerId);
        } catch (err) {}
        isPressed = false;
        pointerId = -1;
        mode = 'idle';
        setIsResizeMode(false);
        setIsInteracting(false);
      };

      element.addEventListener('pointerdown', onPointerDown);
      element.addEventListener('pointermove', onPointerMove);
      element.addEventListener('pointerup', onPointerUp);
      element.addEventListener('pointercancel', onPointerCancel);

      cleanupFn = () => {
        element.removeEventListener('pointerdown', onPointerDown);
        element.removeEventListener('pointermove', onPointerMove);
        element.removeEventListener('pointerup', onPointerUp);
        element.removeEventListener('pointercancel', onPointerCancel);
      };
    };

    setupListeners();

    return () => {
      active = false;
      if (cleanupFn) cleanupFn();
      if (longPressTimer) clearTimeout(longPressTimer);
    };
  }, [isExpanded]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barsRef = useRef<HTMLDivElement[]>([]);

  const currentTrack = PLAYLIST[currentTrackIndex];

  // Initialize unified persistent Audio playback safely
  useEffect(() => {
    const audio = new Audio();
    audio.loop = false;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      // Flow freely from Mice -> Sweden -> Aria Math -> Sunroof -> Repeat (all over again)
      setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
      setIsPlaying(true);
    };

    const handleError = (e: ErrorEvent | Event) => {
      console.warn("Audio stream encountered an issue or CORS limitation. Self-healing by transitioning to the next track...", e);
      // Automatically skip forward to recover and preserve background ambiance
      setTimeout(() => {
        setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
        setIsPlaying(true);
      }, 400);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, []);

  // Synchronize Audio properties & play/pause state reactively with zero lag
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Resolve URL comparison safely
    const resolvedUrl = currentTrack.url.startsWith('/') 
      ? window.location.origin + currentTrack.url 
      : currentTrack.url;

    if (audio.src !== resolvedUrl) {
      audio.pause();
      audio.src = currentTrack.url;
      audio.load();
    }

    // Sync volume level
    audio.volume = isMuted ? 0 : volume;

    if (isPlaying) {
      audio.play().catch((err) => {
        console.log("Audio play deferred or waiting for user interaction:", err);
      });
    } else {
      audio.pause();
    }
  }, [currentTrackIndex, isPlaying]);

  // Sync volume state properties dynamically
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Safe gesture capture for initial stream launch compatibility
  useEffect(() => {
    const triggerInteractiveLaunch = () => {
      const audio = audioRef.current;
      if (audio && !isPlaying) {
        audio.play()
          .then(() => {
            setIsPlaying(true);
            window.removeEventListener('click', triggerInteractiveLaunch);
            window.removeEventListener('touchstart', triggerInteractiveLaunch);
          })
          .catch((err) => {
            console.log("Autoplay background pending user gesture.", err);
          });
      }
    };

    const delayTimer = setTimeout(() => {
      triggerInteractiveLaunch();
    }, 1200);

    window.addEventListener('click', triggerInteractiveLaunch);
    window.addEventListener('touchstart', triggerInteractiveLaunch);

    return () => {
      clearTimeout(delayTimer);
      window.removeEventListener('click', triggerInteractiveLaunch);
      window.removeEventListener('touchstart', triggerInteractiveLaunch);
    };
  }, []);

  // 60FPS high-speed micro rendering animation frame loop
  useEffect(() => {
    let animationId: number;
    const animateVisualizer = () => {
      const waveSpeed = isPlaying ? 0.007 : 0.0016;
      const waveTime = Date.now() * waveSpeed;
      for (let i = 0; i < 16; i++) {
        const depthMultiplier = isPlaying ? 1.0 : 0.12;
        const sinFactor = Math.sin(waveTime + i * 0.38) * 38;
        const cosFactor = Math.cos(waveTime - i * 0.26) * 28;
        const finalHeight = 12 + Math.max(0, (sinFactor + cosFactor + 38) * depthMultiplier);
        if (barsRef.current[i]) {
          barsRef.current[i].style.height = `${Math.min(100, Math.max(8, finalHeight))}%`;
        }
      }

      animationId = requestAnimationFrame(animateVisualizer);
    };

    animateVisualizer();
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPlaying]);

  const togglePlayback = () => {
    playSoftClick();
    setIsPlaying(!isPlaying);
  };

  const handleNextTrack = () => {
    playNavTick();
    const nextIndex = (currentTrackIndex + 1) % PLAYLIST.length;
    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);
  };

  const handlePrevTrack = () => {
    playNavTick();
    const prevIndex = (currentTrackIndex - 1 + PLAYLIST.length) % PLAYLIST.length;
    setCurrentTrackIndex(prevIndex);
    setIsPlaying(true);
  };

  const handleMuteToggle = () => {
    playSoftClick();
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (isMuted && val > 0) {
      setIsMuted(false);
    }
  };

  const handleProgressChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current || duration === 0) return;
    const progressPercent = parseFloat(e.target.value) / 100;
    audioRef.current.currentTime = progressPercent * duration;
    setCurrentTime(audioRef.current.currentTime);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '0:00';
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const constraintsRef = useRef<HTMLDivElement>(null);

  // Resize Drag Handling for glance capsule (resembles Apple CC modules)
  // Helper selectors for dynamic UI density
  const isCompact = glanceWidth < 185;
  const isExtended = glanceWidth >= 240;

  return (
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[9999] select-none">
      <div
        id="MiceOnVenusPlayer"
        ref={playerElementRef}
        className={`absolute bottom-6 left-6 pointer-events-auto select-none touch-none ${
          isResizeMode ? 'cursor-default animate-none' : 'cursor-grab active:cursor-grabbing'
        }`}
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: isResizeMode ? 'none' : 'transform 0.08s ease-out'
        }}
      >
        {/* Apple iOS-Style Glassy Bracket Handles hugging corners perfectly */}
        {isResizeMode && !isExpanded && (
          <>
            {/* Bottom-Left Glassy Bracket */}
            <div className="absolute left-[-6px] bottom-[-6px] pointer-events-none scale-x-[-1] z-[9999]">
              <GlassyCornerBracket />
            </div>
            {/* Bottom-Right Glassy Bracket */}
            <div className="absolute right-[-6px] bottom-[-6px] pointer-events-none z-[9999]">
              <GlassyCornerBracket />
            </div>
          </>
        )}

        <AnimatePresence>
          {!isExpanded ? (
            /* MINIMIZED CAPTAIN GLANCE CAPSULE */
            <motion.div
              key="minimized"
              layoutId="mice-player-container"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ 
                opacity: 1, 
                scale: 1
              }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 24,
                mass: 0.8
              }}
              onClick={(e) => {
                // If clicked, but was actually executing or block is active, do nothing
                if (blockClickRef.current) {
                  e.stopPropagation();
                  e.preventDefault();
                  return;
                }
                if (isResizeMode) return;
                playNavTick();
                setIsExpanded(true);
              }}
              className={`flex items-center justify-between border bg-white/75 dark:bg-black/50 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.4)] group overflow-hidden select-none relative touch-none
                ${isResizeMode 
                  ? 'resize-mode-active border-zinc-400 dark:border-zinc-700 py-2.5 pl-3 pr-2.5 shadow-md shadow-black/10' 
                  : 'border-zinc-200/50 dark:border-zinc-850/80 py-2.5 pl-3.5 pr-4 hover:border-zinc-350 dark:hover:border-zinc-700 transition-all duration-300'
                }`}
              style={{ 
                width: `${glanceWidth}px`, 
                height: `${glanceHeight}px`,
                borderRadius: '22px',
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.16 }}
                className="flex items-center justify-between w-full h-full"
              >
                {/* Left Item: Vinyl Cover Container */}
                <div className="flex items-center gap-2.5 select-none shrink-0 h-full">
                  <div className="relative flex items-center justify-center">
                    {isPlaying ? (
                      <motion.div
                        animate={isResizeMode ? {} : { rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                        className="w-7 h-7 bg-zinc-900 dark:bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-md relative"
                      >
                        <Disc size={13} className="text-white dark:text-zinc-950" />
                        <div className="absolute w-1.5 h-1.5 rounded-full bg-zinc-350 dark:bg-zinc-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </motion.div>
                    ) : (
                      <div className="w-7 h-7 bg-zinc-100 dark:bg-white/[0.04] rounded-full flex items-center justify-center text-zinc-500 border border-zinc-200/30 dark:border-white/[0.03]">
                        <Music size={12} className="group-hover:animate-bounce" />
                      </div>
                    )}
   
                    {/* Micro sound feedback meter - Frozen/Static when resizing for maximal UI performance */}
                    {isPlaying && !isResizeMode && (
                      <div className="absolute -bottom-1 -right-1 flex gap-[1.5px] items-end h-3 px-1 rounded-sm bg-[#000000d0] dark:bg-white/10 backdrop-blur-xs scale-85">
                        <motion.span animate={{ height: [2, 10, 4, 8, 2] }} transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }} className="w-[1.5px] bg-[#0a84ff] rounded-xs" />
                        <motion.span animate={{ height: [4, 6, 11, 4, 4] }} transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }} className="w-[1.5px] bg-[#0a84ff] rounded-xs" />
                      </div>
                    )}
                  </div>
   
                  {/* Info Metadata Block (Hides intelligently if resized super small/compact) */}
                  {!isCompact && (
                    <div className="flex flex-col items-start text-left select-none max-w-[120px] truncate">
                      <span className="text-[9px] font-mono tracking-widest text-zinc-400 dark:text-zinc-500 uppercase font-semibold flex items-center gap-1 leading-none">
                        BG Music
                        <Sparkles size={8} className="text-amber-500/80" />
                      </span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-250 truncate mt-[2px] leading-tight">
                        {isPlaying ? currentTrack.title : "Quiet Mode"}
                      </span>
                    </div>
                  )}
                </div>
   
                {/* Dynamic Island Apple-style controls (Revealed only if sized wide / extended) */}
                {isExtended && (
                  <div 
                    className="flex items-center gap-2 shrink-0 select-none mr-2 pl-2 border-l border-zinc-200/40 dark:border-zinc-800/60 h-full"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={togglePlayback}
                      className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-white/[0.05] text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                      title={isPlaying ? "Pause" : "Play"}
                    >
                      {isPlaying ? <Pause size={10} fill="currentColor" /> : <Play size={10} fill="currentColor" />}
                    </button>
                    <button
                      onClick={handleNextTrack}
                      className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-white/[0.05] text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                      title="Skip Forward"
                    >
                      <SkipForward size={10} fill="currentColor" />
                    </button>
                  </div>
                )}
   
                {/* Resize Mode active state indicator badge */}
                {isResizeMode ? (
                  <div 
                    className="w-5 h-7 rounded-md flex items-center justify-center shrink-0 text-blue-500 select-none pr-0.5 animate-pulse"
                    title="Long press and drag screen to resize dynamically"
                  >
                    <GripVertical size={13} className="opacity-80" />
                  </div>
                ) : (
                  /* Tiny indicator hint on hover to notice expandability */
                  <div className="hidden group-hover:block absolute right-2 text-zinc-400 opacity-60 pointer-events-none transition-all scale-75">
                    <Maximize2 size={10} />
                  </div>
                )}
              </motion.div>
            </motion.div>
          ) : (
            /* EXPANDED DELIGHTFUL CONTROLLER GLASS HUD */
            <motion.div
              key="expanded"
              layoutId="mice-player-container"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 24,
                mass: 0.8
              }}
              className="p-4 pt-3.5 border border-zinc-200/60 dark:border-zinc-850/70 bg-white/80 dark:bg-[#0c0c0c]/85 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.6)] relative overflow-hidden group"
              style={{
                width: '288px',
                borderRadius: '16px'
              }}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {/* Fine decoration lines representing tape/retro design grid */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/10 via-amber-500/15 to-emerald-500/10 animate-pulse" />

                {/* Centered micro drag handle for intuitive affordance (Apple style) */}
                <div className="w-8 h-1 rounded-full bg-zinc-350 dark:bg-zinc-800 mx-auto mb-2 opacity-60 group-hover:opacity-100 transition-opacity" />

                {/* Header: Track metadata */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <motion.div
                      animate={isPlaying ? { rotate: 360 } : {}}
                      transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                      className="w-9 h-9 bg-zinc-950 dark:bg-zinc-150 rounded-full flex items-center justify-center border border-zinc-800 dark:border-zinc-300 relative shadow-sm"
                    >
                      <Disc size={15} className="text-white dark:text-zinc-900" />
                      <div className="absolute w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    </motion.div>
                    <div className="flex flex-col font-sans">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 max-w-[150px] truncate leading-snug">
                        {currentTrack.title}
                      </h4>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono tracking-wider truncate max-w-[150px]">
                        {currentTrack.artist} • {currentTrack.album}
                      </p>
                    </div>
                  </div>

                  {/* Close / Collapse control */}
                  <button 
                    onClick={() => {
                      playNavTick();
                      setIsExpanded(false);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-white/[0.04] text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors cursor-pointer select-none"
                    aria-label="Minimize Player"
                  >
                    <span className="text-[10px] font-mono font-bold tracking-tight px-1 uppercase">Collapse</span>
                  </button>
                </div>

                {/* Real-Time and Procedural Hybrid Frequency Visualizer */}
                <div className="flex items-end justify-between gap-[3.5px] h-12 px-2 pb-1.5 pt-4 bg-zinc-50 dark:bg-zinc-900/40 rounded-xl mb-4 relative overflow-hidden select-none border border-zinc-150/50 dark:border-zinc-850/30">
                  <div className="absolute top-1 left-2 flex items-center gap-1 opacity-70">
                    <Sparkles size={8} className="text-blue-500 animate-pulse" />
                    <span className="text-[8px] font-mono font-bold tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
                      Spectrum Feedback {isPlaying ? "• Active" : "• Idle"}
                    </span>
                  </div>
                  <div className="flex items-end gap-[3.5px] justify-between w-full h-full pt-1">
                    {Array.from({ length: 16 }).map((_, idx) => (
                      <div
                        key={idx}
                        ref={(el) => { if (el) barsRef.current[idx] = el; }}
                        className="w-[10px] rounded-full bg-gradient-to-t from-blue-500 via-indigo-505 to-purple-400 dark:from-blue-600 dark:via-indigo-500 dark:to-purple-400 transition-all duration-75 relative group/bar"
                        style={{ height: '8%' }}
                      >
                        <div className="absolute -top-[3px] left-1/2 -translate-x-1/2 w-[3px] h-[3px] rounded-full bg-blue-300 dark:bg-purple-300 opacity-40" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Track Slider */}
                <div className="space-y-1 mb-4">
                  <input
                    type="range"
                    className="w-full h-[3px] rounded-full bg-zinc-200 dark:bg-zinc-800 accent-[#0a84ff] cursor-pointer outline-none appearance-none"
                    onClick={playSoftClick}
                    onChange={handleProgressChange}
                    onPointerDown={(e) => e.stopPropagation()}
                    value={progressPercent}
                    max={100}
                    min={0}
                    step={0.1}
                    aria-label="Track Progress"
                  />
                  <div className="flex justify-between text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Bottom Row: Controls + Volume */}
                <div className="flex items-center justify-between gap-3 pt-1">
                  {/* Transport Buttons: Playback with Next/Prev skip */}
                  <div className="flex items-center gap-1.5 flex-1 select-none">
                    <button
                      onClick={handlePrevTrack}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-white/[0.04] text-zinc-650 dark:text-zinc-300 transition-colors cursor-pointer"
                      title="Previous Track"
                    >
                      <SkipBack size={12} fill="currentColor" />
                    </button>
                    <button
                      onClick={togglePlayback}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="flex-1 py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1.5 border border-zinc-250 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 hover:bg-zinc-100 dark:hover:bg-white/[0.04] text-zinc-900 dark:text-white transition-all cursor-pointer font-semibold text-[11px]"
                    >
                      {isPlaying ? (
                        <>
                          <Pause size={10} fill="currentColor" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play size={10} fill="currentColor" className="ml-0.5" />
                          <span>Play</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleNextTrack}
                      onPointerDown={(e) => e.stopPropagation()}
                      className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-white/[0.04] text-zinc-650 dark:text-zinc-300 transition-colors cursor-pointer"
                      title="Next Track"
                    >
                      <SkipForward size={12} fill="currentColor" />
                    </button>
                  </div>

                  {/* Volume Capsule Control */}
                  <div 
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/10"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={handleMuteToggle}
                      className="text-zinc-500 hover:text-[#0a84ff] transition-colors cursor-pointer font-sans"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted || volume === 0 ? <VolumeX size={12} /> : <Volume2 size={12} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="0.4"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-14 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800 accent-[#0a84ff] cursor-pointer outline-none appearance-none font-sans"
                      title={`Volume: ${Math.round(volume * 100 * 2.5)}%`}
                      aria-label="Volume Slider"
                    />
                  </div>
                </div>

                {/* Playlist overview index hint helper */}
                <div className="flex justify-center items-center gap-1 mt-3">
                  {PLAYLIST.map((_, idx) => (
                    <span 
                      key={idx} 
                      className={`h-1 rounded-full transition-all duration-300 ${idx === currentTrackIndex ? 'w-3.5 bg-blue-500' : 'w-1 bg-zinc-300 dark:bg-zinc-800'}`} 
                    />
                  ))}
                </div>

                {/* Cozy hint text */}
                <p className="text-[8px] font-mono text-zinc-400 dark:text-zinc-600 text-center tracking-tight mt-1.5">
                  Drag any edge to move &bull; Vol is capped low
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
