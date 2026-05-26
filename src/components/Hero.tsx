import { motion } from 'motion/react';
import { ArrowRight, Download, Github, Linkedin, Twitter, Dribbble, Mail, MapPin } from 'lucide-react';
import { Profile } from '../types';

interface HeroProps {
  profile: Profile;
}

export default function Hero({ profile }: HeroProps) {
  // Map icon component dynamically
  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'github':
        return <Github size={18} />;
      case 'linkedin':
        return <Linkedin size={18} />;
      case 'twitter':
        return <Twitter size={18} />;
      case 'dribbble':
        return <Dribbble size={18} />;
      case 'email':
        return <Mail size={18} />;
      default:
        return <Mail size={18} />;
    }
  };

  // Safe stagger delay calculation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 }
    }
  };

  return (
    <section
      id="home"
      className="min-h-screen flex items-center pt-24 pb-16 relative overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300"
    >
      {/* Decorative Grid Accent */}
      <div
        className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e4e4e7 1px, transparent 1px),
            linear-gradient(to bottom, #e4e4e7 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)'
        }}
      ></div>

      <div className="max-w-4xl mx-auto px-6 w-full relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-6 items-center"
        >
          {/* Main Info Blocks (Grid Column 1 to 8) */}
          <div className="md:col-span-8 flex flex-col justify-center items-start">
            {/* Real-time status badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/85 text-[11px] font-mono text-zinc-650 dark:text-zinc-400 mb-6 shadow-xs select-none"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {profile.status}
            </motion.div>

            {/* Display Title & Greeting */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl md:text-6xl font-display font-medium tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.08] mb-5"
            >
              Hi, I'm <span className="font-bold">{profile.name}</span>
              <br />
              <span className="text-zinc-400 dark:text-zinc-550 font-light text-2xl sm:text-3xl md:text-4xl">
                {profile.role}
              </span>
            </motion.h1>

            {/* Configured Subheading/Bio */}
            <motion.p
              variants={itemVariants}
              className="text-base sm:text-lg text-zinc-500 dark:text-zinc-400 leading-relaxed font-sans font-light max-w-xl mb-8"
            >
              {profile.bio}
            </motion.p>

            {/* Location Pill */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono mb-8"
            >
              <MapPin size={13} className="text-blue-500 animate-bounce" />
              <span>{profile.location}</span>
            </motion.div>

            {/* Action Buttons Row */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 items-center">
              <motion.a
                id="view-work-hero-btn"
                href="#work"
                className="inline-flex items-center gap-2 bg-zinc-900 border border-zinc-900 text-white dark:bg-zinc-50 dark:border-zinc-50 dark:text-zinc-950 px-6 py-3 rounded-lg text-sm font-medium hover:bg-zinc-850 dark:hover:bg-zinc-150 transition-colors shadow-xs cursor-pointer group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                View Curated Work
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </motion.a>

              <motion.a
                id="contact-hero-btn"
                href="#contact"
                className="inline-flex items-center gap-2 bg-transparent border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 px-6 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Let's Connect
              </motion.a>
            </motion.div>

            {/* Social Share Badges */}
            <motion.div variants={itemVariants} className="flex gap-3 mt-10">
              {profile.socialLinks.map((link) => (
                <motion.a
                  key={link.platform}
                  href={link.url}
                  onClick={(e) => {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent('trigger-redirect-island', {
                      detail: { url: link.url, name: link.platform === 'email' ? 'Email Client' : link.label }
                    }));
                  }}
                  onMouseEnter={() => {
                    window.dispatchEvent(new CustomEvent('trigger-glance-island', {
                      detail: { type: 'social', url: link.url, name: link.platform === 'email' ? 'Email Client' : link.label }
                    }));
                  }}
                  onMouseLeave={() => {
                    window.dispatchEvent(new CustomEvent('trigger-glance-end-island'));
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full border border-zinc-200/80 dark:border-zinc-805 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-white dark:hover:bg-zinc-900 hover:shadow-xs transition-all cursor-pointer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label={link.label}
                >
                  {getSocialIcon(link.platform)}
                </motion.a>
              ))}
            </motion.div>
          </div>

          {/* Large Stylized Abstract Graphic / Avatar Section (Grid Column 9 to 12) */}
          <motion.div
            variants={itemVariants}
            className="md:col-span-4 flex justify-center items-center relative aspect-square"
          >
            {/* Animated backdrop rings */}
            <div className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-dashed border-zinc-200 dark:border-zinc-800 animate-spin" style={{ animationDuration: '40s' }}></div>
            <div className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-dotted border-zinc-200 dark:border-zinc-850 animate-spin" style={{ animationDuration: '24s', animationDirection: 'reverse' }}></div>

            {/* Circular Clip Frame with modern high-contrast shadow */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-2 border-zinc-200/60 dark:border-zinc-800/80 shadow-lg bg-zinc-100 dark:bg-zinc-900">
              <img
                src={profile.avatar}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover grayscale opacity-90 hover:grayscale-0 transition-all duration-500 scale-102 hover:scale-106"
              />
            </div>

            {/* Floating Decorative Tags */}
            <motion.div
              className="absolute -top-1 -right-1 bg-white dark:bg-zinc-900 border border-zinc-205 dark:border-zinc-800 rounded px-2 py-1 text-[10px] font-mono text-blue-500 shadow-sm"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              &lt;code /&gt;
            </motion.div>
            <motion.div
              className="absolute -bottom-2 -left-2 bg-white dark:bg-zinc-900 border border-zinc-205 dark:border-zinc-800 rounded px-2 py-1 text-[10px] font-mono text-emerald-500 shadow-sm"
              animate={{ y: [0, 5, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              ux_guided
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
