import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Compass, Sparkles, RefreshCcw, Home, HelpCircle } from 'lucide-react';
import { playSoftClick, playNavTick } from '../utils/audio';
import { triggerHaptic } from '../utils/haptics';

interface NotFoundProps {
  onGoHome: () => void;
  darkMode: boolean;
}

interface SandboxItem {
  id: number;
  label: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
  color: string;
}

export default function NotFound({ onGoHome, darkMode }: NotFoundProps) {
  const [items, setItems] = useState<SandboxItem[]>([]);
  const [clickCount, setClickCount] = useState(0);

  // Generate some playful drifting fragments in the gravity sandbox on mount
  useEffect(() => {
    const labels = [
      '404', 'Lost Coordinate', 'Zero Gravity', 'Muted SFX', 'React 19', 
      'Vite 6', 'Inter Font', 'Empty Space', 'Star Dust', 'Gemini AI', 'Haptics'
    ];
    
    const colors = [
      'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800',
      'bg-red-500/10 text-red-650 dark:text-red-400 border-red-200/50 dark:border-red-900/45',
      'bg-blue-500/10 text-blue-650 dark:text-blue-400 border-blue-200/50 dark:border-blue-900/45',
      'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-900/45',
      'bg-amber-500/10 text-amber-650 dark:text-amber-400 border-amber-200/50 dark:border-amber-900/45',
    ];

    const generated: SandboxItem[] = labels.map((label, idx) => {
      // Create random start coordinates and rotations
      const xRange = (idx % 3 - 1) * 80;
      const yRange = Math.floor(idx / 3 - 1.5) * 45;
      return {
        id: idx,
        label,
        x: xRange + (Math.random() * 20 - 10),
        y: yRange + (Math.random() * 20 - 10),
        rotate: Math.random() * 24 - 12,
        scale: 0.9 + Math.random() * 0.2,
        color: colors[idx % colors.length]
      };
    });

    setItems(generated);
  }, []);

  const handleDragStart = () => {
    playSoftClick();
    triggerHaptic(8);
  };

  const handleDragEnd = () => {
    playNavTick();
    triggerHaptic(12);
  };

  const handlePlayfulClick = () => {
    setClickCount(prev => prev + 1);
    playSoftClick();
    triggerHaptic(15);
  };

  return (
    <div className="w-full min-h-[85vh] lg:h-full flex flex-col justify-center items-center py-12 px-6 sm:px-10 lg:px-16 text-center select-none overflow-hidden relative">
      {/* Background Starfield Grid Flare */}
      <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] dark:bg-[radial-gradient(#18181b_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-70 pointer-events-none z-0" />

      {/* Playful Glowing Coordinates Compass */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, rotate: -30 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mb-8 flex justify-center items-center h-20 w-20 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/40 backdrop-blur-md shadow-xs cursor-pointer group"
        onClick={handlePlayfulClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Compass className="h-10 w-10 text-zinc-900 dark:text-zinc-50 stroke-[1.25] group-hover:rotate-180 transition-transform duration-700 ease-out" />
        <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      </motion.div>

      {/* Editorial Typographical Error Frame */}
      <div className="space-y-4 max-w-xl relative z-10 mb-10">
        <h2 className="text-7xl sm:text-8xl font-display font-black tracking-tighter text-zinc-900 dark:text-white flex items-center justify-center gap-2 select-none">
          <motion.span
            animate={{ 
              y: [0, -6, 0],
              rotate: [0, -3, 0]
            }}
            transition={{ 
              duration: 2.5, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            4
          </motion.span>
          <motion.span
            animate={{ 
              y: [0, 6, 0],
              scale: [1, 0.94, 1]
            }}
            transition={{ 
              duration: 2.8, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="text-red-500 font-mono"
          >
            0
          </motion.span>
          <motion.span
            animate={{ 
              y: [0, -4, 0],
              rotate: [0, 4, 0]
            }}
            transition={{ 
              duration: 2.2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          >
            4
          </motion.span>
        </h2>

        <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-md mx-auto leading-relaxed font-sans font-light">
          The coordinates <span className="font-mono text-zinc-900 dark:text-zinc-200 font-medium px-1 bg-zinc-150/40 dark:bg-zinc-900/60 rounded">"{window.location.pathname}"</span> do not exist in the current visual cosmos. You are currently drifting in deep unmapped navigation.
        </p>
      </div>

      {/* Physics Interactive Sandbox Wrapper */}
      <div className="w-full max-w-lg mb-10 p-5 rounded-2xl border border-zinc-200/50 dark:border-zinc-850/50 bg-zinc-50/25 dark:bg-[#0c0c0d]/30 backdrop-blur-xs relative min-h-[190px] flex flex-wrap justify-center items-center gap-2.5 overflow-hidden select-none z-10">
        <div className="absolute top-2 left-3 flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-mono font-bold text-zinc-400">
          <Sparkles size={10} className="text-amber-500 animate-pulse" />
          <span>Interactive Floating Sandbox (Drag Nodes!)</span>
        </div>

        {items.map((item) => (
          <motion.div
            key={item.id}
            drag
            dragConstraints={{ left: -140, right: 140, top: -70, bottom: 70 }}
            dragElastic={0.25}
            dragMomentum={true}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            whileDrag={{ scale: 1.1, cursor: 'grabbing', zIndex: 50, rotate: 0 }}
            initial={{ opacity: 0, scale: 0.1, rotate: item.rotate }}
            animate={{ 
              opacity: 1, 
              scale: item.scale,
              x: item.x,
              y: item.y
            }}
            transition={{ 
              type: 'spring',
              stiffness: 70,
              damping: 10,
              delay: item.id * 0.04
            }}
            className={`px-3 py-1.5 border rounded-full text-[11px] font-mono font-semibold tracking-wide cursor-grab select-none shadow-xs transition-shadow active:shadow-md ${item.color}`}
          >
            {item.label}
          </motion.div>
        ))}

        {clickCount > 0 && (
          <div className="absolute bottom-2 right-3 text-[8px] font-mono text-zinc-450 dark:text-zinc-555 uppercase tracking-wider animate-pulse">
            Gravity disturbances active ({clickCount})
          </div>
        )}
      </div>

      {/* Primary Action Button Suite to navigate back */}
      <div className="flex flex-col sm:flex-row gap-3.5 items-center justify-center relative z-20">
        <motion.button
          onClick={() => {
            playSoftClick();
            triggerHaptic(20);
            onGoHome();
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 transition-colors shadow-xs select-none cursor-pointer border border-zinc-900 dark:border-zinc-50"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Home size={13} />
          Return to Safe Orbit
        </motion.button>

        <motion.button
          onClick={() => {
            playNavTick();
            triggerHaptic(12);
            // Shake sandbox items by scrambling their coordinates
            setItems(prev => prev.map(item => ({
              ...item,
              x: (Math.random() * 160 - 80),
              y: (Math.random() * 80 - 40),
              rotate: Math.random() * 40 - 20
            })));
          }}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors select-none cursor-pointer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <RefreshCcw size={13} className="animate-[spin_4s_linear_infinite]" />
          Scramble Gravity
        </motion.button>
      </div>

      {/* Mini status indicator */}
      <div className="mt-12 text-[9px] uppercase tracking-widest font-mono text-zinc-400 dark:text-zinc-600 z-10 flex items-center justify-center gap-1.5">
        <HelpCircle size={10} />
        <span>System Diagnostics: Status 404 UNMAPPED_SECTOR</span>
      </div>
    </div>
  );
}
