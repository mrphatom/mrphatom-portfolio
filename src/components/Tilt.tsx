import React, { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'motion/react';
import { playSoftClick } from '../utils/audio';

interface TiltProps {
  children: React.ReactNode;
  className?: string;
}

export default function Tilt({ children, className = '' }: TiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Set up motion values for relative mouse offsets
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Smooth, reactive responsive configurations (highly tactile)
  const springConfig = { damping: 24, stiffness: 160, mass: 0.6 };
  const rotateX = useSpring(useTransform(y, [0, 1], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(x, [0, 1], [-6, 6]), springConfig);

  // Glare / shine reflection parameters
  const glareX = useSpring(useTransform(x, [0, 1], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(y, [0, 1], [0, 100]), springConfig);
  const glareOpacity = useSpring(useTransform(x, [0, 0.5, 1], [0, 0.18, 0]), springConfig);

  // Dedicated spring-driven hover opacity for buttery smooth fade transitions of the neon glow
  const hoverOpacity = useSpring(0, { damping: 20, stiffness: 120 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / rect.width);
    y.set(mouseY / rect.height);
    
    if (hoverOpacity.get() === 0) {
      playSoftClick();
    }
    hoverOpacity.set(1);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
    hoverOpacity.set(0);
  };

  const dynamicBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]) => `radial-gradient(circle 140px at ${gx}% ${gy}%, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 80%)`
  );

  const dynamicGlow = useTransform(
    [glareX, glareY],
    ([gx, gy]) => `radial-gradient(circle 240px at ${gx}% ${gy}%, var(--hover-glow-start) 0%, var(--hover-glow-mid) 45%, rgba(0,0,0,0) 80%)`
  );

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      whileTap={{ scale: 0.985, rotateX: 1, rotateY: 1 }}
      className={`relative ${className}`}
    >
      {/* Dynamic Cursor-Following Ambience Glow Layer */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-xl z-0 transition-opacity duration-300"
        style={{
          opacity: hoverOpacity,
          background: dynamicGlow,
        }}
      />

      <div 
        style={{ transform: 'translateZ(6px)', transformStyle: 'preserve-3d' }}
        className="w-full h-full flex flex-col flex-1 z-10 relative"
      >
        {children}
      </div>

      {/* Glossy reflection cover to complement the dark/light minimalist cards */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-xl mix-blend-overlay z-20"
        style={{
          left: 0,
          top: 0,
          opacity: glareOpacity,
          background: dynamicBackground,
        }}
      />
    </motion.div>
  );
}
