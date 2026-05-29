import { useState, useEffect } from 'react';

interface ScrambleTextProps {
  children: string;
}

export default function ScrambleText({ children }: ScrambleTextProps) {
  const [displayText, setDisplayText] = useState(children);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    const handleStart = () => setIsGlitching(true);
    const handleEnd = () => setIsGlitching(false);

    window.addEventListener('phantom-glitch-start', handleStart);
    window.addEventListener('phantom-glitch-end', handleEnd);

    // Initial check in case it's already active
    if (document.querySelector('.phantom-glitch-active')) {
      setIsGlitching(true);
    }

    return () => {
      window.removeEventListener('phantom-glitch-start', handleStart);
      window.removeEventListener('phantom-glitch-end', handleEnd);
    };
  }, []);

  useEffect(() => {
    if (!isGlitching) {
      setDisplayText(children);
      return;
    }

    const glitchChars = '@#$%&*?+=~^0123456789PHATOM!';
    
    const intervalId = setInterval(() => {
      const scrambled = children
        .split('')
        .map((char) => {
          if (/\s/.test(char)) return char; // preserve whitespace/newlines
          // Every tick, has a 35% chance to scramble into system corruption character
          return Math.random() < 0.35 
            ? glitchChars[Math.floor(Math.random() * glitchChars.length)] 
            : char;
        })
        .join('');
      setDisplayText(scrambled);
    }, 70); // High rate scrambling for hyper-responsiveness

    return () => clearInterval(intervalId);
  }, [isGlitching, children]);

  return <>{displayText}</>;
}
