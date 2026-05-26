import { motion } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { Profile } from '../types';

interface FooterProps {
  profile: Profile;
}

export default function Footer({ profile }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const handleScrollTop = () => {
    const rightPanel = document.getElementById('right-scroll-panel');
    if (rightPanel && window.innerWidth >= 1024) {
      rightPanel.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="py-12 bg-zinc-55 dark:bg-zinc-950 border-t border-zinc-200/50 dark:border-zinc-900/50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Core copyright */}
        <div className="text-center md:text-left select-none">
          <p className="text-xs text-zinc-500 font-mono flex items-center justify-center md:justify-start gap-2 flex-wrap">
            <span>&copy; {currentYear} {profile.name} {profile.sirName}. Independent Web Engineer.</span>
            <span className="text-zinc-300 dark:text-zinc-800 hidden sm:inline">|</span>
            <button 
              onClick={() => window.location.pathname = '/admin'} 
              className="hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors pointer-events-auto underline decoration-dotted underline-offset-2 cursor-pointer text-zinc-400"
            >
              Console Gateway
            </button>
          </p>
        </div>

        {/* Scroll back up trigger anchor */}
        <motion.button
          id="scroll-to-top-btn"
          onClick={handleScrollTop}
          className="p-3 rounded-full border border-zinc-200 dark:border-zinc-805 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 bg-white dark:bg-zinc-900 transition-colors cursor-pointer"
          whileHover={{ y: -3 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Scroll back to top"
        >
          <ArrowUp size={15} />
        </motion.button>

      </div>
    </footer>
  );
}
