import { useState, useEffect, MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { portfolioData } from './data';
import Header from './components/Header';
import Projects from './components/Projects';
import Skills from './components/Skills';
import ExperienceSection from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';
import DynamicIsland from './components/DynamicIsland';
import NotFound from './components/NotFound';
import AdminPanel from './components/AdminPanel';
import { PortfolioData } from './types';
import { Mail, MapPin, Download, WifiOff, RefreshCw, AlertCircle, Sun, Moon, Monitor } from 'lucide-react';
import { playSoftClick, playNavTick, setGlobalMute, playPhantomGlitchSound } from './utils/audio';
import { triggerHaptic } from './utils/haptics';
import ThreeDBackground from './components/ThreeDBackground';
import MiceOnVenusPlayer from './components/MiceOnVenusPlayer';
import ScrambleText from './components/ScrambleText';

export default function App() {
  const [glitchActive, setGlitchActive] = useState(false);
  const typedSequenceRef = useRef<string>('');
  const glitchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastTapRef = useRef<number[]>([]);

  const triggerGlitch = () => {
    if (glitchTimerRef.current) {
      clearTimeout(glitchTimerRef.current);
    }
    
    // Play an intense, physically jarring error-burst haptic vibration pattern (especially weird on Mobile & Tablet!)
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        const weirdHeavyErrorPattern = [150, 45, 180, 30, 220, 50, 120, 30, 250, 40, 130, 20, 200, 45, 380];
        navigator.vibrate(weirdHeavyErrorPattern);
      } else {
        triggerHaptic('heavy');
      }
    } catch {}
    
    playPhantomGlitchSound();
    setGlitchActive(true);

    // Broadcast system-wide start signal
    try {
      window.dispatchEvent(new CustomEvent('phantom-glitch-start'));
    } catch {}
    
    glitchTimerRef.current = setTimeout(() => {
      setGlitchActive(false);
      glitchTimerRef.current = null;
      // Broadcast system-wide end signal
      try {
        window.dispatchEvent(new CustomEvent('phantom-glitch-end'));
      } catch {}
    }, 1600);
  };

  const handleCreativeDeveloperTap = (e: ReactTouchEvent | ReactMouseEvent) => {
    // Only detect triple-tappings for touch-enabled devices (mobiles/tablets)
    const isTouchOrTablet = typeof window !== 'undefined' && (('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
    
    if (!isTouchOrTablet) {
      // Ignore click triggering on pure Desktop devices (desktops rely strictly on typing "PHATOM" on keyboard!)
      return;
    }

    // Prevent duplicate events on fast hybrid taps
    if (e.type === 'click' && ('ontouchstart' in window)) {
      return;
    }

    const now = Date.now();
    // 550ms window is ideal for triple tap detection on touchscreens
    const recentTaps = [...lastTapRef.current, now].filter(t => now - t < 550);
    lastTapRef.current = recentTaps;
    
    // Provide tactile click feel on every individual tap
    try { triggerHaptic('light'); } catch {}

    if (recentTaps.length >= 3) {
      triggerGlitch();
      lastTapRef.current = [];
    }
  };

  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>(() => {
    try {
      const storedThemeMode = localStorage.getItem('theme_mode');
      if (storedThemeMode && ['light', 'dark', 'system'].includes(storedThemeMode)) {
        return storedThemeMode as 'light' | 'dark' | 'system';
      }
      const legacyTheme = localStorage.getItem('theme');
      if (legacyTheme) {
        return legacyTheme === 'dark' ? 'dark' : 'light';
      }
      return 'system';
    } catch {
      return 'system';
    }
  });

  const [darkMode, setDarkMode] = useState(false);

  // Loaded portfolio editable dataset
  const [editableData, setEditableData] = useState<PortfolioData>(() => {
    try {
      const stored = localStorage.getItem('portfolio_data');
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...portfolioData,
          ...parsed,
          profile: {
            ...portfolioData.profile,
            ...(parsed.profile || {})
          }
        };
      }
    } catch (e) {
      console.error('Failed to parse portfolio_data:', e);
    }
    return portfolioData;
  });

  const [isNotFound, setIsNotFound] = useState(() => {
    try {
      const path = window.location.pathname;
      return path !== '/' && path !== '/index.html' && path !== '' && path !== '/admin';
    } catch {
      return false;
    }
  });

  const [isAdminView, setIsAdminView] = useState(() => {
    try {
      return window.location.pathname === '/admin';
    } catch {
      return false;
    }
  });

  const navigateTo = (path: string) => {
    try {
      window.history.pushState({}, '', path);
      setIsNotFound(path !== '/' && path !== '/index.html' && path !== '' && path !== '/admin');
      setIsAdminView(path === '/admin');
    } catch (e) {
      console.error('Navigation error:', e);
    }
  };

  // Track popstate event back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      try {
        const path = window.location.pathname;
        setIsNotFound(path !== '/' && path !== '/index.html' && path !== '' && path !== '/admin');
        setIsAdminView(path === '/admin');
      } catch {
        setIsNotFound(false);
        setIsAdminView(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync portfolio data from global server database
  useEffect(() => {
    let active = true;
    const syncPortfolio = async (isInitialCall = false) => {
      try {
        const response = await fetch('/api/portfolio');
        if (response.ok) {
          const remoteData = await response.json();
          const merged = {
            ...portfolioData,
            ...remoteData,
            profile: {
              ...portfolioData.profile,
              ...(remoteData.profile || {})
            }
          };
          if (active) {
            setEditableData(merged);
            localStorage.setItem('portfolio_data', JSON.stringify(merged));
          }
        }
      } catch (err: any) {
        // Handle common offline or temporary connection errors gracefully without polluting consoles
        const isNetworkError = err instanceof Error && (
          err.name === 'TypeError' || 
          err.message?.toLowerCase().includes('fetch') ||
          err.message?.toLowerCase().includes('network')
        );
        if (isNetworkError) {
          console.log('Portfolio data auto-sync current state: offline/pending. Utilizing local cache fallback.');
        } else {
          console.warn('Portfolio data auto-sync notification:', err);
        }
      } finally {
        if (isInitialCall && active) {
          // brief sweet delay for a gorgeous shimmer feel
          setTimeout(() => {
            if (active) setIsInitialLoading(false);
          }, 450);
        }
      }
    };

    syncPortfolio(true);

    const handleFocusSync = () => {
      syncPortfolio(false);
    };

    // Re-sync on window/tab focus to load changes made in other browsers globally
    window.addEventListener('focus', handleFocusSync);
    return () => {
      active = false;
      window.removeEventListener('focus', handleFocusSync);
    };
  }, []);

  // System-wide literal text scrambler all over the website (excluding the nav bar elements, logo, dynamic island)
  useEffect(() => {
    if (!glitchActive) return;

    // We query elements with descriptive textual content across the entire DOM tree
    const elements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, button, label, li');
    const originalTexts = new Map<Element, string>();

    elements.forEach((el) => {
      // Exclude nav components, dynamic island, specific logo indicators and non-glitched elements explicitly
      if (
        el.closest('#header-nav') || 
        el.closest('#desktop-nav') || 
        el.closest('#logo-link') ||
        el.closest('#dynamic-island-container') ||
        el.closest('.select-none') || 
        el.classList.contains('no-glitch') ||
        el.id === 'header-nav' ||
        el.id === 'desktop-nav' ||
        el.id === 'logo-link' ||
        el.id === 'dynamic-island-container'
      ) {
        return;
      }
      if (el.textContent && el.children.length === 0) { // Only target leaf nodes to safely preserve child tag structures
        originalTexts.set(el, el.textContent);
      }
    });

    const glitchChars = '@#$%&*?+=~^0123456789PHATOM!';
    const interval = setInterval(() => {
      elements.forEach((el) => {
        const original = originalTexts.get(el);
        if (!original) return;

        const scrambled = original
          .split('')
          .map((char) => {
            if (/\s/.test(char)) return char; // Preserve original white spaces
            return Math.random() < 0.28
              ? glitchChars[Math.floor(Math.random() * glitchChars.length)]
              : char;
          })
          .join('');
        el.textContent = scrambled;
      });
    }, 85);

    return () => {
      clearInterval(interval);
      // Perfect instant restoration of original textual contents
      elements.forEach((el) => {
        const original = originalTexts.get(el);
        if (original) {
          el.textContent = original;
        }
      });
    };
  }, [glitchActive]);

  const [island, setIsland] = useState<{
    type: 'none' | 'theme' | 'redirect_prompt' | 'download_resume_prompt' | 'glance' | 'time_spent';
    themeMode?: 'light' | 'dark' | 'system';
    redirectUrl?: string;
    projectName?: string;
    minutesSpent?: number;
  }>({ type: 'none' });

  // Handle Dynamic Island custom redirect, glance trigger events, and global long-press gesture routing
  useEffect(() => {
    const handleTriggerIsland = (e: CustomEvent<{ url: string; name: string }>) => {
      setIsland({
        type: 'redirect_prompt',
        redirectUrl: e.detail.url,
        projectName: e.detail.name
      });
    };

    const handleGlanceIsland = (e: CustomEvent<{ type: 'repo' | 'demo' | 'social'; url?: string; name?: string }>) => {
      setIsland(prev => {
        if (prev.type === 'none' || prev.type === 'glance') {
          // Add visual pulse indicator to the target elements that share this URL (usually repository or demo elements)
          if (e.detail.url) {
            try {
              const el = document.querySelector(`[href="${CSS.escape(e.detail.url)}"]`);
              if (el) el.classList.add('glance-active-pulse');
            } catch (err) {
              // selector safety guard
            }
          }
          return {
            type: 'glance',
            projectName: e.detail.type,
            redirectUrl: e.detail.url,
            targetName: e.detail.name
          };
        }
        return prev;
      });
    };

    const handleGlanceEndIsland = () => {
      setIsland(prev => {
        if (prev.type === 'glance') {
          try {
            document.querySelectorAll('.glance-active-pulse').forEach(el => {
              el.classList.remove('glance-active-pulse');
            });
          } catch (e) {
            // silent ignore
          }
          return { type: 'none' };
        }
        return prev;
      });
    };

    // Global tactile long-press tracker variables
    let longPressTimer: NodeJS.Timeout | null = null;
    let isLongPressActive = false;
    let startPoint = { x: 0, y: 0 };
    let currentTargetElement: HTMLElement | null = null;

    const clearTimer = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target && typeof (e.target as any).closest === 'function'
        ? (e.target as any).closest('a, button, [role="button"]') as HTMLElement
        : null;
      if (!target) return;

      clearTimer();
      isLongPressActive = false;
      startPoint = { x: e.clientX, y: e.clientY };
      currentTargetElement = target;

      // Start the long-press threshold timer
      longPressTimer = setTimeout(() => {
        isLongPressActive = true;
        
        // Trigger tactile haptic pulse
        triggerHaptic('medium');
        playNavTick();

        // Attribute key to suppress default click handlers
        target.setAttribute('data-long-pressed', 'true');
        
        // Apply styling feedback
        target.classList.add('glance-active-pulse');
        
        const href = target.getAttribute('href');
        const id = target.getAttribute('id');
        const textStr = target.innerText || target.textContent || '';
        
        if (id === 'hero-resume-download-btn' || textStr.toLowerCase().includes('resume')) {
          setIsland({
            type: 'glance',
            projectName: 'resume',
            targetName: 'Godtime_Benson_Resume.pdf'
          });
        } else if (href && href !== '#' && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
          let siteName = target.getAttribute('aria-label') || target.getAttribute('title') || 'Website';
          if (!siteName || siteName === 'Website') {
            try {
              const urlObj = new URL(href, window.location.href);
              siteName = urlObj.hostname;
            } catch {
              siteName = href;
            }
          }
          let glanceType: 'repo' | 'demo' | 'social' = 'social';
          if (href.includes('github') || href.includes('code') || textStr.toLowerCase().includes('code')) {
            glanceType = 'repo';
          } else if (textStr.toLowerCase().includes('demo') || textStr.toLowerCase().includes('live')) {
            glanceType = 'demo';
          }
          setIsland({
            type: 'glance',
            projectName: glanceType,
            redirectUrl: href,
            targetName: siteName
          });
        } else {
          setIsland({
            type: 'glance',
            projectName: 'social',
            redirectUrl: href || undefined,
            targetName: textStr.trim() || 'Interactive Node'
          });
        }
      }, 500); // 500ms long press standard
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!currentTargetElement) return;
      // Cancel long press sequence if fingers move significantly (e.g. while scrolling)
      const dx = e.clientX - startPoint.x;
      const dy = e.clientY - startPoint.y;
      if (Math.sqrt(dx * dx + dy * dy) > 12) {
        clearTimer();
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      clearTimer();
      if (currentTargetElement && isLongPressActive) {
        e.preventDefault();
        e.stopPropagation();
        
        // Retain state momentarily to consume subsequent physical clicks safely
        const target = currentTargetElement;
        setTimeout(() => {
          target.removeAttribute('data-long-pressed');
        }, 300);
      }
      currentTargetElement = null;
    };

    const handlePointerCancel = () => {
      clearTimer();
      currentTargetElement = null;
    };

    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target && typeof (e.target as any).closest === 'function'
        ? (e.target as any).closest('a, button, [role="button"]') as HTMLElement
        : null;
      if (target && target.getAttribute('data-long-pressed') === 'true') {
        e.preventDefault();
        e.stopPropagation();
        target.removeAttribute('data-long-pressed');
      }
    };

    // Refactored context menu and selection-suppression logic for consistent tactical user engagement
    const handleContextMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        typeof target.closest === 'function' &&
        (target.closest('a') ||
          target.closest('button') ||
          target.closest('[role="button"]') ||
          target.closest('img') ||
          target.closest('.pointer-events-auto'))
      ) {
        // Prevent default browser popup sheets during high-precision holds
        e.preventDefault();
      }
    };

    const handleSelectStart = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && typeof target.closest === 'function' && target.closest('a, button, [role="button"]')) {
        // Prevent default text selection during deliberate long press interactions
        e.preventDefault();
      }
    };

    // Registrations
    window.addEventListener('trigger-redirect-island' as any, handleTriggerIsland as any);
    window.addEventListener('trigger-glance-island' as any, handleGlanceIsland as any);
    window.addEventListener('trigger-glance-end-island' as any, handleGlanceEndIsland as any);
    
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerup', handlePointerUp, { capture: true }); // Block standard click bubble if active
    document.addEventListener('pointercancel', handlePointerCancel, { passive: true });
    document.addEventListener('click', handleLinkClick, { capture: true });

    return () => {
      window.removeEventListener('trigger-redirect-island' as any, handleTriggerIsland as any);
      window.removeEventListener('trigger-glance-island' as any, handleGlanceIsland as any);
      window.removeEventListener('trigger-glance-end-island' as any, handleGlanceEndIsland as any);
      
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp, { capture: true } as any);
      document.removeEventListener('pointercancel', handlePointerCancel);
      document.removeEventListener('click', handleLinkClick, { capture: true } as any);
    };
  }, []);

  // Double-progression page time feedback tracker (5 mins -> 10 mins -> 20 mins -> 40 mins -> etc.)
  useEffect(() => {
    const startTimeStamp = Date.now();
    const nextTriggerMinutes = { current: 5 }; // starts at 5 minutes

    const checkInterval = setInterval(() => {
      const elapsedMs = Date.now() - startTimeStamp;
      const elapsedMinutes = elapsedMs / (60 * 1000);

      if (elapsedMinutes >= nextTriggerMinutes.current) {
        setIsland({
          type: 'time_spent',
          minutesSpent: nextTriggerMinutes.current
        });
        
        // Double the interval for the next trigger
        nextTriggerMinutes.current = nextTriggerMinutes.current * 2;
      }
    }, 5000); // Check every 5 seconds for precise, lightweight timing

    return () => clearInterval(checkInterval);
  }, []);

  const isMountedTheme = useRef(false);
  useEffect(() => {
    if (!isMountedTheme.current) {
      isMountedTheme.current = true;
      return;
    }

    setIsland({
      type: 'theme',
      themeMode: themeMode
    });

    const timer = setTimeout(() => {
      setIsland(prev => prev.type === 'theme' ? { type: 'none' } : prev);
    }, 3000);

    return () => clearTimeout(timer);
  }, [themeMode]);

  // Synchronized style clean-up when Island closes
  useEffect(() => {
    if (island.type === 'none') {
      try {
        document.querySelectorAll('.glance-active-pulse').forEach(el => {
          el.classList.remove('glance-active-pulse');
        });
      } catch (e) {
        // Safe silent ignore
      }
    }
  }, [island.type]);

  const [activeSection, setActiveSection] = useState('work');
  const [ripplePosition, setRipplePosition] = useState<{ x: number; y: number } | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Pull to refresh states (strictly mobile touch only)
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [burstWave, setBurstWave] = useState<{ x: number; y: number; active: boolean } | null>(null);

  // Refs to allow the gesture system to run without tearing down event listeners on state updates
  const startYRef = useRef(0);
  const startXRef = useRef(0);
  const isCandidateRef = useRef(false);
  const currentPullingRef = useRef(false);
  const pullDistanceRef = useRef(0);
  const touchCoordsRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isRefreshingRef = useRef(false);

  // Pull-to-Refresh Controller Effect
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      // Strictly mobile/touch only
      if (e.touches.length !== 1 || isRefreshingRef.current) return;

      const rightPanel = document.getElementById('right-scroll-panel');
      const scrollTop = rightPanel 
        ? (window.innerWidth >= 1024 ? rightPanel.scrollTop : window.scrollY || document.documentElement.scrollTop || document.body?.scrollTop || 0)
        : (window.scrollY || document.documentElement.scrollTop || document.body?.scrollTop || 0);

      // We only allow candidates if scrolled to top
      if (scrollTop > 1) return;

      const touch = e.touches[0];
      startYRef.current = touch.clientY;
      startXRef.current = touch.clientX;
      isCandidateRef.current = true;
      currentPullingRef.current = false;
      pullDistanceRef.current = 0;
      
      touchCoordsRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isCandidateRef.current || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const deltaY = touch.clientY - startYRef.current;
      const deltaX = touch.clientX - startXRef.current;

      // Identify downward pull gesture
      if (!currentPullingRef.current && deltaY > 8 && deltaY > Math.abs(deltaX)) {
        currentPullingRef.current = true;
      }

      if (currentPullingRef.current) {
        // Prevent default browser scroll behaviors (bounce/overscroll reload)
        if (e.cancelable) {
          e.preventDefault();
        }

        // Beautiful logarithmic curve dampening
        const dampened = Math.min(135, Math.pow(Math.max(0, deltaY), 0.88));
        pullDistanceRef.current = dampened;
        touchCoordsRef.current = { x: touch.clientX, y: touch.clientY };

        // GPU composite layer update directly bypassing virtual DOM re-renders!
        const indicator = document.getElementById('custom-pull-indicator');
        if (indicator) {
          indicator.style.transition = 'none'; // clear slide/fade transitions during active drag
          
          const boundedX = Math.max(30, Math.min(window.innerWidth - 30, touch.clientX));
          indicator.style.left = `${boundedX}px`;
          
          const rotationFraction = Math.min(1, dampened / 72);
          const scale = Math.min(1.15, dampened / 55);
          const opacity = Math.min(1, dampened / 24);
          
          // Beautiful fluid 3D tilting based on pull distance and horizontal drag offset!
          const angleX = dampened * 0.35; // Tilt pitch based on pull distance
          const angleY = Math.max(-25, Math.min(25, deltaX * 0.3)); // Yaw based on horizontal drag offset
          
          indicator.style.transform = `translate3d(-50%, ${dampened}px, 40px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(${scale})`;
          indicator.style.opacity = `${opacity}`;

          const icon = indicator.querySelector('.pull-icon') as HTMLElement;
          if (icon) {
            icon.style.transform = `rotate(${rotationFraction * 210}deg)`;
          }
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (currentPullingRef.current) {
        if (pullDistanceRef.current >= 72) {
          triggerRefresh();
        } else {
          animateSnapBack();
        }
      }
      isCandidateRef.current = false;
      currentPullingRef.current = false;
    };

    const triggerRefresh = async () => {
      isRefreshingRef.current = true;
      setIsRefreshing(true);

      try {
        triggerHaptic('medium');
        playNavTick();
      } catch {}

      // Spread Waves from the very top center of the screen (beautiful cascading downward semicircles)
      setBurstWave({ 
        x: window.innerWidth / 2, 
        y: 0, 
        active: true 
      });

      // Slide and scale indicator out cleanly during action
      const indicator = document.getElementById('custom-pull-indicator');
      if (indicator) {
        indicator.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.35s ease';
        indicator.style.transform = `translate3d(-50%, 0, 0) scale(0)`;
        indicator.style.opacity = '0';
      }

      // Run live auto-sync fetches securely
      try {
        const response = await fetch('/api/portfolio');
        if (response.ok) {
          const remoteData = await response.json();
          setEditableData(prev => {
            const merged = {
              ...prev,
              ...remoteData,
              profile: {
                ...prev.profile,
                ...(remoteData.profile || {})
              }
            };
            localStorage.setItem('portfolio_data', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {
        console.warn('Pull-to-refresh sync info:', err);
      }

      setTimeout(() => {
        isRefreshingRef.current = false;
        setIsRefreshing(false);
        setBurstWave(null);
      }, 1850);
    };

    const animateSnapBack = () => {
      const indicator = document.getElementById('custom-pull-indicator');
      if (indicator) {
        // High fidelity spring snap using native CSS cubic transitions
        indicator.style.transition = 'transform 0.48s cubic-bezier(0.175, 0.885, 0.32, 1.35), opacity 0.35s ease';
        indicator.style.transform = 'translate3d(-50%, 0, 0) scale(0)';
        indicator.style.opacity = '0';
      }
      pullDistanceRef.current = 0;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, []);

  const [isOffline, setIsOffline] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testOutcome, setTestOutcome] = useState<'success' | 'failure' | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      setTestOutcome(null);
    };
    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetestConnection = () => {
    playNavTick();
    setIsTestingConnection(true);
    setTestOutcome(null);

    // Simulate an elegant, automated minimalist network trace benchmark
    setTimeout(() => {
      const isCurrentlyOnline = navigator.onLine;
      setIsTestingConnection(false);
      if (isCurrentlyOnline) {
        setTestOutcome('success');
        // Instantly play a subtle tick and fade offline overlay out
        setTimeout(() => {
          setIsOffline(false);
          setTestOutcome(null);
        }, 900);
      } else {
        setTestOutcome('failure');
        playSoftClick();
      }
    }, 1400);
  };

  const [soundMuted, setSoundMuted] = useState(() => {
    try {
      const storedMute = localStorage.getItem('sound_muted');
      const isMuted = storedMute !== 'false'; // true by default (muted)
      setGlobalMute(isMuted);
      return isMuted;
    } catch {
      return true;
    }
  });

  const toggleSound = () => {
    const nextMuted = !soundMuted;
    setSoundMuted(nextMuted);
    setGlobalMute(nextMuted);
    try {
      localStorage.setItem('sound_muted', String(nextMuted));
    } catch (e) {
      console.error(e);
    }
    if (!nextMuted) {
      setTimeout(() => playNavTick(), 50);
    }
  };

  // Synchronize themeMode, media query listener, and document CSS nodes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const applyTheme = () => {
      let isDark = false;
      if (themeMode === 'system') {
        isDark = mediaQuery.matches;
      } else {
        isDark = themeMode === 'dark';
      }
      
      setDarkMode(isDark);
      
      try {
        if (isDark) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme', 'light');
        }
        localStorage.setItem('theme_mode', themeMode);
      } catch (err) {
        console.error("Local theme update error", err);
      }
    };

    applyTheme();

    if (themeMode === 'system') {
      mediaQuery.addEventListener('change', applyTheme);
      return () => {
        mediaQuery.removeEventListener('change', applyTheme);
      };
    }
  }, [themeMode]);

  // Add Global Keyboard Shortcuts (1-4 Section Navigation, D Theme Toggle, S Project Search)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcut triggers if typing inside form inputs
      const activeEl = document.activeElement as HTMLElement | null;
      if (activeEl && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        activeEl.isContentEditable ||
        activeEl.hasAttribute('contenteditable')
      )) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === '1') {
        e.preventDefault();
        handleScrollToSection('work');
      } else if (key === '2') {
        e.preventDefault();
        handleScrollToSection('skills');
      } else if (key === '3') {
        e.preventDefault();
        handleScrollToSection('experience');
      } else if (key === '4') {
        e.preventDefault();
        handleScrollToSection('contact');
      } else if (key === 'd') {
        e.preventDefault();
        // Toggle theme modes dynamically
        setThemeMode(prev => {
          if (prev === 'system') {
            const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            return isSystemDark ? 'light' : 'dark';
          }
          return prev === 'dark' ? 'light' : 'dark';
        });
      } else if (key === 's') {
        e.preventDefault();
        handleScrollToSection('work');
        // Defer slightly to allow scroll transition start, then focus input
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('focus-project-search'));
        }, 120);
      } else if (key === 'c') {
        e.preventDefault();
        handleScrollToSection('contact');
        // Defer slightly to allow smooth scroll complete, then focus name input field
        setTimeout(() => {
          const nameInput = document.getElementById('name');
          if (nameInput) {
            nameInput.focus();
          }
        }, 150);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [themeMode]);

  // Ghostly Glitch "PHATOM" global cheat code keyboard tracker
  useEffect(() => {
    const handleGlitchScan = (e: KeyboardEvent) => {
      // Ignore keys that are not single-character keypress events
      if (e.key.length !== 1 || e.ctrlKey || e.altKey || e.metaKey) return;
      
      const char = e.key.toUpperCase();
      const nextSequence = (typedSequenceRef.current + char).slice(-6);
      typedSequenceRef.current = nextSequence;
      
      if (nextSequence === 'PHATOM') {
        triggerGlitch();
        typedSequenceRef.current = '';
      }
    };

    window.addEventListener('keydown', handleGlitchScan);
    return () => {
      window.removeEventListener('keydown', handleGlitchScan);
    };
  }, []);

  // Section Tracking Scroll Event Listener
  useEffect(() => {
    const handleScroll = (e: Event) => {
      const scrollContainer = e.target as HTMLElement;
      if (!scrollContainer) return;
      
      const sections = ['work', 'skills', 'experience', 'contact'];
      const scrollPosition = scrollContainer.scrollTop + 180;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop - 60; // relative to parent offset top
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
          }
        }
      }

      // Calculate scroll progress for the desktop right panel
      const totalScrollable = scrollContainer.scrollHeight - scrollContainer.clientHeight;
      if (totalScrollable > 0) {
        setScrollProgress((scrollContainer.scrollTop / totalScrollable) * 105); // slight padding adjustment for a nice full bar feel at very bottom
      } else {
        setScrollProgress(0);
      }
    };

    const rightPanel = document.getElementById('right-scroll-panel');
    if (rightPanel) {
      rightPanel.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // Fallback/standard behavior for mobile screen viewports
    const handleWindowScroll = () => {
      // Calculate scroll progress for standard window format
      const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScrollable > 0) {
        setScrollProgress((window.scrollY / totalScrollable) * 100);
      } else {
        setScrollProgress(0);
      }

      if (window.innerWidth >= 1024) return;
      
      const sections = ['work', 'skills', 'experience', 'contact'];
      const scrollPosition = window.scrollY + 120;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    // Initial sync
    const syncInitialScroll = () => {
      if (rightPanel && window.innerWidth >= 1024) {
        const total = rightPanel.scrollHeight - rightPanel.clientHeight;
        if (total > 0) setScrollProgress((rightPanel.scrollTop / total) * 105);
      } else {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        if (total > 0) setScrollProgress((window.scrollY / total) * 100);
      }
    };
    // Defer slightly to let layout solve heights
    const timer = setTimeout(syncInitialScroll, 150);

    return () => {
      if (rightPanel) {
        rightPanel.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleWindowScroll);
      clearTimeout(timer);
    };
  }, []);

  const [faderActive, setFaderActive] = useState(false);
  const [faderColor, setFaderColor] = useState<'light' | 'dark'>('dark');

  const handleDownloadResume = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    setIsland({
      type: 'download_resume_prompt'
    });
  };

  const executeActualResumeDownload = async () => {
    if (profile.resumeUrl === '#' || !profile.resumeUrl) {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Colors and Styles (Slate and Royal Palette)
      const primaryColor = [15, 23, 42];    // Slate-900 (Deep Charcoal)
      const secondaryColor = [71, 85, 105];  // Slate-600 (Muted Body)
      const accentColor = [29, 78, 216];     // Royal Blue `#1d4ed8`
      const bodyColor = [30, 41, 59];       // Slate-800

      // 1. Header Frame
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 45, 'F');

      // 2. Personal Title
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(24);
      doc.text('Godtime Benson', 18, 16);

      // Subtitle
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(226, 232, 240); // Light blue-grey
      const subtitleText = 'Research-Oriented Computer Scientist | AI/ML Specialist | Community & Data Platform Engineer';
      doc.text(subtitleText, 18, 23);

      // Contact Row
      doc.setFontSize(9);
      doc.setTextColor(203, 213, 225);
      doc.text('godtimebenson09@gmail.com   |   github.com/mrphatom', 18, 31);

      let y = 56;

      const addSectionHeader = (title: string, neededHeight = 15) => {
        if (y + neededHeight > 275) {
          doc.addPage();
          y = 18;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text(title.toUpperCase(), 18, y + 4);

        doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setLineWidth(0.4);
        doc.line(18, y + 6, 192, y + 6);

        y += 13;
      };

      // Professional Summary Section
      addSectionHeader('Professional Summary', 30);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(bodyColor[0], bodyColor[1], bodyColor[2]);
      const summaryText = "A driven and versatile Computer Scientist with a Master's degree (Distinction) and a strong foundation in algorithms, machine learning, and AI systems. Over three years of hands-on experience spanning data platform engineering, online education, and Web3 community management. Known for translating complex technical concepts into clear, actionable insights and for building thriving digital communities from the ground up. Equally comfortable writing research-grade documentation and moderating high-stakes live events — bridging the gap between technical depth and human connection.";
      const splitSummary = doc.splitTextToSize(summaryText, 174);
      doc.text(splitSummary, 18, y);
      y += (splitSummary.length * 4.2) + 7;

      // Professional Experience Section
      addSectionHeader('Professional Experience', 45);

      const addJob = (role: string, company: string, period: string, bullets: string[]) => {
        let estimatedHeight = 10;
        const wrappedBullets: string[][] = [];
        bullets.forEach(b => {
          const lines = doc.splitTextToSize(b, 168);
          wrappedBullets.push(lines);
          estimatedHeight += (lines.length * 4.2) + 1.5;
        });

        if (y + estimatedHeight > 275) {
          doc.addPage();
          y = 18;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(role, 18, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`${company}  |  ${period}`, 18, y + 4.2);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(bodyColor[0], bodyColor[1], bodyColor[2]);

        wrappedBullets.forEach(lines => {
          lines.forEach((line, index) => {
            if (y > 275) {
              doc.addPage();
              y = 18;
            }
            if (index === 0) {
              doc.text('•', 21, y);
              doc.text(line, 25, y);
            } else {
              doc.text(line, 25, y);
            }
            y += 4.2;
          });
          y += 1.5;
        });
        y += 2.5;
      };

      addJob(
        'Data Platform Engineer',
        'Discord',
        'May 2023 – Present',
        [
          'Supported data pipeline operations and platform integrity for one of the world\'s largest communication platforms, serving hundreds of millions of active users.',
          'Collaborated cross-functionally to monitor, maintain, and optimise data workflows supporting real-time messaging infrastructure.',
          'Contributed to platform reliability initiatives and internal tooling improvements to enhance engineer productivity.'
        ]
      );

      addJob(
        'Online Tutor — Computer Science & Mathematics',
        'Wyzant',
        'Feb 2024 – Mar 2025',
        [
          'Delivered personalised, one-on-one tutoring sessions in Computer Science, algorithms, data structures, and mathematics to students at various academic levels.',
          'Developed custom learning plans and problem sets to address individual knowledge gaps, resulting in measurably improved student performance.',
          'Built a reputation for clear, patient, and thorough explanation of complex concepts, maintaining consistently high student satisfaction ratings.'
        ]
      );

      addJob(
        'Discord Moderator',
        'Glider_fi',
        'Feb 2025 – Oct 2025',
        [
          'Enforced community guidelines and cultivated a respectful, positive environment for members in a fast-paced Web3 project.',
          'Managed support tickets and delivered real-time assistance on project updates, resolving user concerns with speed and clarity.',
          'Hosted and moderated live AMAs with the core team, coordinating role assignments and boosting community engagement.',
          'Identified and actioned bad actors — including bots, scammers, and phishing attempts — to ensure a safe and trustworthy social space.'
        ]
      );

      addJob(
        'Community Moderator',
        'SkyTradeNetwork',
        'Aug 2025 – Mar 2026',
        [
          'Managed and scaled the official Discord and Telegram communities for a DePIN (Decentralised Physical Infrastructure) air-rights platform, fostering an engaged and informed user base.',
          'Served as the primary point of contact for technical queries on air-rights claims, the $SKY points programme, and Solana wallet integration.',
          'Enforced community standards to eliminate spam, scams, and FUD — maintaining a high-quality discourse environment at all times.',
          'Organised and moderated community events including AMAs, token incentive campaigns, and referral drives that directly contributed to user acquisition growth.',
          'Acted as a feedback bridge between the community and the core team, relaying bug reports, feature requests, and sentiment insights from drone operators and property owners.'
        ]
      );

      // Force Page 2 for Education & Projects to mirror the uploaded resume exactly
      doc.addPage();
      y = 18;

      // Education Section
      addSectionHeader('Education', 35);

      const addEducation = (degree: string, institution: string, period: string, bullet: string) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(degree, 18, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`${institution}  |  ${period}`, 18, y + 4);
        y += 7.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(bodyColor[0], bodyColor[1], bodyColor[2]);
        const lines = doc.splitTextToSize(bullet, 168);
        lines.forEach((line, index) => {
          if (index === 0) {
            doc.text('•', 21, y);
            doc.text(line, 25, y);
          } else {
            doc.text(line, 25, y);
          }
          y += 4.2;
        });
        y += 3;
      };

      addEducation(
        'M.Sc Computer Science — Distinction (81%)',
        'Rivers State University',
        'May 2024 – Aug 2025',
        'Completed a postgraduate degree in Computer Science with a Distinction, focusing on advanced algorithms, machine learning, and AI systems design.'
      );

      addEducation(
        'B.Sc (Hons) Computer Science — First Class (4.86 GPA)',
        'Rivers State University',
        'Sep 2019 – Aug 2022',
        'Graduated with First Class Honours, demonstrating exceptional academic performance across core CS disciplines including data structures, software engineering, and computer networks.'
      );

      addEducation(
        'Professional Certification — Computer Science',
        'Coursera / Arizona State University',
        'Apr 2021 – Nov 2023',
        'Completed graduate-level coursework in Computer Science through Coursera\'s partnership with Arizona State University, reinforcing knowledge in algorithms, theory of computation, and software systems.'
      );

      y += 2;

      // Projects Section
      addSectionHeader('Featured Projects', 45);

      const addProject = (title: string, bullets: string[]) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(title, 18, y);
        y += 4.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(bodyColor[0], bodyColor[1], bodyColor[2]);
        bullets.forEach(b => {
          const lines = doc.splitTextToSize(b, 168);
          lines.forEach((line, index) => {
            if (index === 0) {
              doc.text('•', 21, y);
              doc.text(line, 25, y);
            } else {
              doc.text(line, 25, y);
            }
            y += 4.2;
          });
          y += 1.5;
        });
        y += 2.5;
      };

      addProject(
        'Golem — Social Platform with Integrated AI',
        [
          'Designed and built a full-featured social platform enabling user connection, content posting, real-time chat, and community interaction.',
          'Integrated a proprietary AI moderation system with personalised recommendation algorithms, tailoring each user\'s feed experience dynamically.'
        ]
      );

      addProject(
        'LightPaper — AI-Powered Technical Research Assistant',
        [
          'Architected a conversational AI system leveraging GPT-4 via API to simulate expert-level technical dialogue for computer science research and study.',
          'Implemented custom system prompting and Chain-of-Thought (CoT) reasoning patterns, improving the accuracy of complex CS explanations by 30%.',
          'Built a response framework optimised for Markdown and LaTeX rendering, ensuring mathematical clarity and high-fidelity technical documentation.',
          'Integrated a Python backend to deliver a seamless, context-aware experience for technical researchers and postgraduate students.'
        ]
      );

      y += 2;

      // Technical Skills Section
      addSectionHeader('Technical Skills', 40);

      const skillsData = [
        { cat: 'Programming Languages', val: 'Python, C++, Java' },
        { cat: 'AI / ML', val: 'LLM Architecture, RLHF Fine-tuning, Chain-of-Thought Prompting, GPT-4 API Integration' },
        { cat: 'Research Tools', val: 'MATLAB, R' },
        { cat: 'Documentation', val: 'Markdown, LaTeX (Expert)' },
        { cat: 'Community Tools', val: 'Discord, Telegram, Zealy, Galxe, Collab.Land, Wick Bot, Rose Bot' },
        { cat: 'Web3 Ecosystem', val: 'Solana Wallet Integration, DePIN, Tokenomics, DAO Governance' }
      ];

      skillsData.forEach(item => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(item.cat, 18, y);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(bodyColor[0], bodyColor[1], bodyColor[2]);

        const wrappedVal = doc.splitTextToSize(item.val, 126);
        wrappedVal.forEach((line: string, index: number) => {
          doc.text(line, 66, y + (index * 4));
        });

        y += Math.max(wrappedVal.length * 4, 5) + 2.2;
      });

      y += 2;

      // Key Competencies Section
      addSectionHeader('Key Competencies', 45);

      const devCompetencies = [
        'CS Theory, Complexity Classes & Optimisation',
        'Advanced ML & LLM Architecture',
        'RLHF Tuning & Prompt Engineering',
        'Academic Content Authoring & Logic Proofs',
        'Technical Documentation Review & Verification'
      ];

      const commCompetencies = [
        'Crisis Management & FUD De-escalation',
        'Anti-Spam, Bot Mitigation & Platform Security',
        'Incentivised Engagement (Quests, Rewards, Campaigns)',
        'AMA Hosting & Live Event Coordination',
        'Tokenomics Strategy & Community Growth'
      ];

      doc.setFillColor(241, 245, 249);
      doc.rect(18, y, 84, 6.5, 'F');
      doc.rect(106, y, 86, 6.5, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text('DEVELOPMENT', 21, y + 4.5);
      doc.text('COMMUNITY & MODERATION', 109, y + 4.5);
      y += 9.5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(bodyColor[0], bodyColor[1], bodyColor[2]);

      const linesCount = Math.max(devCompetencies.length, commCompetencies.length);
      for (let i = 0; i < linesCount; i++) {
        if (devCompetencies[i]) {
          doc.text('•', 21, y);
          const splitLine = doc.splitTextToSize(devCompetencies[i], 78);
          splitLine.forEach((l: string, idx: number) => {
            doc.text(l, 25, y + (idx * 3.8));
          });
        }
        if (commCompetencies[i]) {
          doc.text('•', 109, y);
          const splitLine = doc.splitTextToSize(commCompetencies[i], 80);
          splitLine.forEach((l: string, idx: number) => {
            doc.text(l, 113, y + (idx * 3.8));
          });
        }
        const devHeight = devCompetencies[i] ? doc.splitTextToSize(devCompetencies[i], 78).length * 3.8 : 0;
        const commHeight = commCompetencies[i] ? doc.splitTextToSize(commCompetencies[i], 80).length * 3.8 : 0;
        y += Math.max(devHeight, commHeight, 4.5) + 1.5;
      }

      // Force Interests to Page 3 to match the exact page layout of his real paper resume
      doc.addPage();
      y = 18;

      addSectionHeader('Interests', 35);

      const interestsData = [
        { title: 'Algorithmic Transparency', text: 'Passionate about understanding how ML models process and reason about data, and the critical importance of factual accuracy in generative AI outputs.' },
        { title: 'Linguistic Nuance in AI', text: 'Fascinated by the subtle differences between human-sounding text and robotic outputs, and how that insight can train more natural, empathetic AI models.' },
        { title: 'Prompt Engineering & LLM Optimisation', text: 'Continuously exploring how carefully crafted instructions shape AI reasoning quality, output structure, and task performance.' },
        { title: 'Knowledge Synthesis', text: 'Enjoys distilling dense research into structured, accessible tutorials and study guides that empower learners at every level.' },
        { title: 'Community Dynamics & Web3 Governance', text: 'Deeply interested in the social mechanics of digital-native communities, including how tokenomics and on-chain governance models can be leveraged to reward positive contribution and cultivate long-term loyalty.' }
      ];

      interestsData.forEach(item => {
        if (y + 12 > 275) {
          doc.addPage();
          y = 18;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text('•', 21, y);
        doc.text(item.title, 25, y);
        
        const tw = doc.getTextWidth(item.title);
        doc.text(' — ', 25 + tw, y);
        const dw = doc.getTextWidth(' — ');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(bodyColor[0], bodyColor[1], bodyColor[2]);
        
        const firstLineAvail = 168 - tw - dw;
        const descWords = item.text.split(' ');
        let firstLineText = '';
        let wordIdx = 0;
        
        while (wordIdx < descWords.length) {
          const testText = firstLineText ? firstLineText + ' ' + descWords[wordIdx] : descWords[wordIdx];
          if (doc.getTextWidth(testText) > firstLineAvail) {
            break;
          }
          firstLineText = testText;
          wordIdx++;
        }
        
        doc.text(firstLineText, 25 + tw + dw, y);
        y += 4.5;

        if (wordIdx < descWords.length) {
          const remainderText = descWords.slice(wordIdx).join(' ');
          const splitRemainder = doc.splitTextToSize(remainderText, 168);
          splitRemainder.forEach((line: string) => {
            if (y > 275) {
              doc.addPage();
              y = 18;
            }
            doc.text(line, 25, y);
            y += 4.5;
          });
        }
        y += 2.2;
      });

      doc.save('Godtime_Benson_Resume.pdf');
    } else {
      // In case they configured a real link
      window.open(profile.resumeUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const cycleThemeMode = (e?: ReactMouseEvent<HTMLElement> | MouseEvent) => {
    playNavTick();
    let clickX = window.innerWidth / 2;
    let clickY = window.innerHeight / 2;

    if (e && e.clientX !== undefined && e.clientY !== undefined && e.clientX !== 0 && e.clientY !== 0) {
      clickX = e.clientX;
      clickY = e.clientY;
    } else {
      // Look up toggle buttons dynamically to center the ripple source if coords are not passed
      const btn = document.getElementById('theme-toggle-btn') || 
                  document.getElementById('mobile-theme-toggle-btn') || 
                  document.querySelector('button[aria-label="Toggle theme mode"]') ||
                  document.getElementById('theme-toggle-capsule');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        clickX = rect.left + rect.width / 2;
        clickY = rect.top + rect.height / 2;
      }
    }

    setRipplePosition({ x: clickX, y: clickY });

    // Cycle: system -> light -> dark -> system
    let nextMode: 'light' | 'dark' | 'system' = 'light';
    if (themeMode === 'system') {
      nextMode = 'light';
    } else if (themeMode === 'light') {
      nextMode = 'dark';
    } else {
      nextMode = 'system';
    }

    // Determine target darkness for transitioning fader color
    let nextIsDark = false;
    if (nextMode === 'system') {
      nextIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      nextIsDark = nextMode === 'dark';
    }

    setFaderColor(nextIsDark ? 'dark' : 'light');
    setFaderActive(true);
    
    // Smooth timing orchestrator: wait 280ms for the expanding circle to cover the viewport fully
    setTimeout(() => {
      setThemeMode(nextMode);
      
      // Let it state flip instantly, then release the fader with standard timing
      setTimeout(() => {
        setFaderActive(false);
      }, 250);
    }, 280);
  };

  const handleScrollToSection = (id: string) => {
    playNavTick();
    setActiveSection(id);
    
    if (id === 'home') {
      const rightPanel = document.getElementById('right-scroll-panel');
      if (rightPanel && window.innerWidth >= 1024) {
        rightPanel.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
      return;
    }
    
    const element = document.getElementById(id);
    if (!element) return;
    
    // Check if in desktop split view
    const rightPanel = document.getElementById('right-scroll-panel');
    if (rightPanel && window.innerWidth >= 1024) {
      rightPanel.scrollTo({
        top: element.offsetTop - 20,
        behavior: 'smooth'
      });
    } else {
      // Handle mobile scroll with page header offset
      const headerOffset = 90; // Mobile sticky nav height offset
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const profile = editableData.profile;

  const handleSocialRedirect = (e: ReactMouseEvent<HTMLAnchorElement>, url: string, label: string) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('trigger-redirect-island', {
      detail: { url, name: label }
    }));
  };

  const handleSocialGlanceStart = (url?: string, name?: string) => {
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }
    window.dispatchEvent(new CustomEvent('trigger-glance-island', {
      detail: { type: 'social', url, name }
    }));
  };

  const handleSocialGlanceEnd = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }
    window.dispatchEvent(new CustomEvent('trigger-glance-end-island'));
  };

  if (isAdminView) {
    return (
      <AdminPanel
        currentData={editableData}
        onSave={async (newData) => {
          setEditableData(newData);
          try {
            localStorage.setItem('portfolio_data', JSON.stringify(newData));
            await fetch('/api/portfolio', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(newData),
            });
          } catch (e) {
            console.error('Failed to globally save portfolio data changes:', e);
          }
        }}
        onClose={() => {
          navigateTo('/');
        }}
      />
    );
  }

  return (
    <div className={`w-screen min-h-screen bg-zinc-100/40 dark:bg-[#060606] text-zinc-800 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-zinc-900 transition-colors duration-300 md:p-3 lg:p-4 xl:p-6 overflow-x-hidden lg:h-screen lg:overflow-hidden flex items-center justify-center ${glitchActive ? 'phantom-glitch-active' : ''}`}>
      
      {/* Hidden SVG custom digital displacement map filters for actual organic/webbed tearing and warping */}
      <svg className="fixed w-0 h-0 pointer-events-none select-none overflow-hidden" aria-hidden="true" style={{ visibility: 'hidden' }}>
        <defs>
          <filter id="phantom-webbed-disp">
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.15" numOctaves="3" result="turb" />
            <feDisplacementMap in="SourceGraphic" in2="turb" scale="40" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Ghostly scanlines and analog digital noise layers animated via motion for supreme fluid experience */}
      <AnimatePresence>
        {glitchActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="fixed inset-0 z-[100021] pointer-events-none"
          >
            <div className="phantom-scanlines" />
            <div className="phantom-static-noise" />
            <div className="phantom-transmission-bar" />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: [0, 0.45, 0.15, 0.35, 0], scale: 1 }}
              transition={{ duration: 1.5, times: [0, 0.08, 0.15, 0.22, 1], ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center bg-cyan-500/5 mix-blend-color-dodge"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline Page Overlay */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100010] flex items-center justify-center p-4 bg-zinc-100/90 dark:bg-[#030303]/92 backdrop-blur-xl transition-colors duration-300 pointer-events-auto"
          >
            <motion.div
              initial={{ scale: 0.96, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="w-full max-w-md p-8 md:p-10 rounded-2xl border border-zinc-200/60 dark:border-zinc-850/60 bg-white/70 dark:bg-black/40 shadow-2xl backdrop-blur-md relative overflow-hidden"
            >
              {/* Concentric ambient layout outline in card */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-900 dark:from-zinc-800 dark:via-zinc-500 dark:to-zinc-100" />
              
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="p-4 rounded-full bg-zinc-100 dark:bg-white/[0.04] text-zinc-900 dark:text-zinc-50 border border-zinc-200/50 dark:border-white/[0.05] relative animate-pulse">
                  <WifiOff size={32} strokeWidth={1.5} />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950" />
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-display font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                    Offline Workspace
                  </h2>
                  <p className="text-xs font-mono tracking-wider uppercase text-zinc-400 dark:text-zinc-500">
                    Viewing Offline Snap
                  </p>
                </div>

                <p className="text-sm text-zinc-500 dark:text-zinc-450 font-sans leading-relaxed max-w-xs font-light">
                  You are currently viewing a localized offline copy of this developer playground. To sync live builds, please verify your internet connectivity and run a routing trace test.
                </p>

                {/* Interactive Signal/Internet status checker indicator */}
                <div className="w-full py-3.5 px-4 rounded-xl bg-zinc-50 dark:bg-white/[0.02] border border-zinc-200/40 dark:border-white/[0.02] text-xs font-mono flex items-center justify-between select-none">
                  <span className="text-zinc-500 dark:text-zinc-400">Network State</span>
                  <div className="flex items-center gap-2">
                    {isTestingConnection ? (
                      <span className="flex items-center gap-1.5 text-zinc-500">
                        <RefreshCw size={12} className="animate-spin text-zinc-400" />
                        Pinging...
                      </span>
                    ) : testOutcome === 'success' ? (
                      <span className="text-emerald-500 font-medium flex items-center gap-1">
                        ● Online (Synced)
                      </span>
                    ) : testOutcome === 'failure' ? (
                      <span className="text-rose-500 font-medium flex items-center gap-1 animate-bounce">
                        ● Offline (Check)
                      </span>
                    ) : (
                      <span className="text-amber-500 font-medium flex items-center gap-1">
                        ● Disconnected
                      </span>
                    )}
                  </div>
                </div>

                <div className="w-full flex flex-col gap-2 pt-2">
                  <motion.button
                    onClick={handleRetestConnection}
                    disabled={isTestingConnection}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 font-mono text-xs font-bold tracking-wider uppercase transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw size={13} className={isTestingConnection ? "animate-spin" : ""} />
                    {isTestingConnection ? "Tracing Connection..." : "Check/Try Again"}
                  </motion.button>

                  <button
                    onClick={() => {
                      playSoftClick();
                      // Bypass and browse offline snapshot
                      setIsOffline(false);
                    }}
                    className="w-full py-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-white/[0.02] text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors font-mono text-[10px] uppercase tracking-wider cursor-pointer"
                  >
                    Browse Local Offline Snapshot
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Static/Interactive coordinates workspace background */}
      <ThreeDBackground />

      {/* Slim Scroll Progress Bar at the absolute top of the window */}
      <div className="fixed top-0 left-0 right-0 h-[3.5px] z-[100005] bg-zinc-200/10 dark:bg-zinc-900/40 overflow-hidden select-none pointer-events-none">
        <motion.div 
          className="h-full bg-gradient-to-r from-zinc-400 via-zinc-855 to-zinc-950 dark:from-zinc-500 dark:via-zinc-200 dark:to-zinc-50 rounded-r-lg origin-left" 
          style={{ originX: 0, scaleX: 0 }}
          animate={{ scaleX: Math.min(100, Math.max(0, scrollProgress)) / 100 }}
          transition={{ type: "spring", stiffness: 180, damping: 28, mass: 0.1 }}
        />
      </div>
      
      {/* Structural Header (Only active below lg viewports to stay neat) */}
      <Header
        profile={profile}
        darkMode={darkMode}
        themeMode={themeMode}
        toggleThemeMode={cycleThemeMode}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main Structural Layout Border Card Frame */}
      <motion.div
        id="main-layout-card"
        className="flex flex-col lg:flex-row w-full h-auto lg:h-full border border-zinc-200/50 dark:border-zinc-850/80 md:rounded-2xl lg:overflow-hidden bg-white/75 dark:bg-[#0e0e0e]/75 backdrop-blur-md shadow-xs lg:max-h-full z-10"
        style={{
          transformStyle: 'preserve-3d',
          transformPerspective: 1200,
          filter: burstWave && burstWave.active ? 'url(#liquid-water-wave)' : 'none',
        }}
        animate={burstWave && burstWave.active ? {
          // A single, extremely soft, slow-dissolving non-bouncy layout surge
          translateY: [0, 3, 0],
          scale: [1, 1.002, 1],
          rotateX: [0, 0.3, 0],
          z: [0, -2, 0]
        } : {
          translateY: 0,
          rotateX: 0,
          scale: 1,
          z: 0
        }}
        transition={{
          duration: 1.85,
          ease: [0.25, 1, 0.5, 1]
        }}
      >
        
        {isNotFound ? (
          <NotFound 
            darkMode={darkMode}
            onGoHome={() => {
              setIsNotFound(false);
              window.history.pushState({}, '', '/');
            }}
          />
        ) : (
          <>
            {/* LEFT STICKY SIDEBAR (Intro & Identity Block) */}
            <aside className="w-full lg:w-[40%] xl:w-[38%] border-b lg:border-b-0 lg:border-r border-zinc-200/50 dark:border-zinc-850/80 pt-24 pb-6 px-6 sm:pt-28 sm:pb-10 sm:px-10 lg:p-12 flex flex-col justify-between h-auto lg:h-full overflow-visible lg:overflow-y-auto shrink-0 bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-md">
          
          {/* Header row (Brand Logo & Switches) - Hidden on mobile/tablet to avoid duplicate clashing elements */}
          <div className="hidden lg:flex justify-between items-center mb-10 select-none">
            <div className="text-lg font-bold tracking-tighter hover:text-zinc-500 transition-colors cursor-pointer" onClick={() => handleScrollToSection('work')}>
              {profile.name.charAt(0)}.{profile.sirName ? profile.sirName.charAt(0) : ''}.
            </div>
            
            <div className="flex items-center gap-4">
              {/* Minimal Custom Sound Toggle */}
              <button 
                onClick={toggleSound}
                className="flex items-center gap-2 group cursor-pointer"
                aria-label="Toggle minimalist sound effects"
              >
                <div className={`w-8 h-4 rounded-full p-0.5 transition-colors relative border ${
                  soundMuted ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800' : 'bg-zinc-900 dark:bg-zinc-50 border-zinc-950 dark:border-zinc-50'
                }`}>
                  <div className={`w-2.5 h-2.5 bg-zinc-400 dark:bg-zinc-650 rounded-full transition-transform duration-300 transform ${
                    soundMuted ? 'translate-x-0' : 'translate-x-4 bg-white dark:bg-zinc-950'
                  }`} />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-mono select-none">
                  {soundMuted ? 'Mute' : 'SFX'}
                </span>
              </button>

              {/* Minimal Custom Three-Way Theme Switcher (Light | Dark | System) */}
              <div 
                id="theme-toggle-capsule"
                className="flex items-center gap-1 p-0.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-105/40 dark:bg-zinc-900/40 select-none"
              >
                {(['light', 'dark', 'system'] as const).map((mode) => {
                  const isActive = themeMode === mode;
                  let Icon = Sun;
                  let label = 'Light';
                  if (mode === 'dark') {
                    Icon = Moon;
                    label = 'Dark';
                  } else if (mode === 'system') {
                    Icon = Monitor;
                    label = 'System';
                  }

                  return (
                    <button
                      key={mode}
                      onClick={(e) => {
                        playNavTick();
                        let clickX = e.clientX || window.innerWidth / 2;
                        let clickY = e.clientY || window.innerHeight / 2;
                        setRipplePosition({ x: clickX, y: clickY });

                        let nextIsDark = false;
                        if (mode === 'system') {
                          nextIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                        } else {
                          nextIsDark = mode === 'dark';
                        }

                        setFaderColor(nextIsDark ? 'dark' : 'light');
                        setFaderActive(true);

                        setTimeout(() => {
                          setThemeMode(mode);
                          setTimeout(() => {
                            setFaderActive(false);
                          }, 250);
                        }, 280);
                      }}
                      className={`relative px-2.5 py-1 rounded-full transition-all text-[9px] font-mono uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer select-none outline-none ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 shadow-xs'
                          : 'text-zinc-400 hover:text-zinc-650 dark:text-zinc-500 dark:hover:text-zinc-300'
                      }`}
                      title={`${label} Mode`}
                      aria-label={`Switch theme to ${label}`}
                    >
                      <Icon size={10} />
                      <span className="hidden sm:inline font-semibold">{label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Hero Branding & Core text */}
          <div className="space-y-6 my-auto pt-4 pb-8 lg:py-0">
            
            {/* Map Pin Location & Role tag */}
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              <MapPin size={12} className="text-zinc-400 dark:text-zinc-600 animate-pulse" />
              <span>{profile.location}</span>
            </div>

            {/* Signature Title Heading (Triple-tap/click triggers Ghostly Glitch) */}
            <h1 
              onTouchStart={handleCreativeDeveloperTap}
              onClick={handleCreativeDeveloperTap}
              className="text-5xl sm:text-6xl font-display font-medium leading-[0.95] tracking-tight text-zinc-900 dark:text-white cursor-pointer select-none active:scale-[0.98] transition-transform duration-200 hover:text-zinc-600 dark:hover:text-zinc-300"
              title="Triple click/tap me for the secret phantom glitch..."
            >
              <ScrambleText>{profile.headingLine1 || "Creative"}</ScrambleText>
              <br />
              <ScrambleText>{profile.headingLine2 || "Developer"}</ScrambleText>
            </h1>

            {/* Subtext description */}
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-[320px] font-sans font-light">
              {profile.bio}
            </p>

            {/* Micro Anchor Section shortcut buttons */}
            <div className="pt-2">
              <motion.a
                id="hero-resume-download-btn"
                href={profile.resumeUrl}
                onClick={handleDownloadResume}
                download="Godtime_Benson_Resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-mono font-bold tracking-wider uppercase bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 transition-colors shadow-xs select-none cursor-pointer border border-zinc-900 dark:border-zinc-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Download size={13} />
                Download Resume
              </motion.a>
            </div>

            {/* Micro Anchor Section shortcuts with line slide animation in a sleek glassmorphic container */}
            <nav className="hidden lg:flex flex-col gap-3.5 font-mono text-[10px] uppercase tracking-widest text-zinc-500 dark:text-zinc-400 select-none p-4 bg-zinc-100/15 dark:bg-white/[0.01] border border-zinc-200/40 dark:border-zinc-850/30 rounded-xl backdrop-blur-md max-w-[210px] shadow-xs">
              <button 
                onClick={() => handleScrollToSection('work')}
                onMouseEnter={playSoftClick}
                className={`transition-colors flex items-center gap-2 group text-left cursor-pointer outline-none ${
                  activeSection === 'work' ? 'text-zinc-900 dark:text-white font-semibold' : 'hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <span>01</span> 
                <span className={`h-px transition-all duration-300 bg-current ${
                  activeSection === 'work' ? 'w-8' : 'w-4 group-hover:w-6'
                }`}></span> 
                Selected Works
              </button>
              <button 
                onClick={() => handleScrollToSection('skills')}
                onMouseEnter={playSoftClick}
                className={`transition-colors flex items-center gap-2 group text-left cursor-pointer outline-none ${
                  activeSection === 'skills' ? 'text-zinc-900 dark:text-white font-semibold' : 'hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <span>02</span> 
                <span className={`h-px transition-all duration-300 bg-current ${
                  activeSection === 'skills' ? 'w-8' : 'w-4 group-hover:w-6'
                }`}></span> 
                Technical Skills
              </button>
              <button 
                onClick={() => handleScrollToSection('experience')}
                onMouseEnter={playSoftClick}
                className={`transition-colors flex items-center gap-2 group text-left cursor-pointer outline-none ${
                  activeSection === 'experience' ? 'text-zinc-900 dark:text-white font-semibold' : 'hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <span>03</span> 
                <span className={`h-px transition-all duration-300 bg-current ${
                  activeSection === 'experience' ? 'w-8' : 'w-4 group-hover:w-6'
                }`}></span> 
                Career Logs
              </button>
              <button 
                onClick={() => handleScrollToSection('contact')}
                onMouseEnter={playSoftClick}
                className={`transition-colors flex items-center gap-2 group text-left cursor-pointer outline-none ${
                  activeSection === 'contact' ? 'text-zinc-900 dark:text-white font-semibold' : 'hover:text-zinc-800 dark:hover:text-zinc-300'
                }`}
              >
                <span>04</span> 
                <span className={`h-px transition-all duration-300 bg-current ${
                  activeSection === 'contact' ? 'w-8' : 'w-4 group-hover:w-6'
                }`}></span> 
                Get In Touch
              </button>
            </nav>
          </div>

          {/* Availability Status & Social list footer block */}
          <div className="space-y-8 pt-6 border-t border-zinc-100 dark:border-zinc-850/60 lg:border-t-0 select-none">
            
            {/* Status dot */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-600 font-bold">Availability</span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></div>
                <span className="text-xs text-zinc-700 dark:text-zinc-300">{profile.status}</span>
              </div>
            </div>

            {/* Inline uppercase monochrome social anchors */}
            <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block mb-1">
              {profile.socialLinks.filter(l => l.platform !== 'email').map((link) => (
                <a 
                  key={link.platform} 
                  href={link.url}
                  onClick={(e) => handleSocialRedirect(e, link.url, link.label)}
                  onMouseEnter={() => handleSocialGlanceStart(link.url, link.label)}
                  onMouseLeave={handleSocialGlanceEnd}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
              <a 
                href={`mailto:${profile.email}`}
                onClick={(e) => handleSocialRedirect(e, `mailto:${profile.email}`, 'Email Client')}
                onMouseEnter={() => handleSocialGlanceStart(`mailto:${profile.email}`, 'Email Client')}
                onMouseLeave={handleSocialGlanceEnd}
                className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Mail size={10} /> Email
              </a>
            </nav>
          </div>
        </aside>

        {/* RIGHT MAIN SCROLLABLE BOARD (Action Modules Gallery) */}
        <main 
          id="right-scroll-panel" 
          className="w-full lg:w-[60%] xl:w-[62%] flex flex-col h-auto lg:h-full overflow-visible lg:overflow-y-auto scroll-smooth bg-zinc-50/30 dark:bg-[#0e0e0e] scrollbar-thin divide-y divide-zinc-200/50 dark:divide-zinc-850/60"
        >
          
          <div id="work">
            <Projects projects={editableData.projects} isLoading={isInitialLoading} />
          </div>
          
          <div id="skills">
            <Skills skills={editableData.skills} />
          </div>
          
          <div id="experience">
            <ExperienceSection experiences={editableData.experiences} isLoading={isInitialLoading} />
          </div>
          
          <div id="contact">
            <Contact profile={profile} />
          </div>

          <Footer profile={profile} />

        </main>
        </>
        )}
      </motion.div>

      {/* Modern circular reveal ripple animation overlay */}
      <AnimatePresence>
        {faderActive && ripplePosition && (
          <div className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden select-none">
            <motion.div
              style={{
                position: 'absolute',
                left: ripplePosition.x,
                top: ripplePosition.y,
                width: 4,
                height: 4,
                borderRadius: '50%',
                x: '-50%',
                y: '-50%',
                transformOrigin: 'center',
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ 
                scale: Math.max(window.innerWidth, window.innerHeight) * 2.5,
                opacity: [1, 1, 0.95, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{
                scale: { duration: 0.52, ease: [0.4, 0, 0.1, 1] },
                opacity: { duration: 0.52, times: [0, 0.5, 0.8, 1] }
              }}
              className={faderColor === 'dark' ? 'bg-[#060606]' : 'bg-zinc-100'}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Permanent, direct-DOM manipulated Pull-to-Refresh Indicator block for 120fps physics */}
      <div
        id="custom-pull-indicator"
        className="fixed w-14 h-14 rounded-full border border-sky-400/35 dark:border-sky-300/25 bg-white/95 dark:bg-zinc-900/95 shadow-[0_4px_22px_rgba(56,189,248,0.18)] dark:shadow-[0_4px_28px_rgba(56,189,248,0.28)] flex items-center justify-center pointer-events-none select-none"
        style={{
          position: 'fixed',
          top: '-80px', // initially safely off-screen
          left: '50%',
          transform: 'translate3d(-50%, 0, 0) scale(0)',
          zIndex: 100000,
          opacity: 0,
          willChange: 'transform, opacity, left',
          perspective: '1000px',
          transformStyle: 'preserve-3d',
        }}
      >
        <svg 
          className="pull-icon w-6 h-6 text-sky-500 dark:text-sky-400"
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2.5}
          style={{ transition: 'transform 75ms linear', willChange: 'transform' }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>

      {/* 3D Liquid Water Ripple Displacement Filter for Organic Page Distortion */}
      <svg className="absolute w-0 h-0 pointer-events-none" style={{ visibility: 'hidden', position: 'absolute' }}>
        <defs>
          <filter id="liquid-water-wave" x="-10%" y="-10%" width="120%" height="120%">
            {/* Cascading Semicircle Wave Propagation dynamic turbulence pattern */}
            <motion.feTurbulence
              type="fractalNoise"
              numOctaves="3"
              result="noise"
              animate={burstWave && burstWave.active ? {
                baseFrequency: [
                  "0.002 0.004",   // Soft rolling start at the top
                  "0.005 0.008",   // Propagating downward, expanding wavelengths
                  "0.008 0.012",   // Center of wave cascading with rich organic detail
                  "0.004 0.006",   // Gently widening and calming wave crests
                  "0.001 0.002",   // Soft residual ripples dissolving
                  "0.000 0.000"    // Calm, glass-like absolute quietude
                ],
                seed: [2, 6, 12, 18, 24, 30]
              } : {
                baseFrequency: "0.0 0.0",
                seed: 2
              }}
              transition={{
                duration: 1.85,
                times: [0, 0.18, 0.42, 0.68, 0.88, 1],
                ease: "easeInOut"
              }}
            />
            <motion.feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              xChannelSelector="R"
              yChannelSelector="G"
              result="displacement"
              animate={burstWave && burstWave.active ? {
                scale: [0, 22, 35, 20, 6, 0], // Smooth rise, peak cascade, and gentle transition back to silent glass
              } : {
                scale: 0
              }}
              transition={{
                duration: 1.85,
                times: [0, 0.15, 0.38, 0.65, 0.85, 1],
                ease: [0.16, 1, 0.3, 1]
              }}
            />
          </filter>
        </defs>
      </svg>

      {/* Minimal Glassy Spinner during Workspace Sync */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: 24, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: 'fixed',
              left: '50%',
              zIndex: 100000,
            }}
            className="w-11 h-11 rounded-full border border-sky-400/30 dark:border-sky-300/20 bg-sky-500/10 dark:bg-sky-400/15 backdrop-blur-md shadow-lg flex items-center justify-center select-none pointer-events-none"
          >
            <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent dark:border-sky-400 dark:border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* High-fidelity Apple style Dynamic Island bottom helper */}
      <AnimatePresence>
        {island.type !== 'none' && (
          <DynamicIsland 
            island={island} 
            onClose={() => setIsland({ type: 'none' })} 
            onResumeConfirm={executeActualResumeDownload}
          />
        )}
      </AnimatePresence>

      {/* Cozy low volume Minecraft soundtrack block */}
      <MiceOnVenusPlayer />

    </div>
  );
}
