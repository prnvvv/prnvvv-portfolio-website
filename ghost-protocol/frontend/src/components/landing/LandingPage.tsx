import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './Landing.css';

import ParticleBackground from './ParticleBackground';
import ScanlineOverlay from './ScanlineOverlay';
import GlitchText from './GlitchText';
import CommandButton from './CommandButton';
import StatusBar from './StatusBar';
import ScrollIndicator from './ScrollIndicator';
import { useScrollAnimation } from '../../hooks/useScrollAnimation'
import CountUp from '../animations/CountUp'
import { getProfile, getStats, getSocialLinks } from '../../services/dataService';

const TITLES = [
  'AI/ML Engineer',
  'Agentic AI Specialist',
  'Full-Stack Developer',
  'Patent Holder',
];

export default function LandingPage() {
  const profile = getProfile();
  const stats = getStats();
  const { scale, opacity } = useScrollAnimation({
    inputRange: [0, 300],
    scaleRange: [1, 0.95],
    opacityRange: [1, 0.6],
  })
  const socialLinks = getSocialLinks();

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
        }, 60);
      } else {
        timeout = setTimeout(() => setIsDeleting(true), 3000);
      }
    } else {
      if (typedTitle.length > 0) {
        timeout = setTimeout(() => {
          setTypedTitle(typedTitle.slice(0, -1));
        }, 30);
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
        backgroundColor: '#0d0d14',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div className="hex-grid" aria-hidden="true" />
      <Suspense fallback={null}>
        <ParticleBackground />
      </Suspense>
      <div className="vignette" aria-hidden="true" />
      <ScanlineOverlay />
      <StatusBar />

      <motion.div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1160px',
          padding: '0 40px',
          marginTop: 40,
          scale,
          opacity,
        }}
      >
        <div
          className="landing-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 280px',
            gap: 64,
            alignItems: 'start',
          }}
        >
          {/* ─── LEFT COLUMN: Main content ─── */}
          <div style={{ paddingTop: 48 }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              style={{ marginBottom: 24 }}
            >
              <span
                style={{
                  display: 'inline-block',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  color: '#00e67a',
                  letterSpacing: '0.25em',
                  border: '1px solid rgba(0, 230, 122, 0.15)',
                  padding: '3px 10px',
                  textTransform: 'uppercase',
                }}
              >
                {profile.clearanceLevel}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ marginBottom: 20 }}
            >
              <h1
                style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 'clamp(36px, 5vw, 56px)',
                  fontWeight: 700,
                  color: '#f0f0f0',
                  letterSpacing: '0.08em',
                  lineHeight: 1.1,
                  margin: 0,
                }}
              >
                <GlitchText
                  text={profile.name}
                  className=""
                />
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 32,
                minHeight: 28,
              }}
            >
              <span style={{ color: '#4a4a5a', fontSize: 14 }}>{'<'}</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 'clamp(14px, 1.8vw, 18px)',
                  color: '#9a9aaa',
                  letterSpacing: '0.12em',
                }}
              >
                {typedTitle}
              </span>
              <span className="typing-cursor" style={{ height: '1.2em' }} />
              <span style={{ color: '#4a4a5a', fontSize: 14 }}>{'/>'}</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 'clamp(12px, 1.2vw, 13px)',
                color: '#4a4a5a',
                lineHeight: 1.8,
                maxWidth: 520,
                marginBottom: 40,
                letterSpacing: '0.03em',
              }}
            >
              {profile.bio}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 48,
              }}
            >
              {socialLinks.map((link) => (
                <motion.a
                  key={link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, color: '#f0f0f0' }}
                  whileTap={{ scale: 0.95 }}
                  className="social-link"
                  aria-label={link.platform}
                >
                  {link.icon}
                </motion.a>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
            >
              <CommandButton />
            </motion.div>
          </div>

          {/* ─── RIGHT COLUMN: Sidebar stats ─── */}
          <div style={{ paddingTop: 48 }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: 'rgba(13, 13, 20, 0.6)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(0, 230, 122, 0.08)',
                padding: '24px 20px',
              }}
            >
              <div
                style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 9,
                  color: '#00e67a',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  marginBottom: 16,
                  paddingBottom: 12,
                  borderBottom: '1px solid rgba(0, 230, 122, 0.08)',
                }}
              >
                ◆ SIGNAL
              </div>

              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Missions</span>
                <span className="sidebar-stat-value">
                  <CountUp end={stats.totalProjects} duration={1500} />
                </span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Active Ops</span>
                <span className="sidebar-stat-value">
                  <CountUp end={stats.activeProjects} duration={1500} />
                </span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Years Active</span>
                <span className="sidebar-stat-value">
                  <CountUp end={stats.yearsActive} duration={1500} suffix="+" />
                </span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Skills</span>
                <span className="sidebar-stat-value">
                  <CountUp end={stats.skillsCount} duration={1500} />
                </span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Certifications</span>
                <span className="sidebar-stat-value">
                  <CountUp end={stats.certifications} duration={1500} />
                </span>
              </div>
              <div className="sidebar-stat">
                <span className="sidebar-stat-label">Patents</span>
                <span className="sidebar-stat-value">
                  <CountUp end={stats.patentsPublished + stats.patentsFiled} duration={1500} />
                </span>
              </div>

              <div
                style={{
                  marginTop: 16,
                  paddingTop: 12,
                  borderTop: '1px solid rgba(0, 230, 122, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    background: '#00e67a',
                    display: 'inline-block',
                    boxShadow: '0 0 8px rgba(0, 230, 122, 0.4)',
                  }}
                />
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10,
                    color: '#00e67a',
                    letterSpacing: '0.1em',
                  }}
                >
                  ALL SYSTEMS OPERATIONAL
                </span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                marginTop: 12,
                padding: '16px 20px',
                border: '1px solid rgba(0, 230, 122, 0.06)',
                background: 'rgba(13, 13, 20, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span style={{ color: '#4a4a5a', fontSize: 10 }}>⌂</span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: '#4a4a5a',
                  letterSpacing: '0.1em',
                }}
              >
                {profile.location}
              </span>
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.0, duration: 0.8 }}
          style={{
            marginTop: 64,
            paddingTop: 20,
            borderTop: '1px solid rgba(0, 230, 122, 0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: '#4a4a5a',
            letterSpacing: '0.15em',
          }}
        >
          <span>// END-TO-END ENCRYPTED // ALL TRANSMISSIONS LOGGED</span>
          <span>DELTA ENGINEERING // {profile.callSign}-01</span>
        </motion.div>
      </motion.div>

      <ScrollIndicator />
    </div>
  );
}
