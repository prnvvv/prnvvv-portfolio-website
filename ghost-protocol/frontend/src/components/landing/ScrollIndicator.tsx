import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ScrollIndicator() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let frame: number;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        frame = requestAnimationFrame(() => {
          setVisible(window.scrollY < 100);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed',
        bottom: '32px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '9px',
          color: 'rgba(0, 230, 59, 0.4)',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
        }}
      >
        SCROLL TO EXPLORE
      </span>
      <div className="scroll-arrow" aria-hidden="true">
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none">
          <path
            d="M8 0v20M8 20L2 14M8 20l6-6"
            stroke="rgba(0, 230, 59, 0.5)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </motion.div>
  );
}
