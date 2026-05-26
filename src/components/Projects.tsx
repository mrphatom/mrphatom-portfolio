import { useState, useEffect, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Code, FolderOpen, X, ArrowUpRight } from 'lucide-react';
import { Project } from '../types';
import ProjectMockup from './ProjectMockup';
import Tilt from './Tilt';

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  const [selectedTag, setSelectedTag] = useState('All');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Universal handler to intercept external navigation and pass to Dynamic Island
  const handleExternalRedirect = (e: MouseEvent<HTMLAnchorElement>, url: string, projectName: string) => {
    e.preventDefault();
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

  // Extract all unique tags dynamically
  const allTags = ['All', ...Array.from(new Set(projects.flatMap(p => p.tags)))];

  // Filter projects based on both tag selector choice and search input query
  const filteredProjects = projects.filter(project => {
    const matchesTag = selectedTag === 'All' || project.tags.includes(selectedTag);
    const matchesSearch = !searchQuery || (
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    return matchesTag && matchesSearch;
  });

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
              Selected Projects
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
            <div className="flex flex-wrap gap-1.5 max-w-xl">
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
            </div>
          </div>
        </motion.div>

        {/* Dynamic Grid of Cards using Motion */}
        {filteredProjects.length === 0 ? (
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
          >
            <AnimatePresence mode="popLayout">
            {filteredProjects.map((project) => (
              <motion.div
                key={project.id}
                layout
                initial={{ opacity: 0, scale: 0.96, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="h-full"
              >
                <Tilt className="group relative flex flex-col h-full bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/80 dark:border-zinc-805 overflow-hidden transition-all hover:shadow-md hover:border-zinc-350 dark:hover:border-zinc-700">
                  {/* Simulated Custom Live Mockup Panel (Aesthetic Header) */}
                  <div className="relative aspect-video w-full p-4 bg-zinc-100 dark:bg-zinc-950/80 border-b border-zinc-200/50 dark:border-zinc-850/50 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full transform group-hover:scale-102 transition-transform duration-500">
                      <ProjectMockup type={project.image} />
                    </div>

                    {/* Quick-Inspect Hover Pill overlay */}
                    <div className="absolute inset-0 bg-zinc-950/20 dark:bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                      <button
                        onClick={() => setActiveProject(project)}
                        className="px-4 py-2 rounded-lg bg-white/95 dark:bg-zinc-900/95 text-xs font-medium text-zinc-900 dark:text-zinc-55 flex items-center gap-1.5 cursor-pointer shadow-sm select-none"
                      >
                        <FolderOpen size={13} />
                        Detail Specs
                      </button>
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
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
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
                className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-y-auto shadow-2xl relative max-h-[90vh] sm:max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
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
