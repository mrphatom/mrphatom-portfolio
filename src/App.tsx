import { useState, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { portfolioData } from './data';
import Header from './components/Header';
import Projects from './components/Projects';
import Skills from './components/Skills';
import ExperienceSection from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { Mail, MapPin, Download, WifiOff, RefreshCw, AlertCircle } from 'lucide-react';
import { playSoftClick, playNavTick, setGlobalMute } from './utils/audio';
import ThreeDBackground from './components/ThreeDBackground';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const storedTheme = localStorage.getItem('theme');
      if (storedTheme) {
        return storedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [activeSection, setActiveSection] = useState('work');
  const [ripplePosition, setRipplePosition] = useState<{ x: number; y: number } | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const [isOffline, setIsOffline] = useState(() => {
    try {
      return !navigator.onLine;
    } catch {
      return false;
    }
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [testOutcome, setTestOutcome] = useState<'success' | 'failure' | null>(null);

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

  // Track state changes to update document CSS nodes
  useEffect(() => {
    try {
      if (darkMode) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    } catch (e) {
      console.error("Local theme update error", e);
    }
  }, [darkMode]);

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
      rightPanel.addEventListener('scroll', handleScroll);
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
    
    window.addEventListener('scroll', handleWindowScroll);

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
    if (profile.resumeUrl === '#' || !profile.resumeUrl) {
      e.preventDefault();
      
      const resumeContent = `==================================================
GODTIME BENSON
Senior Frontend Engineer & AI Specialist / Evaluator
Lagos, Nigeria (GMT+1) | godtimebenson09@gmail.com
==================================================

SUMMARY
Senior Frontend Engineer specializing in bridging the gap between sophisticated aesthetics and high-performance frontend engineering.
Expertise in interactive web architectures, React, TypeScript, Tailwind CSS, Framer Motion, and Large Language Model (LLM) evaluations.

EXPERIENCE
AI Specialist / Evaluator
Mercor (Apr 2026 - Present)
- Evaluating, training, aligning, and building state-of-the-art AI agents and Large Language Models for complex reasoning capabilities.
- Spearheaded LLM alignment strategies and custom evaluation benchmarks to validate multi-step reasoning capabilities.
- Collaborated closely on complex prompt architectures and Reinforcement Learning from Human Feedback (RLHF) guidelines.
- Engineered custom playground interfaces and high-performance evaluation tools to streamline fine-tuning cycles.

Lead Software Engineer
Apex Systems (Sept 2024 - Apr 2026)
- Built high-performance component frameworks and automated layout benchmarks.

Loomis Visuals - Frontend Developer
(Feb 2022 - Aug 2024)
- Designed creative layout solutions and highly custom graphics integrations.

TOP PROJECTS
1. LeadsRadar Workspace
   An outreach tracking workspace and geolocation lead discovering engine designed specifically for freelance developers.
   Tech: React, TypeScript, Tailwind CSS, Kanban API, Geographic Mapping
   URL: https://github.com/mrphatom/LeadsRadar

2. AskZen Telegram Bot
   A production-grade AI-powered Telegram chatbot integrating premium paywalls via Telegram Stars.
   Tech: TypeScript, Node.js, Groq API, Telegram API, Railway CRM
   URL: https://github.com/mrphatom/AskZen

3. ChatGPT Multi-Turn Interface
   A lightweight, secure chatbot workspace featuring full thread context preservation.
   Tech: React, Vite, OpenAI APIs, Tailwind CSS, LocalState
   URL: https://github.com/mrphatom/chatgpt3

SKILLS
- Frontend: React, TypeScript, Framer Motion, Next.js, CSS/CSS Grid, Tailwind CSS
- Design: UI/UX Design, Figma Mapping, Motion Choreography
- Utilities: Blockchain Engineering, Node.js, GraphQL/REST, Git & CI/CD

==================================================
`;

      const blob = new Blob([resumeContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Godtime_Benson_Resume.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const toggleDarkMode = (e?: ReactMouseEvent<HTMLElement> | MouseEvent) => {
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
                  document.querySelector('button[aria-label="Toggle theme mode"]');
      if (btn) {
        const rect = btn.getBoundingClientRect();
        clickX = rect.left + rect.width / 2;
        clickY = rect.top + rect.height / 2;
      }
    }

    setRipplePosition({ x: clickX, y: clickY });
    const nextDark = !darkMode;
    setFaderColor(nextDark ? 'dark' : 'light');
    setFaderActive(true);
    
    // Smooth timing orchestrator: wait 280ms for the expanding circle to cover the viewport fully
    setTimeout(() => {
      setDarkMode(nextDark);
      
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

  const profile = portfolioData.profile;

  return (
    <div className="w-screen min-h-screen bg-zinc-100/40 dark:bg-[#060606] text-zinc-800 dark:text-zinc-100 selection:bg-zinc-200 dark:selection:bg-zinc-800 selection:text-zinc-900 transition-colors duration-300 md:p-3 lg:p-4 xl:p-6 overflow-x-hidden lg:h-screen lg:overflow-hidden flex items-center justify-center">
      
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
        toggleDarkMode={toggleDarkMode}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main Structural Layout Border Card Frame */}
      <div className="flex flex-col lg:flex-row w-full h-auto lg:h-full border border-zinc-200/50 dark:border-zinc-850/80 md:rounded-2xl lg:overflow-hidden bg-white/75 dark:bg-[#0e0e0e]/75 backdrop-blur-md shadow-xs lg:max-h-full z-10">
        
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

              {/* Minimal Custom Slider Toggle */}
              <button 
                onClick={toggleDarkMode}
                className="flex items-center gap-2 group cursor-pointer"
                aria-label="Toggle visual contrast theme mode"
              >
                <div className={`w-10 h-5 rounded-full p-0.5 transition-colors relative border ${
                  darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'
                }`}>
                  <div className={`w-3.5 h-3.5 bg-zinc-900 dark:bg-white rounded-full transition-transform duration-300 transform ${
                    darkMode ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 font-mono select-none">
                  {darkMode ? 'Dark' : 'Light'}
                </span>
              </button>
            </div>
          </div>

          {/* Hero Branding & Core text */}
          <div className="space-y-6 my-auto pt-4 pb-8 lg:py-0">
            
            {/* Map Pin Location & Role tag */}
            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
              <MapPin size={12} className="text-zinc-400 dark:text-zinc-600 animate-pulse" />
              <span>{profile.location}</span>
            </div>

            {/* Signature Title Heading */}
            <h1 className="text-5xl sm:text-6xl font-display font-medium leading-[0.95] tracking-tight text-zinc-900 dark:text-white">
              {profile.headingLine1 || "Creative"}<br />{profile.headingLine2 || "Developer"}
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
                download="Godtime_Benson_Resume.txt"
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
            <nav className="flex flex-wrap gap-x-5 gap-y-2 text-[10px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              {profile.socialLinks.filter(l => l.platform !== 'email').map((link) => (
                <a 
                  key={link.platform} 
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  {link.label}
                </a>
              ))}
              <a 
                href={`mailto:${profile.email}`}
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
            <Projects projects={portfolioData.projects} />
          </div>
          
          <div id="skills">
            <Skills skills={portfolioData.skills} />
          </div>
          
          <div id="experience">
            <ExperienceSection experiences={portfolioData.experiences} />
          </div>
          
          <div id="contact">
            <Contact profile={profile} />
          </div>

          <Footer profile={profile} />

        </main>
      </div>

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

    </div>
  );
}
