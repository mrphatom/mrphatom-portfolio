import { motion } from 'motion/react';
import { Briefcase, Calendar, MapPin } from 'lucide-react';
import { Experience } from '../types';

interface ExperienceProps {
  experiences: Experience[];
}

export default function ExperienceSection({ experiences }: ExperienceProps) {
  // Stagger configurations
  const timelineVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  return (
    <section
      id="experience"
      className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-zinc-950 border-t border-zinc-200/40 dark:border-zinc-900/40 transition-colors duration-300"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with In-View Animation */}
        <motion.div 
          className="mb-10 lg:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="text-xs uppercase font-mono tracking-widest text-blue-500 block mb-2">My Professional Career</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
            Work Experience
          </h2>
        </motion.div>

        {/* Career vertical timeline pathway layout */}
        <div className="relative border-l border-zinc-200 dark:border-zinc-800 ml-4 md:ml-6 pl-8 md:pl-10 space-y-12 py-2">
          <motion.div
            variants={timelineVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                variants={cardVariants}
                className="relative pb-10 last:pb-0"
              >
                {/* Visual Connection Pulse Pin on Timeline (Vivid Blue for current) */}
                <div className="absolute -left-[41px] md:-left-[49px] top-1.5 z-10 p-1.5 rounded-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-center">
                  <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-blue-500 animate-pulse' : 'bg-zinc-400 dark:bg-zinc-650'}`}></div>
                </div>

                {/* Main Card Content */}
                <div className="group bg-zinc-50 dark:bg-zinc-900/60 p-6 md:p-8 rounded-2xl border border-zinc-200/85 dark:border-zinc-805 hover:border-zinc-350 dark:hover:border-zinc-750 hover:shadow-sm transition-all">
                  
                  {/* Title & Dates */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h3 className="text-lg font-display font-bold text-zinc-900 dark:text-zinc-55 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                        {exp.role}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 mt-1">
                        <span className="font-semibold text-zinc-750 dark:text-zinc-350">{exp.company}</span>
                        {exp.location && (
                          <>
                            <span className="text-zinc-355 dark:text-zinc-600">•</span>
                            <span className="inline-flex items-center gap-0.5"><MapPin size={10} /> {exp.location}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/40 dark:border-zinc-700/40 text-[10px] font-mono text-zinc-650 dark:text-zinc-400 select-none self-start sm:self-center">
                      <Calendar size={10} />
                      {exp.period}
                    </div>
                  </div>

                  {/* Summary context */}
                  <p className="text-sm font-light text-zinc-550 dark:text-zinc-400 leading-relaxed mb-4">
                    {exp.description}
                  </p>

                  {/* Configured Bullets lists */}
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="space-y-2 mt-2">
                      {exp.bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="text-xs text-zinc-550 dark:text-zinc-400 font-light flex items-start gap-2.5 leading-relaxed">
                          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-605 mt-1.5 flex-shrink-0"></span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
