import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionTemplate,
  type MotionValue,
} from 'framer-motion';
import { useTacticalTilt } from './useTacticalTilt';
import { TileHUDOverlay } from './TileHUDOverlay';
import type { TacticalTileProps } from './types';

export const TacticalTile = React.memo(function TacticalTile({
  children,
  expandContent,
  autoReveal = false,
  autoRevealDelay = 2000,
  index = 0,
  disableTilt = false,
  maxTilt = 8,
  showRadar = true,
  accentColor = '#00e67a',
  style,
  onClick,
}: TacticalTileProps) {
  const [prefersReducedMotion, setPrefersReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const autoRevealTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const shouldDisableTilt = !!(disableTilt || isMobile || prefersReducedMotion);

  const {
    ref, rotateX, rotateY, scale, glowX, glowY, shadowX, shadowY,
    isHovered, onMouseMove, onMouseLeave, onMouseEnter,
  } = useTacticalTilt({ maxTilt, disabled: shouldDisableTilt });

  useEffect(() => {
    if (!autoReveal || !expandContent) return;

    let phase: 'closed' | 'open' = 'closed';
    const OPEN_DURATION = 3200;
    const CLOSE_DURATION = 2800;

    function cycle() {
      if (phase === 'closed') {
        phase = 'open';
        setIsExpanded(true);
        autoRevealTimer.current = setTimeout(cycle, OPEN_DURATION);
      } else {
        phase = 'closed';
        setIsExpanded(false);
        autoRevealTimer.current = setTimeout(cycle, CLOSE_DURATION);
      }
    }

    autoRevealTimer.current = setTimeout(cycle, autoRevealDelay + index * 600);

    return () => clearTimeout(autoRevealTimer.current);
  }, [autoReveal, expandContent, autoRevealDelay, index]);

  const handleMouseEnter = () => {
    onMouseEnter();
    if (expandContent) {
      clearTimeout(autoRevealTimer.current);
      setIsExpanded(true);
    }
  };

  const handleMouseLeave = () => {
    onMouseLeave();
    if (expandContent && autoReveal) {
      setIsExpanded(false);
      autoRevealTimer.current = setTimeout(() => setIsExpanded(true), 2000);
    } else if (expandContent && !autoReveal) {
      setIsExpanded(false);
    }
  };

  const glowBackground = useMotionTemplate`
    radial-gradient(
      160px circle at ${glowX} ${glowY},
      ${accentColor}12 0%,
      transparent 70%
    )
  `;

  const dynamicShadow = useMotionTemplate`
    ${shadowX}px ${shadowY}px 40px rgba(0,0,0,0.6),
    0px 0px 0px 1px rgba(255,255,255,0.05),
    0px 0px 20px rgba(0,230,122,0.05)
  `;

  const idleAnimation = useMemo(() => prefersReducedMotion ? {} : {
    y: [0, -3, 0],
    transition: {
      duration: 3 + index * 0.4,
      repeat: Infinity,
      ease: 'easeInOut' as const,
      delay: index * 0.3,
    },
  }, [index, prefersReducedMotion]);

  const internalProps = {
    tileRef: ref,
    rotateX, rotateY, scale,
    glowBackground, dynamicShadow,
    isHovered, isExpanded,
    accentColor, showRadar,
    expandContent, children,
    onMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onClick,
    shouldDisableTilt,
    style,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-40px 0px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.09,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ position: 'relative', zIndex: isHovered ? 20 : 10 + index }}
    >
      {isMobile ? (
        <motion.div animate={idleAnimation}>
          <TileInner {...internalProps} />
        </motion.div>
      ) : (
        <TileInner {...internalProps} />
      )}
    </motion.div>
  );
});

function TileInner({
  tileRef, rotateX, rotateY, scale, glowBackground, dynamicShadow,
  isHovered, isExpanded, accentColor, showRadar, expandContent, children,
  onMouseMove, onMouseEnter, onMouseLeave, onClick, shouldDisableTilt, style,
}: {
  tileRef: React.RefObject<HTMLDivElement | null>;
  rotateX: MotionValue<number>; rotateY: MotionValue<number>; scale: MotionValue<number>;
  glowBackground: MotionValue<string>; dynamicShadow: MotionValue<string>;
  isHovered: boolean; isExpanded: boolean;
  accentColor: string; showRadar: boolean;
  expandContent?: React.ReactNode; children: React.ReactNode;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseEnter: () => void; onMouseLeave: () => void;
  onClick?: () => void; shouldDisableTilt: boolean; style?: React.CSSProperties;
}) {
  return (
    <motion.div
      ref={tileRef}
      onMouseMove={onMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onKeyDown={(e) => { if (onClick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}
      role="article"
      tabIndex={0}
      aria-label="Tactical data tile"
      style={{
        rotateX: shouldDisableTilt ? 0 : rotateX,
        rotateY: shouldDisableTilt ? 0 : rotateY,
        scale,
        transformStyle: 'preserve-3d' as const,
        transformOrigin: 'center center',
        perspective: 1000,
        position: 'relative',
        background: 'var(--bg-surface)',
        backdropFilter: 'blur(16px) saturate(150%)',
        WebkitBackdropFilter: 'blur(16px) saturate(150%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '4px',
        boxShadow: dynamicShadow,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        willChange: 'transform',
        outline: 'none',
        ...style,
      }}
      className="tactical-tile-inner"
      animate={{
        borderColor: isHovered
          ? `rgba(0, 230, 122, 0.25)`
          : 'rgba(255, 255, 255, 0.07)',
      }}
      transition={{ duration: 0.3 }}
      whileFocus={{ outline: '1px solid rgba(0,230,122,0.5)', outlineOffset: '2px' }}
    >
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          background: glowBackground,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `
          linear-gradient(rgba(0,230,122,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,230,122,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '24px 24px',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: isHovered ? 1 : 0.5,
        transition: 'opacity 0.4s ease',
      }} />

      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '40%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: 2,
        borderRadius: '4px 4px 0 0',
      }} />

      <TileHUDOverlay
        isHovered={isHovered}
        accentColor={accentColor}
        showRadar={showRadar}
        showScan={true}
      />

      <div style={{ position: 'relative', zIndex: 5 }}>
        {children}
      </div>

      <AnimatePresence>
        {isExpanded && expandContent && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'relative',
              zIndex: 6,
              overflow: 'hidden',
              borderTop: `1px solid rgba(0,230,122,0.15)`,
              background: 'rgba(0, 230, 122, 0.03)',
            }}
          >
            {expandContent}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
