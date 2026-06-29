import { motion, useAnimationControls } from 'framer-motion';
import { useEffect } from 'react';

interface TileHUDOverlayProps {
  isHovered: boolean;
  accentColor?: string;
  showRadar?: boolean;
  showScan?: boolean;
}

export function TileHUDOverlay({
  isHovered,
  accentColor = '#00e67a',
  showRadar = true,
  showScan = true,
}: TileHUDOverlayProps) {
  const scanControls = useAnimationControls();

  useEffect(() => {
    scanControls.start({
      y: ['0%', '100%'],
      opacity: [0, 0.6, 0.6, 0],
      transition: {
        duration: 2.4,
        ease: 'linear',
        repeat: Infinity,
        repeatDelay: isHovered ? 0.4 : 3.5,
      },
    });
  }, [isHovered, scanControls]);

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
      borderRadius: 'inherit',
      zIndex: 10,
    }}>
      {(['tl', 'tr', 'bl', 'br'] as const).map(pos => (
        <CornerBracket key={pos} position={pos} color={accentColor} isHovered={isHovered} />
      ))}

      {showScan && (
        <motion.div
          animate={scanControls}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '1px',
            background: `linear-gradient(90deg, transparent 0%, ${accentColor} 20%, ${accentColor}cc 50%, ${accentColor} 80%, transparent 100%)`,
            boxShadow: `0 0 6px ${accentColor}80`,
            top: 0,
          }}
        />
      )}

      {showRadar && (
        <div style={{ position: 'absolute', top: 10, right: 10 }}>
          <RadarElement color={accentColor} isHovered={isHovered} />
        </div>
      )}

      <motion.div
        animate={{ opacity: isHovered ? 1 : 0.3 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          top: 7,
          left: 28,
          fontFamily: 'var(--font-mono)',
          fontSize: '7px',
          letterSpacing: '0.18em',
          color: `${accentColor}80`,
          textTransform: 'uppercase',
        }}
      >
        // TACTICAL DATA //
      </motion.div>

      <motion.div
        animate={{ opacity: isHovered ? 0.7 : 0.2 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'absolute',
          bottom: 7,
          right: 28,
          fontFamily: 'var(--font-mono)',
          fontSize: '7px',
          letterSpacing: '0.15em',
          color: `${accentColor}60`,
        }}
      >
        CLASSIFIED
      </motion.div>

      <motion.div
        animate={{
          opacity: isHovered ? 1 : 0,
          boxShadow: isHovered
            ? `inset 0 0 0 1px ${accentColor}40, inset 0 0 20px ${accentColor}10`
            : 'none',
        }}
        transition={{ duration: 0.35 }}
        style={{ position: 'absolute', inset: 0, borderRadius: 'inherit' }}
      />
    </div>
  );
}

const CORNER_STYLES = {
  tl: { top: 0, left: 0, borderTop: '1.5px solid', borderLeft: '1.5px solid', borderBottom: 'none', borderRight: 'none' } as const,
  tr: { top: 0, right: 0, borderTop: '1.5px solid', borderLeft: 'none', borderBottom: 'none', borderRight: '1.5px solid' } as const,
  bl: { bottom: 0, left: 0, borderTop: 'none', borderLeft: '1.5px solid', borderBottom: '1.5px solid', borderRight: 'none' } as const,
  br: { bottom: 0, right: 0, borderTop: 'none', borderLeft: 'none', borderBottom: '1.5px solid', borderRight: '1.5px solid' } as const,
};

function CornerBracket({
  position,
  color,
  isHovered,
}: {
  position: 'tl' | 'tr' | 'bl' | 'br';
  color: string;
  isHovered: boolean;
}) {
  const s = CORNER_STYLES[position];
  const SIZE = 10;

  return (
    <motion.div
      animate={{ opacity: isHovered ? 1 : 0.4, scale: isHovered ? 1 : 0.85 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      style={{
        position: 'absolute',
        width: SIZE,
        height: SIZE,
        ...(s.borderTop !== 'none' ? { top: 0 } : {}),
        ...(s.borderBottom !== 'none' ? { bottom: 0 } : {}),
        ...(s.borderLeft !== 'none' ? { left: 0 } : {}),
        ...(s.borderRight !== 'none' ? { right: 0 } : {}),
        borderTop: s.borderTop !== 'none' ? `${s.borderTop} ${color}` : 'none',
        borderLeft: s.borderLeft !== 'none' ? `${s.borderLeft} ${color}` : 'none',
        borderBottom: s.borderBottom !== 'none' ? `${s.borderBottom} ${color}` : 'none',
        borderRight: s.borderRight !== 'none' ? `${s.borderRight} ${color}` : 'none',
      }}
    />
  );
}

function RadarElement({ color, isHovered }: { color: string; isHovered: boolean }) {
  return (
    <div style={{ position: 'relative', width: 16, height: 16 }}>
      <motion.div
        animate={{ opacity: isHovered ? 0.8 : 0.3, scale: isHovered ? [1, 1.15, 1] : 1 }}
        transition={{ duration: isHovered ? 1.2 : 0.3, repeat: isHovered ? Infinity : 0 }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `1px solid ${color}60`,
        }}
      />
      <div style={{
        position: 'absolute',
        inset: 4,
        borderRadius: '50%',
        border: `1px solid ${color}40`,
      }} />
      <motion.div
        animate={{ opacity: isHovered ? 1 : 0.5 }}
        style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 3, height: 3,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 4px ${color}`,
        }}
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: isHovered ? 1.5 : 4, repeat: Infinity, ease: 'linear' }}
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          width: '50%', height: '1px',
          background: `linear-gradient(to right, ${color}80, transparent)`,
          transformOrigin: 'left center',
        }} />
      </motion.div>
    </div>
  );
}
