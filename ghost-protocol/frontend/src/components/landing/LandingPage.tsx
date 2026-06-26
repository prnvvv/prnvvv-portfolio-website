import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './Landing.css';

import ParticleBackground from './ParticleBackground';
import ScanlineOverlay from './ScanlineOverlay';
import GlitchText from './GlitchText';
import TypingSubtitle from './TypingSubtitle';
import CommandButton from './CommandButton';
import StatusBar from './StatusBar';
import ScrollIndicator from './ScrollIndicator';
import { useMouseTilt } from '../../hooks/useMouseTilt';
import { getProfile, getStats, getSocialLinks, getProjects } from '../../services/dataService';

const TITLES = [
  'AI/ML Engineer',
  'Agentic AI Specialist',
  'Full-Stack Developer',
  'Patent Holder',
];

export default function LandingPage() {
  const { ref, onMouseMove, onMouseLeave } = useMouseTilt(4);
  const profile = getProfile();
  const stats = getStats();
  const socialLinks = getSocialLinks();
  const projects = getProjects();

  const [titleIndex, setTitleIndex] = useState(0);
  const [typedTitle, setTypedTitle] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = TITLES[titleIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting) {
      if (typedTitle.length < current.length) {
        timeout = setTimeout(() => {
          setTypedTitle(current.slice(0, typedTitle.length + 1));
        }, 80);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 2000);
      }
    } else {
      if (typedTitle.length > 0) {
        timeout = setTimeout(() => {
          setTypedTitle(typedTitle.slice(0, -1));
        }, 40);
      } else {
        setIsDeleting(false);
        setTitleIndex((prev) => (prev + 1) % TITLES.length);
      }
    }

    return () => clearTimeout(timeout);
  }, [typedTitle, isDeleting, titleIndex]);

  const scrollToDashboard = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 300);
  };

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
          maxWidth: '960px',
          padding: 'clamp(24px, 5vw, 40px) clamp(16px, 4vw, 24px)',
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
            color: 'rgba(0, 230, 59, 0.5)',
            letterSpacing: '0.4em',
            marginBottom: '28px',
            textTransform: 'uppercase',
          }}
        >
          [ GHOST PROTOCOL // COMMAND CENTER ]
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
            padding: 'clamp(28px, 5vw, 44px) clamp(20px, 4vw, 48px) clamp(28px, 5vw, 40px)',
            background: 'rgba(10, 10, 15, 0.85)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 230, 59, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '28px',
          }}
        >
          {/* Corner brackets */}
          <span className="corner-bracket tl" />
          <span className="corner-bracket tr" />
          <span className="corner-bracket bl" />
          <span className="corner-bracket br" />

          {/* Status banner */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '-4px',
            }}
          >
            <span className="status-dot" />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                color: '#00ff41',
                letterSpacing: '0.3em',
              }}
            >
              OPERATOR STATUS: ACTIVE
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                color: 'rgba(0, 230, 59, 0.35)',
                letterSpacing: '0.2em',
                border: '1px solid rgba(0, 230, 59, 0.2)',
                padding: '1px 8px',
              }}
            >
              {profile.clearanceLevel}
            </span>
          </motion.div>

          {/* Ghost Protocol label */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              color: 'rgba(0, 230, 59, 0.45)',
              letterSpacing: '0.35em',
              textTransform: 'uppercase',
              marginBottom: '-8px',
            }}
          >
            {profile.callSign} // {profile.rank}
          </motion.div>

          {/* Main name with glitch effect */}
          <div style={{ textAlign: 'center' }}>
            <GlitchText
              text={profile.name}
              className=""
            />
          </div>

          {/* Typing title effect */}
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 'clamp(14px, 2.5vw, 20px)',
              color: '#00d4ff',
              letterSpacing: '0.2em',
              minHeight: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
            }}
          >
            <span style={{ color: 'rgba(0, 212, 255, 0.4)' }}>{'<'}</span>
            {typedTitle}
            <span className="typing-cursor" style={{ height: '1.2em' }} />
            <span style={{ color: 'rgba(0, 212, 255, 0.4)' }}>{'/>'}</span>
          </div>

          {/* Divider */}
          <div
            aria-hidden="true"
            style={{
              width: '100%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(0,230,59,0.3), rgba(0,204,51,0.3), transparent)',
            }}
          />

          {/* Real bio / mission statement */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 'clamp(12px, 1.6vw, 14px)',
              color: '#c8ffd4',
              textAlign: 'center',
              lineHeight: 1.7,
              maxWidth: '680px',
              width: '100%',
              letterSpacing: '0.05em',
            }}
          >
            {profile.bio}
          </motion.p>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.0, duration: 0.8 }}
            className="stats-grid"
          >
            <StatItem value={stats.yearsActive} label="YEARS ACTIVE" suffix="+" />
            <StatItem value={stats.totalProjects} label="MISSIONS" />
            <StatItem value={stats.activeProjects} label="ACTIVE OPS" />
            <StatItem value={stats.certifications} label="CERTIFICATIONS" />
            <StatItem value={stats.skillsCount} label="SKILLS" />
            <StatItem value={stats.patentsPublished + stats.patentsFiled} label="PATENTS" />
          </motion.div>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.4, duration: 0.6 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {socialLinks.map((link) => (
              <motion.a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="social-link"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 18px',
                  border: '1px solid rgba(0, 230, 59, 0.2)',
                  color: 'rgba(0, 230, 59, 0.8)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  letterSpacing: '0.1em',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <span style={{ fontSize: '14px' }}>{link.icon}</span>
                {link.label}
              </motion.a>
            ))}
          </motion.div>

          {/* Divider */}
          <div
            aria-hidden="true"
            style={{
              width: '60%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(0,230,59,0.15), transparent)',
            }}
          />

          {/* CTA Buttons */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <CommandButton />
            <motion.button
              onClick={scrollToDashboard}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="cmd-button-secondary"
            >
              <span style={{ marginRight: 8, fontSize: 14, opacity: 0.8 }}>◈</span>
              OPEN COMMS
            </motion.button>
          </div>

          {/* Status Bar */}
          <StatusBar />
        </div>

        {/* Bottom classification label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5.2, duration: 0.8 }}
          style={{
            marginTop: 'clamp(16px, 3vw, 24px)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            color: 'rgba(0, 230, 59, 0.35)',
            letterSpacing: '0.3em',
            textAlign: 'center',
          }}
        >
          // END-TO-END ENCRYPTED // DELTA ENGINEERING // ALL TRANSMISSIONS LOGGED
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <ScrollIndicator />
    </div>
  );
}

function StatItem({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 800;
    const stepTime = Math.max(Math.floor(duration / end), 16);
    const iv = setInterval(() => {
      start += 1;
      setDisplay(start);
      if (start >= end) clearInterval(iv);
    }, stepTime);
    return () => clearInterval(iv);
  }, [value]);

  return (
    <div className="stat-item">
      <span className="stat-value">
        {display}{suffix}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}
