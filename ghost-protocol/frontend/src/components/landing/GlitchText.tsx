import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface GlitchTextProps {
  text: string;
  className?: string;
}

const CHARS = '!@#$%XZQR&*<>?01';

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

  useEffect(() => {
    let frame = 0;
    const totalFrames = 60;
    let raf: number;

    function animate() {
      const progress = frame / totalFrames;
      setDisplayText(scramble(text, Math.min(progress * 1.2, 1)));
      frame++;
      if (frame <= totalFrames) {
        raf = requestAnimationFrame(animate);
      } else {
        setDisplayText(text);
      }
    }

    const timeout = setTimeout(() => {
      raf = requestAnimationFrame(animate);
    }, 400);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [text]);

  return (
    <motion.div
      className={`glitch-container ${className}`}
      data-text={displayText}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {displayText}
    </motion.div>
  );
}
