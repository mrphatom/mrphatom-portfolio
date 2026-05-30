import React, { useState, useEffect, MouseEvent, useRef, TouchEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Code, FolderOpen, X, ArrowUpRight, ChevronDown, ChevronUp, Sparkles, Archive } from 'lucide-react';
import { Project } from '../types';
import ProjectMockup from './ProjectMockup';
import Tilt from './Tilt';
import ScrambleText from './ScrambleText';

interface ProjectsProps {
  projects: Project[];
  isLoading?: boolean;
}

export default function Projects({ projects, isLoading }: ProjectsProps) {
  const [selectedTag, setSelectedTag] = useState('All');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [ambientLighting, setAmbientLighting] = useState(false);

  // Reset expansion state when filters change
  useEffect(() => {
    setIsExpanded(false);
  }, [selectedTag, searchQuery]);

  // Handle tech skills clicking events dynamically with fallback search integration
  useEffect(() => {
    const handleFilterEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ skill: string }>;
      const skillName = customEvent.detail?.skill;
      if (!skillName) return;

      // Extract unique tags from projects
      const featured = projects.filter(p => p.featured === true || p.featured === undefined);
      const tags = Array.from(new Set(featured.flatMap(p => p.tags)));

      // Find standard match
      const matchedTag = tags.find(tag => 
        tag.toLowerCase() === skillName.toLowerCase() ||
        skillName.toLowerCase().includes(tag.toLowerCase()) ||
        tag.toLowerCase().includes(skillName.toLowerCase())
      );

      if (matchedTag) {
        setSelectedTag(matchedTag);
        setSearchQuery('');
      } else {
        // Search filter fallback
        setSelectedTag('All');
        setSearchQuery(skillName);
      }
    };

    window.addEventListener('filter-projects-by-skill', handleFilterEvent);
    return () => {
      window.removeEventListener('filter-projects-by-skill', handleFilterEvent);
    };
  }, [projects]);

  // Swipe gesture touch references
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (touchStartY.current === null || touchStartX.current === null) return;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;

    // Detect solid, predominantly vertical swipe downwards (ONLY downwards to avoid blocking scroll down)
    if (deltaY > 75 && deltaY > Math.abs(deltaX)) {
      // Find the scrollable containers or modal elements and check scroll position
      const modalElement = document.getElementById('project-spec-modal');
      const isScrollableScrolled = modalElement && (
        modalElement.scrollTop > 5 || 
        Array.from(modalElement.querySelectorAll('.overflow-y-auto')).some(el => (el as HTMLElement).scrollTop > 5)
      );

      if (!isScrollableScrolled) {
        setActiveProject(null);
      }
    }

    touchStartY.current = null;
    touchStartX.current = null;
  };

  // Universal handler to intercept external navigation and pass to Dynamic Island
  const handleExternalRedirect = (e: MouseEvent<HTMLAnchorElement>, url: string, projectName: string) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(new CustomEvent('trigger-redirect-island', {
      detail: { url, name: projectName }
    }));
  };

  const handleGlanceStart = (type: 'repo' | 'demo', url?: string, name?: string) => {
    // Disable hover-based glance states on touch-only devices to avoid janky simulated mouse hover triggers
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }
    window.dispatchEvent(new CustomEvent('trigger-glance-island', {
      detail: { type, url, name }
    }));
  };

  const handleGlanceEnd = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }
    window.dispatchEvent(new CustomEvent('trigger-glance-end-island'));
  };


  // Dynamic Document Title Custom Synchronization
  useEffect(() => {
    const defaultTitle = "Godtime Benson - Developer Portfolio";
    if (activeProject) {
      document.title = `${activeProject.title} | Technical Specs`;
    } else if (selectedTag && selectedTag !== 'All') {
      document.title = `${selectedTag} Projects | Godtime Benson`;
    } else {
      document.title = defaultTitle;
    }

    return () => {
      document.title = defaultTitle;
    };
  }, [selectedTag, activeProject?.id, activeProject?.title]);

  // Handle focus event for the keyboard helper shortcut
  useEffect(() => {
    const handleFocusSearch = () => {
      const input = document.getElementById('project-search-input');
      if (input) {
        input.focus();
        (input as HTMLInputElement).select();
      }
    };
    window.addEventListener('focus-project-search', handleFocusSearch);
    return () => {
      window.removeEventListener('focus-project-search', handleFocusSearch);
    };
  }, []);

  // Separate projects into high-impact featured spotlight list and archived secondary projects
  const featuredOnly = projects.filter(p => p.featured === true || p.featured === undefined);
  const archivedOnly = projects.filter(p => p.featured === false);

  // Extract all unique tags dynamically from featured projects
  const allTags = ['All', ...Array.from(new Set(featuredOnly.flatMap(p => p.tags)))];

  // Filter featured projects based on tag and search
  const filteredFeaturedProjects = featuredOnly.filter(project => {
    const matchesTag = selectedTag === 'All' || project.tags.includes(selectedTag);
    const matchesSearch = !searchQuery || (
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return matchesTag && matchesSearch;
  });

  // Filter archived projects by search term
  const filteredArchivedProjects = archivedOnly.filter(project => {
    const matchesSearch = !searchQuery || (
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return matchesSearch;
  });

  const displayedProjects = isExpanded ? filteredFeaturedProjects : filteredFeaturedProjects.slice(0, 6);

  // Handle keyboard arrow navigation through project grid
  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, project: Project, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveProject(project);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const allCards = Array.from(document.querySelectorAll('#project-grid-container [data-project-card]')) as HTMLDivElement[];
      if (allCards.length === 0) return;

      let targetIndex = index;
      const isGridSingleColumn = window.innerWidth < 768; // Tailwind md breakpoint is 768px

      if (e.key === 'ArrowRight') {
        targetIndex = (index + 1) % allCards.length;
      } else if (e.key === 'ArrowLeft') {
        targetIndex = (index - 1 + allCards.length) % allCards.length;
      } else if (e.key === 'ArrowDown') {
        if (isGridSingleColumn) {
          targetIndex = (index + 1) % allCards.length;
        } else {
          targetIndex = index + 2;
          if (targetIndex >= allCards.length) {
            targetIndex = index; // Pin to bottom boundary
          }
        }
      } else if (e.key === 'ArrowUp') {
        if (isGridSingleColumn) {
          targetIndex = (index - 1 + allCards.length) % allCards.length;
        } else {
          targetIndex = index - 2;
          if (targetIndex < 0) {
            targetIndex = index; // Pin to top boundary
          }
        }
      }

      const targetCard = allCards[targetIndex];
      if (targetCard) {
        targetCard.focus();
      }
    }
  };

  // Keyboard accessibility and focus trapping inside Details dialog modal
  useEffect(() => {
    if (!activeProject) return;

    // Shift focus inside the modal initially when opened
    const timer = setTimeout(() => {
      const closeBtn = document.getElementById('close-spec-modal-btn');
      if (closeBtn) {
        closeBtn.focus();
      }
    }, 60);

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveProject(null);
        return;
      }

      if (e.key === 'Tab') {
        const modal = document.getElementById('project-spec-modal');
        if (!modal) return;

        // Collect all natively focusable nodes within container
        const focusableSelectors = 'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])';
        const focusableElements = Array.from(modal.querySelectorAll(focusableSelectors)) as HTMLElement[];
        
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [activeProject]);

  return (
    <section
      id="work"
      className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-zinc-950 border-t border-zinc-200/40 dark:border-zinc-900/40 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title Header with In-View Animation */}
        <motion.div 
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 lg:mb-12 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-blue-500 block mb-2">Curated Case Studies</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              <ScrambleText>Selected Projects</ScrambleText>
            </h2>
          </div>

          {/* Search bar and filtering buttons row */}
          <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 w-full xl:w-auto">
            {/* Minimal Project Search Input */}
            <div className="relative w-full xl:w-60">
              <input
                id="project-search-input"
                type="text"
                placeholder="Search projects... [S]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs font-mono py-2 pl-8 pr-8 bg-zinc-50 dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-805 rounded-lg outline-none text-zinc-700 dark:text-zinc-300 focus:border-zinc-450 dark:focus:border-zinc-700 transition-colors"
                aria-label="Search projects by keyword"
              />
              <span className="absolute left-2.5 top-1.5 text-zinc-400 dark:text-zinc-500 font-mono text-[9px] bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200/50 dark:border-white/[0.04] px-1 py-0.5 rounded pointer-events-none select-none">S</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-100 cursor-pointer"
                  aria-label="Clear search query"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Filtering buttons */}
            <div className="flex flex-wrap items-center gap-1.5 max-w-xl">
              {allTags.map((tag) => {
                const isActive = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all cursor-pointer select-none border ${
                      isActive
                        ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-blue-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850 dark:hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}

              <div className="h-4 w-px bg-zinc-250 dark:bg-zinc-800 mx-1 hidden sm:block" />

              {/* Ambient Glow Switch Toggle */}
              <button
                onClick={() => setAmbientLighting(!ambientLighting)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono transition-all cursor-pointer select-none border ${
                  ambientLighting 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:bg-amber-400/10 dark:border-amber-400/25 dark:text-amber-400 shadow-xs'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-amber-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-850 dark:hover:text-amber-400'
                }`}
                aria-label="Toggle ambient lighting mode"
              >
                <Sparkles size={11} className={ambientLighting ? 'text-amber-500 dark:text-amber-400 animate-[spin_4s_linear_infinite]' : 'text-zinc-400 dark:text-zinc-500'} />
                <span>Ambient Glow: {ambientLighting ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Dynamic Grid of Cards using Motion */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-900/40 rounded-xl border border-zinc-200/80 dark:border-zinc-800/50 overflow-hidden animate-pulse">
                <div className="aspect-video w-full bg-zinc-250/65 dark:bg-zinc-850/45" />
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <div className="h-5 w-1/2 bg-zinc-200/60 dark:bg-zinc-800/40 rounded-lg" />
                      <div className="h-4 w-16 bg-zinc-200/60 dark:bg-zinc-800/40 rounded-lg" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-zinc-200/60 dark:bg-zinc-800/40 rounded-md" />
                      <div className="h-3 w-5/6 bg-zinc-200/60 dark:bg-zinc-800/40 rounded-md" />
                    </div>
                  </div>
                  <div className="flex gap-1.5 pt-2">
                    <div className="h-4 w-12 bg-zinc-200/60 dark:bg-zinc-800/40 rounded-full" />
                    <div className="h-4 w-16 bg-zinc-200/60 dark:bg-zinc-800/40 rounded-full" />
                    <div className="h-4 w-10 bg-zinc-200/60 dark:bg-zinc-800/40 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredFeaturedProjects.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 14 }}
            className="flex flex-col items-center justify-center py-16 px-4 border border-zinc-200/60 dark:border-zinc-850/60 rounded-xl bg-zinc-50/20 dark:bg-zinc-950/20 text-center w-full"
          >
            <motion.div
              initial={{ rotate: -15, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 150 }}
            >
              <FolderOpen size={36} className="text-zinc-400 dark:text-zinc-505 mb-4 animate-[bounce_3s_infinite]" />
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-sm font-light text-zinc-500 dark:text-zinc-400 max-w-sm mb-4 leading-relaxed"
            >
              No projects match your filter selection or text search query. Let's start with a fresh orbit!
            </motion.p>
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              onClick={() => { setSearchQuery(''); setSelectedTag('All'); }}
              className="px-4 py-2 text-xs font-mono rounded-lg bg-zinc-900 border border-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-colors shadow-xs active:scale-95 duration-105 cursor-pointer select-none"
            >
              Reset Filters & Search
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            id="project-grid-container"
            layout
            className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8"
            style={{ perspective: 1200, transformStyle: 'preserve-3d' }}
          >
            <AnimatePresence mode="popLayout">
            {displayedProjects.map((project, index) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.94, rotateX: -6, rotateY: 5, y: 35 }}
                whileInView={{ opacity: 1, scale: [0.94, 1.025, 1], rotateX: [-6, 2.5, 0], rotateY: [5, -1, 0], y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                exit={{ opacity: 0, scale: 0.94, y: 15 }}
                transition={{ 
                  duration: 0.85,
                  ease: [0.16, 1, 0.3, 1],
                  delay: index * 0.08,
                  layout: { type: 'spring', stiffness: 360, damping: 32 }
                }}
                className="h-full"
              >
                <div
                  data-project-card
                  data-project-index={index}
                  className="group relative flex flex-col h-full outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950 rounded-xl cursor-default"
                  aria-label={`Project: ${project.title}. Role: ${project.role}.`}
                >
                  {/* Soft Adaptive Ambient Lighting Glow Effect */}
                  <AnimatePresence>
                    {ambientLighting && (
                      <motion.div
                        key="ambient-glow"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1.04 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-sky-400/20 to-transparent dark:from-sky-500/15 dark:via-blue-500/5 dark:to-transparent opacity-100 blur-xl pointer-events-none transition-all duration-500"
                      />
                    )}
                  </AnimatePresence>

                  <Tilt className={`group relative flex flex-col h-full rounded-xl border overflow-hidden transition-all duration-300 ${
                    ambientLighting 
                      ? 'bg-zinc-50/95 dark:bg-zinc-900/80 border-sky-450/35 dark:border-sky-500/25 shadow-[0_0_25px_rgba(56,189,248,0.06)] dark:shadow-[0_0_35px_rgba(56,189,248,0.12)]' 
                      : 'bg-zinc-50 dark:bg-zinc-900/60 border-zinc-200/80 dark:border-zinc-805 hover:shadow-md hover:border-zinc-350 dark:hover:border-zinc-700'
                  }`}>
                  {/* Simulated Custom Live Mockup Panel (Aesthetic Header) */}
                  <div className="relative aspect-video w-full p-4 bg-zinc-100 dark:bg-zinc-950/80 border-b border-zinc-200/50 dark:border-zinc-850/50 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full transform group-hover:scale-102 transition-transform duration-500">
                      <ProjectMockup type={project.image} />
                    </div>
                  </div>

                  {/* Card description text details */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h4 className="text-lg font-display font-semibold transition-colors text-zinc-900 dark:text-zinc-50 group-hover:text-blue-500 dark:group-hover:text-blue-400">
                          {project.title}
                        </h4>
                        <span className="text-[10px] font-mono uppercase bg-zinc-200/60 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-450 px-2 py-0.5 rounded">
                          {project.role}
                        </span>
                      </div>
                      <p className="text-sm font-light text-zinc-550 dark:text-zinc-400 leading-relaxed line-clamp-2 mb-4">
                        {project.description}
                      </p>
                    </div>

                    {/* Tags and Live code specs footer */}
                    <div className="flex flex-col gap-4 mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800/60">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-mono text-zinc-505 dark:text-zinc-455 hover:text-blue-500 transition-colors cursor-pointer select-none"
                          >
                            #{tag.toLowerCase().replace(/\s+/g, '')}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <button
                          onClick={() => setActiveProject(project)}
                          className="text-zinc-800 hover:text-blue-500 dark:text-zinc-200 dark:hover:text-blue-400 transition-colors font-medium cursor-pointer flex items-center gap-1"
                        >
                          Read Specs
                        </button>

                         <div className="flex gap-4">
                           {project.codeUrl && (
                            <a
                              href={project.codeUrl}
                              onClick={(e) => handleExternalRedirect(e, project.codeUrl, project.title)}
                              onMouseEnter={() => handleGlanceStart('repo', project.codeUrl, project.title)}
                              onMouseLeave={handleGlanceEnd}
                              className="text-zinc-500 hover:text-zinc-805 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer flex items-center gap-1"
                              aria-label="GitHub Repository Link"
                            >
                              <Code size={14} /> Repository
                            </a>
                           )}
                           {project.demoUrl && (
                            <a
                              href={project.demoUrl}
                              onClick={(e) => handleExternalRedirect(e, project.demoUrl, project.title)}
                              onMouseEnter={() => handleGlanceStart('demo', project.demoUrl, project.title)}
                              onMouseLeave={handleGlanceEnd}
                              className="text-zinc-500 hover:text-zinc-805 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5 font-medium group/link"
                              aria-label="Live Demo Link"
                            >
                              Live App <ArrowUpRight size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                            </a>
                           )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Tilt>
              </div>
            </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {filteredFeaturedProjects.length > 6 && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="group inline-flex items-center gap-2 px-5 py-2.5 text-xs font-mono rounded-lg bg-zinc-900 border border-zinc-900 hover:bg-zinc-850 text-white dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200 transition-all shadow-xs active:scale-95 duration-100 cursor-pointer select-none"
          >
            {isExpanded ? (
              <>
                <span>See Less</span>
                <ChevronUp size={14} className="group-hover:-translate-y-0.5 transition-transform" />
              </>
            ) : (
              <>
                <span>See More ({filteredFeaturedProjects.length - 6} remaining)</span>
                <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      )}

      {/* Dedicated Project Archive Directory */}
      {archivedOnly.length > 0 && (
        <div className="mt-20 border-t border-zinc-200/50 dark:border-zinc-900/60 pt-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">Legacy & secondary works</span>
              <h3 className="text-xl sm:text-2xl font-display font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Archive size={18} className="text-zinc-400 dark:text-zinc-500" />
                Engineering Archive
              </h3>
            </div>
            <p className="text-xs font-mono font-light text-zinc-500 dark:text-zinc-400">
              {filteredArchivedProjects.length} {filteredArchivedProjects.length === 1 ? 'project' : 'projects'} indexed
            </p>
          </div>

          {filteredArchivedProjects.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-zinc-250 dark:border-zinc-800 rounded-xl bg-zinc-50/10 dark:bg-zinc-900/10">
              <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500">No archived projects match the search query</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
              <table className="w-full text-left border-collapse select-none">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-850 text-zinc-400 dark:text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
                    <th className="py-3 px-4 font-normal">Project</th>
                    <th className="py-3 px-4 font-normal hidden md:table-cell">Role</th>
                    <th className="py-3 px-4 font-normal hidden lg:table-cell">Built With</th>
                    <th className="py-3 px-4 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-150 dark:divide-zinc-900">
                  {filteredArchivedProjects.map((project, index) => (
                    <motion.tr
                      key={project.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.04, duration: 0.3 }}
                      className="group/row hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors"
                    >
                      {/* Title & Description Column */}
                      <td className="py-4 px-4 max-w-sm sm:max-w-md">
                        <div className="font-display font-medium text-sm text-zinc-900 dark:text-zinc-100 group-hover/row:text-blue-500 dark:group-hover/row:text-blue-400 transition-colors">
                          {project.title}
                        </div>
                        <div className="text-xs font-light text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                          {project.description}
                        </div>
                      </td>

                      {/* Role Column */}
                      <td className="py-4 px-4 text-xs font-mono text-zinc-650 dark:text-zinc-450 hidden md:table-cell">
                        {project.role}
                      </td>

                      {/* Built with Column */}
                      <td className="py-4 px-4 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {project.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] font-mono bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-450 px-1.5 py-0.5 rounded-sm border border-zinc-250/30 dark:border-zinc-800/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Links / Details Button Column */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-3.5 pl-2 justify-end w-full">
                          <button
                            onClick={() => setActiveProject(project)}
                            className="text-xs font-medium text-zinc-800 dark:text-zinc-200 hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer"
                          >
                            Read Specs
                          </button>
                          
                          <div className="flex gap-2.5">
                            {project.codeUrl && (
                              <a
                                href={project.codeUrl}
                                onClick={(e) => handleExternalRedirect(e, project.codeUrl!, project.title)}
                                onMouseEnter={() => handleGlanceStart('repo', project.codeUrl, project.title)}
                                onMouseLeave={handleGlanceEnd}
                                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                                aria-label={`${project.title} Repository`}
                              >
                                <Code size={14} />
                              </a>
                            )}
                            {project.demoUrl && (
                              <a
                                href={project.demoUrl}
                                onClick={(e) => handleExternalRedirect(e, project.demoUrl!, project.title)}
                                onMouseEnter={() => handleGlanceStart('demo', project.demoUrl, project.title)}
                                onMouseLeave={handleGlanceEnd}
                                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-150 transition-colors cursor-pointer"
                                aria-label={`${project.title} Live App`}
                              >
                                <ArrowUpRight size={14} />
                              </a>
                            )}
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

        {/* Core Detail Specs Overlay Modal Modal (Popup View) */}
        <AnimatePresence>
          {activeProject && (
            <motion.div
              id="project-spec-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-zinc-950/70 backdrop-blur-sm"
              onClick={() => setActiveProject(null)}
            >
              <motion.div
                id="project-spec-modal"
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', duration: 0.45 }}
                className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-y-auto shadow-2xl relative max-h-[90vh] sm:max-h-[85vh] flex flex-col active:cursor-grab"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {/* Mobile Touch-Swipe visual handle indicators */}
                <div className="flex flex-col items-center justify-center pt-2.5 pb-1 md:hidden gap-1 shrink-0">
                  <div className="w-12 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 opacity-80" />
                  <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none">Swipe to Dismiss</span>
                </div>

                {/* Close Trigger Button */}
                <button
                  id="close-spec-modal-btn"
                  onClick={() => setActiveProject(null)}
                  className="absolute top-4 right-4 z-50 p-2 rounded-full bg-zinc-100/90 hover:bg-zinc-200 dark:bg-zinc-800/90 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-300 transition-all cursor-pointer active:scale-90 shadow-sm"
                  aria-label="Close dialog modal"
                >
                  <X size={16} />
                </button>

                {/* Content Area Container */}
                <div className="flex-1 focus:outline-none overflow-y-auto max-h-full">
                  {/* Render full preview mockup */}
                  <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-950 p-6 flex items-center justify-center border-b border-zinc-200/50 dark:border-zinc-850/50 shrink-0">
                    <div className="w-full h-full">
                      <ProjectMockup type={activeProject.image} />
                    </div>
                  </div>

                  {/* Project Specs detail info */}
                  <div className="p-5 sm:p-8 overflow-y-auto max-h-[45vh] sm:max-h-none">
                    <div className="flex flex-wrap items-baseline gap-2.5 mb-2">
                      <h3 className="text-xl sm:text-2xl font-display font-bold text-zinc-900 dark:text-zinc-50">
                        {activeProject.title}
                      </h3>
                      <span className="text-xs uppercase font-mono px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 select-none">
                        {activeProject.role}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm font-light leading-relaxed text-zinc-600 dark:text-zinc-300 mb-6">
                      {activeProject.longDescription || activeProject.description}
                    </p>

                    {/* Tags cloud */}
                    <div className="mb-6 sm:mb-8">
                      <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase block mb-2">Built With</span>
                      <div className="flex flex-wrap gap-2">
                        {activeProject.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 rounded-md text-xs font-mono bg-zinc-100 text-zinc-750 dark:bg-zinc-800 dark:text-zinc-300 select-none"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA Redirection */}
                    <div className="flex gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-5 sm:pt-6">
                      {activeProject.demoUrl && (
                        <a
                          href={activeProject.demoUrl}
                          onClick={(e) => handleExternalRedirect(e, activeProject.demoUrl!, activeProject.title)}
                          onMouseEnter={() => handleGlanceStart('demo', activeProject.demoUrl, activeProject.title)}
                          onMouseLeave={handleGlanceEnd}
                          className="inline-flex items-center gap-1.5 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 hover:bg-zinc-855 dark:hover:bg-zinc-150 py-2 py-4 px-4 sm:py-2.5 sm:px-5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer active:scale-95"
                        >
                          Launch Application
                          <ExternalLink size={14} />
                        </a>
                      )}
                      {activeProject.codeUrl && (
                        <a
                          href={activeProject.codeUrl}
                          onClick={(e) => handleExternalRedirect(e, activeProject.codeUrl!, activeProject.title)}
                          onMouseEnter={() => handleGlanceStart('repo', activeProject.codeUrl, activeProject.title)}
                          onMouseLeave={handleGlanceEnd}
                          className="inline-flex items-center gap-1.5 bg-transparent border border-zinc-205 dark:border-zinc-805 dark:text-zinc-205 hover:bg-zinc-105 dark:hover:bg-zinc-905 py-2 py-4 px-4 sm:py-2.5 sm:px-5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer active:scale-95"
                        >
                          Code Repository
                          <Code size={14} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
