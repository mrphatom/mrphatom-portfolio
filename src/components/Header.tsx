import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { Profile } from '../types';
import { playSoftClick, playNavTick } from '../utils/audio';

interface HeaderProps {
  profile: Profile;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onScrollToSection?: (id: string) => void;
}

export default function Header({ profile, darkMode, toggleDarkMode, onScrollToSection }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  // Track scrolling to add backdrop blur
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // Simple active link detection
      const sections = ['home', 'work', 'skills', 'experience', 'contact'];
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

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#home', label: 'Home', id: 'home' },
    { href: '#work', label: 'Work', id: 'work' },
    { href: '#skills', label: 'Skills', id: 'skills' },
    { href: '#experience', label: 'Experience', id: 'experience' },
    { href: '#contact', label: 'Contact', id: 'contact' },
  ];

  const handleLinkClick = (id: string) => {
    playNavTick();
    setActiveSection(id);
    setMobileMenuOpen(false);
    
    // Slight delay to let the mobile menu sliding drawer collapse and stabilize page height
    setTimeout(() => {
      if (onScrollToSection) {
        onScrollToSection(id);
      }
    }, 280);
  };

  return (
    <header
      id="header-nav"
      className="lg:hidden fixed top-3 left-3 right-3 sm:top-4 sm:left-5 sm:right-5 z-50 transition-all duration-300 bg-white/45 dark:bg-[#060606]/35 border border-zinc-200/40 dark:border-zinc-850/40 backdrop-blur-xl py-2.5 px-4 rounded-xl shadow-xs"
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Brand Logo */}
        <motion.a
          id="logo-link"
          href="#work"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('work');
          }}
          onMouseEnter={playSoftClick}
          className="font-display font-medium text-base tracking-tight select-none flex items-center gap-1.5"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="text-zinc-900 dark:text-zinc-50">{profile.name}</span>
          {profile.sirName && (
            <span className="text-zinc-400 dark:text-zinc-500 font-light">{profile.sirName}</span>
          )}
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
        </motion.a>

        {/* Desktop Navigation */}
        <nav id="desktop-nav" className="hidden md:flex items-center gap-8">
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLinkClick(link.id);
                  }}
                  onMouseEnter={playSoftClick}
                  className={`relative py-1 text-sm font-medium transition-colors ${
                    activeSection === link.id
                      ? 'text-zinc-900 dark:text-zinc-50'
                      : 'text-zinc-550 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200'
                  }`}
                >
                  {link.label}
                  {activeSection === link.id && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-zinc-900 dark:bg-zinc-50"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

          {/* Theme Switcher Button */}
          <motion.button
            id="theme-toggle-btn"
            onClick={toggleDarkMode}
            onMouseEnter={playSoftClick}
            className="p-2 rounded-full border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle theme mode"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </motion.button>
        </nav>

        {/* Mobile Nav Button */}
        <div className="flex items-center gap-3 md:hidden">
          {/* Theme Switcher Button Mobile */}
          <button
            id="mobile-theme-toggle-btn"
            onClick={toggleDarkMode}
            onMouseEnter={playSoftClick}
            className="p-2 rounded-full border border-zinc-200/50 dark:border-zinc-800/50 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
            aria-label="Toggle theme mode"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <button
            id="mobile-burger-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            onMouseEnter={playSoftClick}
            className="p-2 rounded-lg border border-zinc-200/50 dark:border-zinc-805 text-zinc-805 dark:text-zinc-100 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-zinc-200/20 dark:border-zinc-850/20 bg-white/20 dark:bg-black/10 backdrop-blur-xl overflow-hidden mt-2 pt-2.5 rounded-b-lg"
          >
            <nav className="px-2 pb-3.5 flex flex-col gap-4">
              <ul className="flex flex-col gap-2.5">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(link.id);
                      }}
                      onMouseEnter={playSoftClick}
                      className={`block py-1.5 px-2 text-sm font-medium rounded-lg transition-colors ${
                        activeSection === link.id
                          ? 'text-zinc-900 dark:text-zinc-50 bg-zinc-100/40 dark:bg-white/[0.05] border-l-2 border-zinc-900 dark:border-zinc-50'
                          : 'text-zinc-550 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100/20 dark:hover:bg-white/[0.02]'
                      }`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
