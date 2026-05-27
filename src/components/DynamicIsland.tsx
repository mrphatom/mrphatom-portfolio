import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Monitor, ExternalLink, Code, FileDown, ChevronUp, Clock } from 'lucide-react';
import { playSoftClick, playNavTick } from '../utils/audio';
import { triggerHaptic as centralTriggerHaptic, hapticPatterns } from '../utils/haptics';

const PAGE_LOAD_TIME = Date.now();

interface DynamicIslandProps {
  island: {
    type: 'none' | 'theme' | 'redirect_prompt' | 'download_resume_prompt' | 'glance' | 'time_spent';
    themeMode?: 'light' | 'dark' | 'system';
    redirectUrl?: string;
    projectName?: string;
    minutesSpent?: number;
    targetName?: string;
  };
  onClose: () => void;
  onResumeConfirm?: () => void;
}

interface StackItem {
  id: string;
  type: 'none' | 'theme' | 'redirect_prompt' | 'download_resume_prompt' | 'glance' | 'time_spent';
  themeMode?: 'light' | 'dark' | 'system';
  redirectUrl?: string;
  projectName?: string;
  minutesSpent?: number;
  targetName?: string;
}

export default function DynamicIsland({ island, onClose, onResumeConfirm }: DynamicIslandProps) {
  if (island.type === 'none') return null;

  const [isHolding, setIsHolding] = useState(false);
  const [isBouncing, setIsBouncing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(140);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isLongPressed, setIsLongPressed] = useState(false);
  const [isTimeExpanded, setIsTimeExpanded] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const [stack, setStack] = useState<StackItem[]>([]);
  const [isRotating, setIsRotating] = useState(false);

  const pointerStartY = useRef<number | null>(null);
  const pointerStartX = useRef<number | null>(null);
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize stack of dynamic island cards whenever a new prop action fires
  useEffect(() => {
    if (island.type === 'none') {
      setStack([]);
      return;
    }

    const mainCard: StackItem = {
      id: `main_${island.type}_${island.projectName || ''}_${Date.now()}`,
      type: island.type,
      themeMode: island.themeMode,
      redirectUrl: island.redirectUrl,
      projectName: island.projectName,
      minutesSpent: island.minutesSpent,
      targetName: island.targetName
    };

    const timeSpentCard: StackItem = {
      id: 'time_spent_fallback',
      type: 'time_spent',
      minutesSpent: island.type === 'time_spent' ? (island.minutesSpent || 1) : Math.max(1, Math.floor((Date.now() - PAGE_LOAD_TIME) / 60000))
    };

    const connectProfileCard: StackItem = {
      id: 'connect_profile_fallback',
      type: 'glance',
      projectName: 'social',
      redirectUrl: 'https://linkedin.com',
      targetName: 'LinkedIn Profile'
    };

    // Form appropriate multi-layered deck structure following Samsung stack widgets design
    let initialLayers: StackItem[] = [];
    if (island.type === 'glance' && island.projectName === 'social') {
      // Standalone for 'Connect Profile' when no other glance state element is active
      initialLayers = [mainCard];
    } else if (island.type === 'time_spent') {
      initialLayers = [mainCard, connectProfileCard];
    } else {
      initialLayers = [mainCard, timeSpentCard, connectProfileCard];
    }

    setStack(initialLayers);
    setIsLongPressed(false);
    setIsTimeExpanded(false);
  }, [island]);

  // Rotate stacked card to the and bring the back element forward
  const rotateStack = () => {
    if (stack.length <= 1 || isRotating) return;
    setIsRotating(true);
    playSoftClick();
    triggerHaptic(20, true);

    setTimeout(() => {
      setStack((prev) => {
        if (prev.length <= 1) return prev;
        const [top, ...rest] = prev;
        return [...rest, top];
      });
      setIsRotating(false);
    }, 250);
  };

  // Live seconds tracking effect when island is shown as time_spent alert
  useEffect(() => {
    if (island.type !== 'time_spent') return;

    // Immediately set seconds elapsed to match current time
    setSecondsElapsed(Math.floor((Date.now() - PAGE_LOAD_TIME) / 1000));

    const interval = setInterval(() => {
      setSecondsElapsed(Math.floor((Date.now() - PAGE_LOAD_TIME) / 1000));
    }, 200);

    return () => clearInterval(interval);
  }, [island.type]);

  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    const pad = (num: number) => String(num).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  const clearLongPressRef = () => {
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }
  };

  // Trigger browser-based vibration haptic feedback (impact) via centralized utility
  const triggerHaptic = (ms: keyof typeof hapticPatterns | number = 12, dynamicScale = false) => {
    let finalMs: keyof typeof hapticPatterns | number = ms;
    if (typeof ms === 'number') {
      let calc = ms;
      if (dynamicScale && containerWidth > 140) {
        // Scale haptic duration dynamically based on containerWidth: maps wider states to higher vibration durations
        calc = ms + Math.floor((containerWidth - 140) / 10);
        // Cap at reasonable duration to maintain tactile click feel
        calc = Math.min(calc, 35);
      }
      finalMs = calc;
    }
    centralTriggerHaptic(finalMs);
  };

  // Add a beautifully balanced surface ripple relative to container coordinate space
  const addRipple = (clientX: number, clientY: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const newRipple = {
      id: Date.now() + Math.random(),
      x,
      y,
    };
    setRipples((prev) => [...prev, newRipple]);
  };

  const removeRipple = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsHolding(true);
    triggerHaptic(8, true); // Tiny haptic on initial touch down
    addRipple(e.clientX, e.clientY);
    pointerStartY.current = e.clientY;
    pointerStartX.current = e.clientX;

    // Start long-press detection ONLY if in glance mode
    if (island.type === 'glance') {
      longPressTimeoutRef.current = setTimeout(() => {
        playNavTick(); // nice premium physical tick/pop sound
        triggerHaptic(28, true); // distinctive success vibration for long-press trigger
        setIsLongPressed(true);
      }, 550); // 550ms for long-press action threshold
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsHolding(false);
    clearLongPressRef();
    if (pointerStartY.current !== null && pointerStartX.current !== null) {
      const deltaY = e.clientY - pointerStartY.current;
      const deltaX = e.clientX - pointerStartX.current;
      
      // If the user swiped upwards (deltaY negative) by more than 25px
      // and it was primarily a vertical swipe
      if (deltaY < -25 && Math.abs(deltaY) > Math.abs(deltaX)) {
        if (stack.length > 1) {
          rotateStack();
        } else {
          playSoftClick();
          triggerHaptic(22, true); // heavier dismiss vibration pulse
          onClose();
        }
        pointerStartY.current = null;
        pointerStartX.current = null;
        return;
      }
    }
    pointerStartY.current = null;
    pointerStartX.current = null;
  };

  const handlePointerCancelOrLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    // On touch devices, slight finger movement or physiological touch expansion causes pointerleave.
    // We avoid resetting the long-press detection parameters on touch pointer leaves to avoid jank.
    if (e.pointerType === 'touch') {
      setIsHolding(false);
      return;
    }
    setIsHolding(false);
    clearLongPressRef();
    pointerStartY.current = null;
    pointerStartX.current = null;
  };

  // Trigger a haptic feedback synchronized with the physical expansion whenever the state shifts to a larger module
  useEffect(() => {
    if (island.type === 'none') return;
    
    // Slight delay so the haptic triggers right as the spring system hits peak velocity/expansion
    const timer = setTimeout(() => {
      let baseMs = 12;
      if (island.type === 'redirect_prompt' || island.type === 'download_resume_prompt') {
        baseMs = 24; // Deeper vibration for substantial physical displacement of prompt modals
      } else if (island.type === 'time_spent') {
        baseMs = 16; // Moderate haptic for notification interval alerts
      }
      triggerHaptic(baseMs, true);
    }, 80);

    return () => clearTimeout(timer);
  }, [island.type]);

  // Monitor the actual rendered width of the dynamic island for adaptive spring math
  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(Math.round(entry.contentRect.width));
        }
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [island.type]);

  const handleCancel = (e: React.MouseEvent) => {
    addRipple(e.clientX, e.clientY);
    playSoftClick();
    triggerHaptic(10, true); // Subtle cancel vibration pulse
    onClose();
  };

  const handleProceed = (e: React.MouseEvent) => {
    addRipple(e.clientX, e.clientY);
    playSoftClick(); // Subtle click sound trigger for button engagement
    triggerHaptic(18, true); // Defined success pulse
    setIsBouncing(true);
    setTimeout(() => {
      if (island.projectName === 'resume') {
        if (onResumeConfirm) {
          onResumeConfirm();
        }
      } else if (island.redirectUrl) {
        window.open(island.redirectUrl, '_blank', 'noopener,noreferrer');
      }
      onClose();
      setIsBouncing(false);
    }, 450); // timing for rich physical pop animation before resolving
  };

  const handleDownload = (e: React.MouseEvent) => {
    addRipple(e.clientX, e.clientY);
    playSoftClick(); // Subtle click sound trigger for button engagement
    triggerHaptic(12, true); // Subtle vibration pulse for Download button click
    setIsBouncing(true);
    setTimeout(() => {
      if (onResumeConfirm) {
        onResumeConfirm();
      }
      onClose();
      setIsBouncing(false);
    }, 450); // timing for rich physical pop animation before resolving
  };

  // Select border radius based on active island category
  const getBorderRadius = () => {
    if (island.type === 'theme' || (island.type === 'glance' && !isLongPressed) || (island.type === 'time_spent' && !isTimeExpanded)) return '32px';
    return '28px'; // Smooth squircle corner radius for prompts
  };

  const renderCardInnerContent = (item: StackItem, isTop: boolean) => {
    const isInteractive = isTop;

    return (
      <React.Fragment>
        {item.type === 'theme' && (
          <div 
            className="flex items-center gap-2.5 px-6 py-3.5 text-xs font-semibold tracking-wide font-sans whitespace-nowrap text-white/90"
          >
            {item.themeMode === 'system' ? (
              <>
                <div className="p-1 rounded-full bg-white/[0.12] text-blue-400">
                  <Monitor size={12} className="stroke-[2.5]" />
                </div>
                <span>System Synced</span>
              </>
            ) : item.themeMode === 'dark' ? (
              <>
                <div className="p-1 rounded-full bg-white/[0.12] text-amber-300">
                  <Moon size={12} className="stroke-[2.5]" />
                </div>
                <span>Dark Activated</span>
              </>
            ) : (
              <>
                <div className="p-1 rounded-full bg-white/[0.12] text-orange-400">
                  <Sun size={12} className="stroke-[2.5]" />
                </div>
                <span>Light Activated</span>
              </>
            )}
          </div>
        )}

        {item.type === 'glance' && !isLongPressed && (
          <div 
            onClick={isInteractive ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              playNavTick();
              triggerHaptic(22, true);
              setIsLongPressed(true);
            } : undefined}
            title="Click or hold to reveal elements"
            className="flex items-center gap-2 xs:gap-3.5 px-4 xs:px-6 py-2.5 xs:py-3 text-[11px] xs:text-xs font-semibold tracking-wide font-sans whitespace-nowrap text-white/95 cursor-pointer select-none"
          >
            <div className="relative flex h-2 w-2 select-none">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0a84ff] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0a84ff]"></span>
            </div>
            <span className="font-sans font-semibold text-[13px] text-zinc-200">
              {item.projectName === 'repo' ? 'View Source Code' : item.projectName === 'demo' ? 'Launch Application' : item.projectName === 'resume' ? 'Professional Resume' : item.projectName === 'social' ? 'Connect LinkedIn' : 'Connect Profile'}
            </span>
            <ChevronUp size={12} className="opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap ml-1 text-zinc-400 animate-bounce" />
          </div>
        )}

        {item.type === 'glance' && isLongPressed && (
          <div 
            className="w-[calc(100vw-32px)] xs:w-[320px] sm:w-[350px] max-w-full p-4 xs:p-4.5 flex flex-col gap-4 font-sans select-none"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-[#1c1c1e] text-[#0a84ff] shrink-0 mt-0.5 border border-white/[0.03]">
                {item.projectName === 'demo' ? (
                  <Sun size={16} className="stroke-[2.5]" />
                ) : item.projectName === 'resume' ? (
                  <FileDown size={16} className="stroke-[2.5]" />
                ) : item.projectName === 'repo' ? (
                  <Code size={16} className="stroke-[2.5]" />
                ) : (
                  <Clock size={16} className="stroke-[2.5]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-blue-400">Tactile Portal</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></span>
                </div>
                <h5 className="text-[13px] font-semibold text-white leading-tight mt-0.5">
                  {item.projectName === 'demo' ? 'Launch Live App' : item.projectName === 'resume' ? 'Get Resumé Document' : item.projectName === 'repo' ? 'Inspect Source' : 'Connect LinkedIn'}
                </h5>
                <p className="text-[11px] font-medium text-zinc-400 mt-1 leading-normal truncate">
                  Target: <span className="text-zinc-200 underline decoration-zinc-500 underline-offset-2">{item.targetName || 'LinkedIn Profile'}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={isInteractive ? handleCancel : undefined}
                className="w-full py-2.5 text-xs font-bold rounded-full bg-white/[0.1] hover:bg-white/[0.15] active:bg-white/[0.08] text-white transition-all cursor-pointer select-none active:scale-[0.96] text-center"
              >
                Dismiss
              </button>
              <button
                onClick={isInteractive ? (e) => {
                  if (item.projectName === 'social' || item.type === 'glance') {
                    addRipple(e.clientX, e.clientY);
                    playSoftClick();
                    triggerHaptic(18, true);
                    window.open(item.redirectUrl || 'https://linkedin.com', '_blank', 'noopener,noreferrer');
                    onClose();
                  } else {
                    handleProceed(e);
                  }
                } : undefined}
                className="w-full py-2.5 text-xs font-bold rounded-full bg-[#0a84ff] hover:bg-[#2997ff] active:bg-[#0071e3] text-white transition-all cursor-pointer select-none active:scale-[0.96] text-center shadow-lg shadow-[#0a84ff]/25 font-display"
              >
                Open
              </button>
            </div>
          </div>
        )}

        {item.type === 'time_spent' && !isTimeExpanded && (
          <div 
            onClick={isInteractive ? (e) => {
              e.preventDefault();
              e.stopPropagation();
              playNavTick();
              triggerHaptic(16, true);
              setIsTimeExpanded(true);
            } : undefined}
            title="Active Session logs"
            className="flex items-center gap-2.5 px-4 xs:px-6 py-2.5 xs:py-3 text-[11px] xs:text-xs font-semibold tracking-wide font-sans whitespace-nowrap text-white/95 cursor-pointer select-none"
          >
            <div className="p-1 rounded-full bg-emerald-500/15 text-emerald-400 shrink-0">
              <Clock size={12} className="stroke-[2.5]" />
            </div>
            <span className="font-mono text-zinc-200">
              Active Session: {formatTime(secondsElapsed)}
            </span>
          </div>
        )}

        {item.type === 'time_spent' && isTimeExpanded && (
          <div 
            className="w-[calc(100vw-32px)] xs:w-[320px] sm:w-[350px] max-w-full p-4 xs:p-5 flex flex-col gap-4.5 font-sans select-none"
          >
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-[#1c1c1e] text-[#30d158] shrink-0 mt-0.5 border border-white/[0.03] shadow-inner">
                <Clock size={18} className="stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-emerald-400 font-mono">Live Session logs</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#30d158] shadow-[0_0_8px_#30d158]"></span>
                </div>
                <h5 className="text-[13px] font-semibold text-white leading-tight mt-0.5">
                  Session Duration
                </h5>
                <p className="text-[11px] font-medium text-zinc-400 mt-1 leading-normal font-mono">
                  Running Hours: <span className="text-zinc-100 font-bold">{formatTime(secondsElapsed)}</span>
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-1 font-mono">
              <button
                onClick={isInteractive ? () => setIsTimeExpanded(false) : undefined}
                className="flex-1 py-2.5 text-xs font-bold rounded-full bg-white/[0.1] hover:bg-white/[0.15] active:bg-white/[0.08] text-white transition-all cursor-pointer select-none active:scale-[0.96] text-center"
              >
                Collapse
              </button>
              <button
                onClick={isInteractive ? handleCancel : undefined}
                className="flex-1 py-2.5 text-xs font-bold rounded-full bg-[#ff3331] hover:bg-[#ff4d4b] active:bg-[#d62826] text-white transition-all cursor-pointer select-none active:scale-[0.96] text-center shadow-lg shadow-[#ff3331]/25"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {item.type === 'redirect_prompt' && (
          <div 
            className="w-[calc(100vw-32px)] xs:w-[320px] sm:w-[350px] max-w-full p-4 xs:p-4.5 flex flex-col gap-4 font-sans select-none"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-[#1c1c1e] text-[#0a84ff] shrink-0 mt-0.5 border border-white/[0.03]">
                <Code size={16} className="stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-zinc-400">System Link</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#0a84ff] shadow-[0_0_8px_#0a84ff]"></span>
                </div>
                <h5 className="text-[13px] font-semibold text-white leading-tight mt-0.5">
                  Open Outer Link?
                </h5>
                <p className="text-[11px] font-medium text-zinc-400 mt-1 leading-normal">
                  Redirecting to: <span className="text-zinc-200 underline decoration-zinc-500 underline-offset-2">{item.projectName || 'GitHub'}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={isInteractive ? handleCancel : undefined}
                className="w-full py-2.5 text-xs font-bold rounded-full bg-white/[0.1] hover:bg-white/[0.15] active:bg-white/[0.08] text-white transition-all cursor-pointer select-none active:scale-[0.96] text-center"
              >
                Cancel
              </button>
              <button
                onClick={isInteractive ? handleProceed : undefined}
                className="w-full py-2.5 text-xs font-bold rounded-full bg-[#0a84ff] hover:bg-[#2997ff] active:bg-[#0071e3] text-white transition-all cursor-pointer select-none active:scale-[0.96] text-center shadow-lg shadow-[#0a84ff]/25"
              >
                Open
              </button>
            </div>
          </div>
        )}

        {item.type === 'download_resume_prompt' && (
          <div 
            className="w-[calc(100vw-32px)] xs:w-[320px] sm:w-[350px] max-w-full p-4 xs:p-4.5 flex flex-col gap-4 font-sans select-none"
          >
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-[#1c1c1e] text-[#30d158] shrink-0 mt-0.5 border border-white/[0.03]">
                <FileDown size={16} className="stroke-[2.5]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-emerald-400">Document Hub</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#30d158] shadow-[0_0_8px_#30d158]"></span>
                </div>
                <h5 className="text-[13px] font-semibold text-white leading-tight mt-0.5">
                  Download Professional Resume?
                </h5>
                <p className="text-[11px] font-medium text-zinc-400 mt-1 leading-normal">
                  Save <span className="text-zinc-200 underline decoration-zinc-500 underline-offset-2">Godtime_Benson_Resume.pdf</span> locally (14.5 KB).
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={isInteractive ? handleCancel : undefined}
                className="w-full py-2.5 text-xs font-bold rounded-full bg-white/[0.1] hover:bg-white/[0.15] active:bg-white/[0.08] text-white transition-all cursor-pointer select-none active:scale-[0.96] text-center"
              >
                Cancel
              </button>
              <button
                onClick={isInteractive ? handleDownload : undefined}
                className="w-full py-2.5 text-xs font-bold rounded-full bg-[#30d158] hover:bg-[#40e068] active:bg-[#24b049] text-white transition-all cursor-pointer select-none active:scale-[0.96] text-center shadow-lg shadow-[#30d158]/25"
              >
                Download
              </button>
            </div>
          </div>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-[100000] pointer-events-none select-none px-4 flex justify-center">
      <div className="relative pointer-events-auto">
        <AnimatePresence mode="popLayout">
          {stack.map((item, index) => {
            // Render only top 2 cards for a pristine, visual look without unnecessary overlays
            if (index > 1) return null;

            const isTop = index === 0;

            return (
              <motion.div
                key={item.id}
                ref={isTop ? containerRef : null}
                layout
                onPointerDown={isTop ? handlePointerDown : undefined}
                onPointerUp={isTop ? handlePointerUp : undefined}
                onPointerCancel={isTop ? handlePointerCancelOrLeave : undefined}
                onPointerLeave={isTop ? handlePointerCancelOrLeave : undefined}
                onClick={
                  isTop
                    ? (e) => {
                        if (e.target === e.currentTarget) {
                          playSoftClick();
                          triggerHaptic(10, true);
                          addRipple(e.clientX, e.clientY);
                        }
                      }
                    : undefined
                }
                initial={
                  isTop
                    ? {
                        y: 70,
                        scale: 0.12,
                        opacity: 0,
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                      }
                    : {
                        y: -8,
                        scale: 0.94,
                        opacity: 0,
                      }
                }
                animate={
                  isTop
                    ? isRotating
                      ? {
                          y: -95,
                          scale: 0.85,
                          opacity: 0,
                          transition: { duration: 0.24, ease: 'easeOut' },
                        }
                      : isBouncing
                      ? {
                          y: [0, -12, 4, -2, 0],
                          scale: [1, 1.12, 0.94, 1.04, 0.98, 1],
                          borderRadius: getBorderRadius(),
                          width: 'auto',
                          height: 'auto',
                          opacity: 1,
                          transition: {
                            y: { type: 'keyframes', duration: 0.6, ease: 'easeOut' },
                            scale: { type: 'keyframes', duration: 0.6, ease: 'easeOut' },
                          },
                        }
                      : isHolding
                      ? {
                          y: 0,
                          scale: [0.95, 1.02, 0.95],
                          borderRadius: getBorderRadius(),
                          width: 'auto',
                          height: 'auto',
                          opacity: 1,
                          transition: {
                            scale: { repeat: Infinity, duration: 1.0, ease: 'easeInOut' },
                          },
                        }
                      : {
                          y: 0,
                          scale: 1,
                          opacity: 1,
                          borderRadius: getBorderRadius(),
                          width: 'auto',
                          height: 'auto',
                         }
                    : {
                        y: -8,
                        scale: 0.94,
                        opacity: 0.45,
                        borderRadius: '32px',
                      }
                }
                exit={
                  isTop
                    ? {
                        y: 85,
                        scale: 0.001,
                        opacity: 0,
                        borderRadius: '50%',
                        width: '8px',
                        height: '8px',
                      }
                    : {
                        opacity: 0,
                        scale: 0.8,
                        y: 15,
                      }
                }
                transition={
                  isTop
                    ? {
                        type: 'spring',
                        stiffness: 440,
                        damping: 24,
                        mass: 0.85,
                      }
                    : {
                        duration: 0.3,
                        ease: 'easeOut',
                      }
                }
                className={`${
                  isTop ? 'relative z-20 cursor-pointer' : 'absolute inset-0 z-10 pointer-events-none'
                } bg-[#000000]/98 dark:bg-[#09090b]/99 border border-white/[0.04] dark:border-white/[0.03] text-zinc-100 shadow-[0_20px_45px_-12px_rgba(0,0,0,0.85)] backdrop-blur-3xl overflow-hidden rounded-[32px]`}
                style={{
                  boxShadow: '0 20px 45px -12px rgba(0, 0, 0, 0.85), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                  borderRadius: isTop ? getBorderRadius() : '32px',
                }}
              >
                {/* Embedded absolute ripples rendering for top card */}
                {isTop && (
                  <AnimatePresence>
                    {ripples.map((ripple) => (
                      <motion.span
                        key={ripple.id}
                        initial={{ scale: 0, opacity: 0.35 }}
                        animate={{ scale: 3.5, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        onAnimationComplete={() => removeRipple(ripple.id)}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        className="absolute pointer-events-none rounded-full bg-white/[0.14] select-none"
                        style={{
                          left: ripple.x,
                          top: ripple.y,
                          width: '60px',
                          height: '60px',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                    ))}
                  </AnimatePresence>
                )}

                {/* Ambient overlay light */}
                <div className="absolute top-0 left-0 right-0 h-[8px] bg-gradient-to-b from-white/[0.04] via-white/[0.01] to-transparent pointer-events-none select-none z-[1]" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.005] to-white/[0.02] pointer-events-none select-none z-[1]" />

                {/* Card Content Wrapper */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.22,
                    delay: isTop ? 0.12 : 0,
                    ease: 'easeOut',
                  }}
                  className="flex items-center justify-between h-full"
                >
                  {renderCardInnerContent(item, isTop)}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
