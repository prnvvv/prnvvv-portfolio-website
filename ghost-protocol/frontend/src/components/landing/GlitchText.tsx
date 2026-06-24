import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  className?: string;
}

const CHARS = '!@#$%XZQR&*<>?ABCDEFGHxyz01';

function scramble(text: string, progress: number): string {
  return text
    .split('')
    .map((char, i) => {
      if (char === ' ') return ' ';
      if (char === '-') return '-';
      if (i / text.length < progress) return char;
      return CHARS[Math.floor(Math.random() * CHARS.length)];
    })
    .join('');
}

export default function GlitchText({ text, className = '' }: GlitchTextProps) {
  const [displayText, setDisplayText] = useState(() => scramble(text, 0));
  const [revealed, setRevealed] = useState(false);

  // Initial reveal animation on mount
  useEffect(() => {
    let frame = 0;
    const totalFrames = 40;
    let raf: number;

    function animate() {
      const progress = frame / totalFrames;
      setDisplayText(scramble(text, progress));
      frame++;
      if (frame <= totalFrames) {
        raf = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
        setRevealed(true);
      }
    }

    const timeout = setTimeout(() => {
      raf = requestAnimationFrame(animate);
    }, 300);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [text]);

  // Periodic glitch after reveal
  useEffect(() => {
    if (!revealed) return;

    function triggerGlitch() {
      let g = 0;
      const glitchFrames = 8;
      let raf: number;

      function glitch() {
        setDisplayText(scramble(text, 1 - g / glitchFrames * 0.2));
        g++;
        if (g < glitchFrames) {
          raf = requestAnimationFrame(glitch);
        } else {
          setDisplayText(text);
        }
      }

      raf = requestAnimationFrame(glitch);
      return () => cancelAnimationFrame(raf);
    }

    const interval = setInterval(triggerGlitch, 2800);
    return () => clearInterval(interval);
  }, [revealed, text]);

  return (
    <motion.div
      className={`glitch-container ${className}`}
      data-text={displayText}
      initial={{ opacity: 0, letterSpacing: '0.5em' }}
      animate={{ opacity: 1, letterSpacing: '0.15em' }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      style={{ display: 'inline-block' }}
    >
      {displayText}
    </motion.div>
  );
}