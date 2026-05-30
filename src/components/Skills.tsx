import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, FileCode, Layers, Palette, Sparkles, Cpu, Layout, PenTool, Box, Activity, Terminal, Network, GitBranch, BarChart2 } from 'lucide-react';
import { SkillItem } from '../types';
import ScrambleText from './ScrambleText';
import { playSoftClick } from '../utils/audio';

interface SkillsProps {
  skills: SkillItem[];
}

export default function Skills({ skills }: SkillsProps) {
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const handleSkillClick = (skillName: string) => {
    // Play a lovely tactile click sound
    playSoftClick();

    // Dispatch a custom event to update projects filter
    window.dispatchEvent(new CustomEvent('filter-projects-by-skill', { detail: { skill: skillName } }));
    
    // Scroll smoothly to Projects section
    const element = document.getElementById('work');
    if (element) {
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
        const offsetPosition = elementPosition + window.scrollY - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  // Categories extraction
  const categories = ['All', 'Frontend', 'Design', 'Utilities'];

  const filteredSkills = activeCategory === 'All'
    ? skills
    : skills.filter(s => s.category === activeCategory);

  // Helper to map string to actual Lucide component dynamically
  const renderSkillIcon = (iconName?: string) => {
    const iconProps = { size: 18, className: "transition-transform group-hover:scale-110" };
    switch (iconName) {
      case 'Flame':
        return <Flame {...iconProps} className={`${iconProps.className} text-orange-500`} />;
      case 'FileCode':
        return <FileCode {...iconProps} className={`${iconProps.className} text-blue-500`} />;
      case 'Layers':
        return <Layers {...iconProps} className={`${iconProps.className} text-teal-400`} />;
      case 'Palette':
        return <Palette {...iconProps} className={`${iconProps.className} text-pink-500`} />;
      case 'Sparkles':
        return <Sparkles {...iconProps} className={`${iconProps.className} text-violet-400`} />;
      case 'Cpu':
        return <Cpu {...iconProps} className={`${iconProps.className} text-slate-400`} />;
      case 'Layout':
        return <Layout {...iconProps} className={`${iconProps.className} text-indigo-400`} />;
      case 'PenTool':
        return <PenTool {...iconProps} className={`${iconProps.className} text-rose-400`} />;
      case 'Box':
        return <Box {...iconProps} className={`${iconProps.className} text-amber-500`} />;
      case 'Activity':
        return <Activity {...iconProps} className={`${iconProps.className} text-emerald-400`} />;
      case 'Terminal':
        return <Terminal {...iconProps} className={`${iconProps.className} text-green-400`} />;
      case 'Network':
        return <Network {...iconProps} className={`${iconProps.className} text-cyan-400`} />;
      case 'GitBranch':
        return <GitBranch {...iconProps} className={`${iconProps.className} text-orange-400`} />;
      case 'BarChart':
        return <BarChart2 {...iconProps} className={`${iconProps.className} text-purple-400`} />;
      default:
        return <FileCode {...iconProps} className={`${iconProps.className} text-zinc-400`} />;
    }
  };

  // Safe stagger child list
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 120, damping: 14 }
    }
  };

  return (
    <section
      id="skills"
      className="py-16 sm:py-20 lg:py-24 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200/40 dark:border-zinc-900/40 transition-colors duration-300"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with In-View Animation */}
        <motion.div 
          className="flex flex-col md:flex-row md:items-end justify-between mb-10 lg:mb-12 gap-6"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div>
            <span className="text-xs uppercase font-mono tracking-widest text-blue-500 block mb-2">Core Competencies</span>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
              <ScrambleText>Skills & Technologies</ScrambleText>
            </h2>
          </div>

          {/* Semantic tabs selectors */}
          <div className="flex gap-1.5 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-lg border border-zinc-200/50 dark:border-zinc-800/60 select-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`relative px-4 py-1.5 text-xs font-medium rounded-md transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-white text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 shadow-xs font-semibold'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Dynamic skills visualizer cards grid */}
        <motion.div
          key={activeCategory}
          id="skills-grid-container"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredSkills.map((skill) => (
            <motion.div
              key={skill.name}
              variants={itemVariants}
              onClick={() => handleSkillClick(skill.name)}
              className="group bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-xl flex items-center justify-between shadow-xs hover:shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all cursor-pointer active:scale-[0.985]"
              onMouseEnter={() => setHoveredSkill(skill.name)}
              onMouseLeave={() => setHoveredSkill(null)}
            >
              <div className="flex items-center gap-3.5 flex-1 min-w-0">
                {/* Custom active icon box */}
                <div className="p-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-850 flex items-center justify-center">
                  {renderSkillIcon(skill.icon)}
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 block truncate">
                    {skill.name}
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">
                    {skill.category}
                  </span>
                </div>
              </div>

              {/* Graphical level meter widget or Hover click indicator */}
              <div className="flex items-center gap-3 w-1/3 min-w-[70px] justify-end">
                <AnimatePresence mode="wait">
                  {hoveredSkill === skill.name ? (
                    <motion.span
                      key="filter-badge"
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      transition={{ duration: 0.15 }}
                      className="text-[9px] font-mono uppercase bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-500/20 dark:border-blue-400/20 max-w-full truncate select-none text-right font-semibold"
                    >
                      Filter &rarr;
                    </motion.span>
                  ) : (
                    <motion.div
                      key="level-gauge"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-2.5 w-full"
                    >
                      <div className="relative h-1.5 w-full bg-zinc-100 dark:bg-zinc-800/80 rounded-full overflow-hidden">
                        <motion.div
                          className="absolute top-0 left-0 bottom-0 bg-zinc-900 dark:bg-zinc-50 rounded-full"
                          initial={{ width: "0%" }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true, margin: "-20px" }}
                          transition={{ 
                            type: 'spring',
                            stiffness: 70, 
                            damping: 15,
                            delay: 0.1
                          }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 font-medium text-right min-w-[28px] select-none">
                        {skill.level}%
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Technical standards bio stats indicator */}
        <div className="mt-12 p-6 rounded-xl bg-blue-50/40 dark:bg-blue-950/10 border border-blue-100/60 dark:border-blue-900/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 select-none">
          <div className="flex-1">
            <h5 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-0.5 flex items-center gap-1.5">
              <span>Proactive Professional Growth</span>
            </h5>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-xl">
              I consistently audit and upskill in responsive web standards, accessibilities (WAI-ARIA), system variables, and modern visual framework engines to keep delivering pixel-perfect interfaces for every viewport size.
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase bg-blue-100/80 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1 rounded">
            Latest: react@19.0.x
          </span>
        </div>
      </div>
    </section>
  );
}
