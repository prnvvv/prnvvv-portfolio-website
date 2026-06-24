import { Suspense } from 'react';
import { motion } from 'framer-motion';
import './Landing.css';

import ParticleBackground from './ParticleBackground';
import ScanlineOverlay from './ScanlineOverlay';
import GlitchText from './GlitchText';
import TypingSubtitle from './TypingSubtitle';
import CommandButton from './CommandButton';
import StatusBar from './StatusBar';
import { useMouseTilt } from '../../hooks/useMouseTilt';

export default function LandingPage() {
  const { ref, onMouseMove, onMouseLeave } = useMouseTilt(4);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        minHeight: '100vh',
        backgroundColor: '#0a0a0f',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {/* Layer 0: Hex grid background */}
      <div className="hex-grid" aria-hidden="true" />

      {/* Layer 1: 3D Particles */}
      <Suspense fallback={null}>
        <ParticleBackground />
      </Suspense>

      {/* Layer 2: Vignette */}
      <div className="vignette" aria-hidden="true" />

      {/* Layer 3: Scanlines */}
      <ScanlineOverlay />

      {/* Layer 4: Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '900px',
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0',
        }}
      >
        {/* Top label */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
            color: 'rgba(0, 255, 65, 0.5)',
            letterSpacing: '0.4em',
            marginBottom: '28px',
            textTransform: 'uppercase',
          }}
        >
          [ INITIALIZING COMMAND CENTER ]
        </motion.div>

        {/* Tilt card */}
        <div
          ref={ref}
          className="tilt-card"
          onMouseMove={onMouseMove}
          onMouseLeave={onMouseLeave}
          style={{
            position: 'relative',
            width: '100%',
            padding: '52px 48px 48px',
            background: 'rgba(10, 10, 15, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 255, 65, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '36px',
          }}
        >
          {/* Corner brackets */}
          <span className="corner-bracket tl" />
          <span className="corner-bracket tr" />
          <span className="corner-bracket bl" />
          <span className="corner-bracket br" />

          {/* Ghost Protocol label */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '12px',
              color: 'rgba(0, 255, 65, 0.55)',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              marginBottom: '-20px',
            }}
          >
            GHOST PROTOCOL
          </motion.div>

          {/* Main title */}
          <div style={{ textAlign: 'center' }}>
            <GlitchText
              text="CALL-DUTY"
              className=""
              // Inline override for font size
            />
            <style>{`
              .glitch-container {
                font-family: 'JetBrains Mono', monospace;
                font-size: clamp(64px, 10vw, 120px);
                font-weight: 800;
                color: #e8e8e8;
                text-shadow:
                  0 0 20px rgba(0, 255, 65, 0.4),
                  0 0 60px rgba(0, 255, 65, 0.15);
                letter-spacing: 0.15em;
                line-height: 1;
                user-select: none;
              }
            `}</style>
          </div>

          {/* Divider */}
          <div
            aria-hidden="true"
            style={{
              width: '100%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(0,255,65,0.3), rgba(0,204,51,0.3), transparent)',
            }}
          />

          {/* Typing subtitle lines */}
          <TypingSubtitle />

          {/* Divider */}
          <div
            aria-hidden="true"
            style={{
              width: '60%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(0,255,65,0.15), transparent)',
            }}
          />

          {/* CTA */}
          <CommandButton />

          {/* Status bar */}
          <StatusBar />
        </div>

        {/* Bottom classification label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5.2, duration: 0.8 }}
          style={{
            marginTop: '24px',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            color: 'rgba(0, 255, 65, 0.35)',
            letterSpacing: '0.3em',
            textAlign: 'center',
          }}
        >
          // END-TO-END ENCRYPTED // DELTA ENGINEERING // ALL TRANSMISSIONS LOGGED
        </motion.div>
      </div>
    </div>
  );
}