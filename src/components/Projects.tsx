import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Code, FolderOpen, X, ArrowUpRight } from 'lucide-react';
import { Project } from '../types';
import ProjectMockup from './ProjectMockup';

interface ProjectsProps {
  projects: Project[];
}

export default function Projects({ projects }: ProjectsProps) {
  const [selectedTag, setSelectedTag] = useState('All');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Extract all unique tags dynamically
  const allTags = ['All', ...Array.from(new Set(projects.flatMap(p => p.tags)))];

  // Filter projects based on choice
  const filteredProjects = selectedTag === 'All'
    ? projects
    : projects.filter(p => p.tags.includes(selectedTag));

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

          {/* Filtering buttons */}
          <div className="flex flex-wrap gap-2 max-w-xl">
            {allTags.map((tag) => {
              const isActive = selectedTag === tag;
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer select-none border ${
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
        </motion.div>

        {/* Dynamic Grid of Cards using Motion */}
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
                className="group relative flex flex-col bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200/80 dark:border-zinc-805 overflow-hidden transition-all hover:shadow-md hover:border-zinc-350 dark:hover:border-zinc-700"
              >
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
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer flex items-center gap-1"
                            aria-label="GitHub Repository Link"
                          >
                            <Code size={14} /> Repository
                          </a>
                        )}
                        {project.demoUrl && (
                          <a
                            href={project.demoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer flex items-center gap-1.5 font-medium group/link"
                            aria-label="Live Demo Link"
                          >
                            Live App <ArrowUpRight size={14} className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

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
                className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close Trigger Button */}
                <button
                  id="close-spec-modal-btn"
                  onClick={() => setActiveProject(null)}
                  className="absolute top-4 right-4 z-50 p-2 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-300 transition-all cursor-pointer active:scale-90"
                  aria-label="Close dialog modal"
                >
                  <X size={16} />
                </button>

                {/* Render full preview mockup */}
                <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-950 p-6 flex items-center justify-center border-b border-zinc-200/50 dark:border-zinc-850/50">
                  <div className="w-full h-full">
                    <ProjectMockup type={activeProject.image} />
                  </div>
                </div>

                {/* Project Specs detail info */}
                <div className="p-8">
                  <div className="flex flex-wrap items-baseline gap-2.5 mb-2">
                    <h3 className="text-2xl font-display font-bold text-zinc-900 dark:text-zinc-50">
                      {activeProject.title}
                    </h3>
                    <span className="text-xs uppercase font-mono px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 select-none">
                      {activeProject.role}
                    </span>
                  </div>

                  <p className="text-sm font-light leading-relaxed text-zinc-600 dark:text-zinc-300 mb-6">
                    {activeProject.longDescription || activeProject.description}
                  </p>

                  {/* Tags cloud */}
                  <div className="mb-8">
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
                  <div className="flex gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-6">
                    {activeProject.demoUrl && (
                      <a
                        href={activeProject.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 hover:bg-zinc-855 dark:hover:bg-zinc-150 py-2.5 px-5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                      >
                        Launch Application
                        <ExternalLink size={14} />
                      </a>
                    )}
                    {activeProject.codeUrl && (
                      <a
                        href={activeProject.codeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-transparent border border-zinc-200 text-zinc-800 dark:border-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 py-2.5 px-5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                      >
                        Code Repository
                        <Code size={14} />
                      </a>
                    )}
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
