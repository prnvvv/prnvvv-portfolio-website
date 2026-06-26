import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function ScrollIndicator() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setVisible(window.scrollY < 100);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 0.5 : 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'fixed',
        bottom: 32,
        right: 40,
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      <div className="scroll-arrow" aria-hidden="true">
        <svg width="14" height="22" viewBox="0 0 14 22" fill="none">
          <path
            d="M7 0v18M7 18l-5-5M7 18l5-5"
            stroke="rgba(0, 230, 122, 0.4)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </motion.div>
  );
}
