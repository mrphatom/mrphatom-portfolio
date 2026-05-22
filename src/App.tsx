import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { portfolioData } from './data';
import Header from './components/Header';
import Projects from './components/Projects';
import Skills from './components/Skills';
import ExperienceSection from './components/Experience';
import Contact from './components/Contact';
import Footer from './components/Footer';
import { Mail, MapPin } from 'lucide-react';

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
    };

    const rightPanel = document.getElementById('right-scroll-panel');
    if (rightPanel) {
      rightPanel.addEventListener('scroll', handleScroll);
    }
    
    // Fallback/standard behavior for mobile screen viewports
    const handleWindowScroll = () => {
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

    return () => {
      if (rightPanel) {
        rightPanel.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, []);

  const [faderActive, setFaderActive] = useState(false);
  const [faderColor, setFaderColor] = useState<'light' | 'dark'>('dark');

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setFaderColor(nextDark ? 'dark' : 'light');
    setFaderActive(true);
    
    // Smooth timing orchestrator: wait 220ms (half-way/fade-in Peak), swap CSS DOM classes, then fade-out overlay
    setTimeout(() => {
      setDarkMode(nextDark);
      
      // Let it switch state instantly, then release fader state beautifully
      setTimeout(() => {
        setFaderActive(false);
      }, 50);
    }, 220);
  };

  const handleScrollToSection = (id: string) => {
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
      
      {/* Structural Header (Only active below lg viewports to stay neat) */}
      <Header
        profile={profile}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main Structural Layout Border Card Frame */}
      <div className="flex flex-col lg:flex-row w-full h-auto lg:h-full border border-zinc-200/50 dark:border-zinc-850/80 md:rounded-2xl lg:overflow-hidden bg-white dark:bg-[#0e0e0e] shadow-xs lg:max-h-full">
        
        {/* LEFT STICKY SIDEBAR (Intro & Identity Block) */}
        <aside className="w-full lg:w-[40%] xl:w-[38%] border-b lg:border-b-0 lg:border-r border-zinc-200/50 dark:border-zinc-850/80 pt-24 pb-6 px-6 sm:pt-28 sm:pb-10 sm:px-10 lg:p-12 flex flex-col justify-between h-auto lg:h-full overflow-visible lg:overflow-y-auto shrink-0 bg-white dark:bg-[#0a0a0a]">
          
          {/* Header row (Brand Logo & Dark Switch) - Hidden on mobile/tablet to avoid duplicate clashing elements */}
          <div className="hidden lg:flex justify-between items-center mb-10 select-none">
            <div className="text-lg font-bold tracking-tighter hover:text-zinc-500 transition-colors cursor-pointer" onClick={() => handleScrollToSection('work')}>
              {profile.name.charAt(0)}.{profile.sirName ? profile.sirName.charAt(0) : ''}.
            </div>
            
            {/* Minimal Custom Slider Toggle to match mockup exactly */}
            <button 
              onClick={toggleDarkMode}
              className="flex items-center gap-3 group cursor-pointer"
              aria-label="Toggle visual contrast theme mode"
            >
              <div className={`w-10 h-5 rounded-full p-0.5 transition-colors relative border ${
                darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-100 border-zinc-200'
              }`}>
                <div className={`w-3.5 h-3.5 bg-zinc-900 dark:bg-white rounded-full transition-transform duration-300 transform ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`} />
              </div>
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                {darkMode ? 'Dark OS' : 'Light OS'}
              </span>
            </button>
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
              Creative<br />Developer
            </h1>

            {/* Subtext description */}
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-[320px] font-sans font-light">
              {profile.bio}
            </p>

            {/* Micro Anchor Section shortcuts with line slide animation */}
            <nav className="hidden lg:flex flex-col gap-3 font-mono text-[10px] uppercase tracking-widest text-zinc-400 dark:text-zinc-500 select-none pt-4">
              <button 
                onClick={() => handleScrollToSection('work')}
                className={`transition-colors flex items-center gap-2 group text-left cursor-pointer outline-none ${
                  activeSection === 'work' ? 'text-zinc-900 dark:text-white font-medium' : 'hover:text-zinc-800 dark:hover:text-zinc-300'
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
                className={`transition-colors flex items-center gap-2 group text-left cursor-pointer outline-none ${
                  activeSection === 'skills' ? 'text-zinc-900 dark:text-white font-medium' : 'hover:text-zinc-800 dark:hover:text-zinc-300'
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
                className={`transition-colors flex items-center gap-2 group text-left cursor-pointer outline-none ${
                  activeSection === 'experience' ? 'text-zinc-900 dark:text-white font-medium' : 'hover:text-zinc-800 dark:hover:text-zinc-300'
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
                className={`transition-colors flex items-center gap-2 group text-left cursor-pointer outline-none ${
                  activeSection === 'contact' ? 'text-zinc-900 dark:text-white font-medium' : 'hover:text-zinc-800 dark:hover:text-zinc-300'
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

      {/* Elegant fullscreen fader block overlay to smooth out visual state repaints when theme changes */}
      <AnimatePresence>
        {faderActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            className={`fixed inset-0 z-[10000] pointer-events-none ${
              faderColor === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white'
            }`}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
