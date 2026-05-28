import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Music, Volume2, VolumeX, Disc, Sparkles, SkipBack, SkipForward } from 'lucide-react';
import { playSoftClick, playNavTick } from '../utils/audio';

const PLAYLIST = [
  {
    title: "Mice on Venus",
    artist: "C418",
    album: "Volume Alpha",
    url: "https://dn721801.ca.archive.org/0/items/mice-on-venus-vinyl/Mice%20on%20Venus.mp3"
  },
  {
    title: "Sunroof",
    artist: "Nicky Youre Ft. Dazy",
    album: "Sunroof - Single",
    url: "https://files.cvaultx.com/wp-content/uploads/music/2023/01/Nicky_Youre_-_Sunroof_Ft_Dazy_CeeNaija.com_.mp3"
  }
];

export default function MiceOnVenusPlayer() {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.12); // Default soft low volume
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = PLAYLIST[currentTrackIndex];

  // Synchronize Audio instance when currentTrackIndex changes
  useEffect(() => {
    // If an audio instance already exists, stop and clean it up
    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(currentTrack.url);
    audio.loop = true;
    audio.volume = isMuted ? 0 : volume;
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleInterruption = () => {
      // Clean sync state interruption if paused externally or stream shifts
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('pause', handleInterruption);

    // If playback is active (or track switch triggered while playing), play the new track automatically
    if (isPlaying) {
      audio.play().catch((err) => {
        console.log("Autoplay blocked for track switch:", err);
        setIsPlaying(false);
      });
    }

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('pause', handleInterruption);
      audioRef.current = null;
    };
  }, [currentTrackIndex]);

  // Sync volume state changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Handle autoplay on initial mount or upon first user interaction gesture with the page
  useEffect(() => {
    const playAttempt = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            // Clean up interaction triggers once successfully activated
            window.removeEventListener('click', playAttempt);
            window.removeEventListener('touchstart', playAttempt);
          })
          .catch((err) => {
            console.log("Autoplay gesture fallback pending.", err);
          });
      }
    };

    // Attempt autoplay immediately with a smooth delayed intro
    const timer = setTimeout(() => {
      playAttempt();
    }, 1200);

    // Safe page interactive listeners to bypass security blocks seamlessly
    window.addEventListener('click', playAttempt);
    window.addEventListener('touchstart', playAttempt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', playAttempt);
      window.removeEventListener('touchstart', playAttempt);
    };
  }, []);

  const togglePlayback = () => {
    playSoftClick();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.log("Failed to play:", err);
        });
    }
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

  return (
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[9999] select-none">
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.12}
        dragMomentum={true}
        whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
        className="absolute bottom-6 left-6 pointer-events-auto select-none cursor-grab"
      >
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            /* MINIMIZED CAPTAIN CAPSULE */
            <motion.div
              key="minimized"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              whileHover={{ scale: 1.04 }}
              onClick={() => {
                playNavTick();
                setIsExpanded(true);
              }}
              className="flex items-center gap-3.5 pl-3.5 pr-4 py-2.5 rounded-full border border-zinc-200/50 dark:border-zinc-850/80 bg-white/75 dark:bg-black/50 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.4)] group transition-all"
            >
              <div className="relative flex items-center justify-center">
                {isPlaying ? (
                  /* Glowing Rotating Vinyl Badge */
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                    className="w-7 h-7 bg-zinc-900 dark:bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-md relative"
                  >
                    <Disc size={13} className="text-white dark:text-zinc-950" />
                    <div className="absolute w-1.5 h-1.5 rounded-full bg-zinc-350 dark:bg-zinc-500 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  </motion.div>
                ) : (
                  /* Steady static music icon holding note */
                  <div className="w-7 h-7 bg-zinc-100 dark:bg-white/[0.04] rounded-full flex items-center justify-center text-zinc-500 border border-zinc-200/30 dark:border-white/[0.03]">
                    <Music size={12} className="group-hover:animate-bounce" />
                  </div>
                )}

                {/* Little ambient live sound indicator bars */}
                {isPlaying && (
                  <div className="absolute -bottom-1 -right-1 flex gap-[1.5px] items-end h-3 px-1 rounded-sm bg-neutral-900/80 dark:bg-white/10 backdrop-blur-xs scale-85">
                    <motion.span animate={{ height: [2, 10, 4, 8, 2] }} transition={{ repeat: Infinity, duration: 1, ease: 'easeInOut' }} className="w-[1.5px] bg-[#0a84ff] rounded-xs" />
                    <motion.span animate={{ height: [4, 6, 11, 4, 4] }} transition={{ repeat: Infinity, duration: 0.8, ease: 'easeInOut' }} className="w-[1.5px] bg-[#0a84ff] rounded-xs" />
                    <motion.span animate={{ height: [2, 11, 3, 9, 2] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }} className="w-[1.5px] bg-[#0a84ff] rounded-xs" />
                  </div>
                )}
              </div>

              <div className="flex flex-col items-start text-left">
                <span className="text-[10px] font-mono tracking-widest text-zinc-400 dark:text-zinc-500 uppercase font-semibold flex items-center gap-1">
                  Background Music
                  <Sparkles size={8} className="text-amber-500/80" />
                </span>
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-250 truncate max-w-[110px]">
                  {isPlaying ? currentTrack.title : "Quiet Nostalgic"}
                </span>
              </div>
            </motion.div>
          ) : (
            /* EXPANDED DELIGHTFUL CONTROLLER GLASS HUD */
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ type: 'spring', damping: 20, stiffness: 220 }}
              className="w-72 p-4 pt-3.5 rounded-2xl border border-zinc-200/60 dark:border-zinc-850/70 bg-white/80 dark:bg-[#0c0c0c]/85 backdrop-blur-2xl shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_48px_rgba(0,0,0,0.6)] relative overflow-hidden group"
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
                  <div className="flex flex-col">
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

              {/* Simulated Live Audio Waves */}
              <div className="flex items-center justify-between h-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-md px-2.5 mb-3 select-none">
                <span className="text-[9px] font-mono font-medium text-zinc-400 dark:text-zinc-500">
                  {isPlaying ? "Ambient Loop" : "Idle"}
                </span>
                <div className="flex items-end gap-0.5 h-3">
                  <motion.span animate={{ height: isPlaying ? [2, 11, 4, 10, 2] : 2 }} transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }} className="w-[1.5px] bg-[#0a84ff] rounded-xs" />
                  <motion.span animate={{ height: isPlaying ? [3, 7, 12, 5, 3] : 2 }} transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }} className="w-[1.5px] bg-[#0a84ff] rounded-xs" />
                  <motion.span animate={{ height: isPlaying ? [2, 10, 3, 11, 2] : 2 }} transition={{ repeat: Infinity, duration: 1.3, ease: 'linear' }} className="w-[1.5px] bg-[#0a84ff] rounded-xs" />
                  <motion.span animate={{ height: isPlaying ? [4, 6, 9, 3, 4] : 2 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} className="w-[1.5px] bg-[#0a84ff] rounded-xs" />
                  <motion.span animate={{ height: isPlaying ? [2, 11, 4, 8, 2] : 2 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} className="w-[1.5px] bg-[#0a84ff] rounded-xs" />
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
                    className="text-zinc-500 hover:text-[#0a84ff] transition-colors cursor-pointer"
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
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
