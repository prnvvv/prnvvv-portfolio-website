import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { getProfile } from '../../services/dataService';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

import HeroName from '../HeroText/HeroName';
import HeroSubtitle from '../HeroText/HeroSubtitle';
import CobeGlobe from '../Globe/CobeGlobe';
import Dither from '../effects/Dither';
import { KineticText } from '@/components/ui/kinetic-text';
import MagicButton from '../ui/MagicButton';
import SocialIcons from '../social/SocialIcons';

export default function LandingPage() {
  const navigate = useNavigate();
  const profile = getProfile();
  const reduced = usePrefersReducedMotion();
  const globeContainerRef = useRef<HTMLDivElement>(null);

  const handleScrollToDossier = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <SocialIcons />

      {/* ─── Navbar ─── */}
      <nav className="hero-navbar" role="navigation" aria-label="Main navigation" style={{ zIndex: 50 }}>
        <div className="hero-navbar-brand">
          <span className="hero-navbar-brand-dot" />
          GHOST PROTOCOL
        </div>
        <div className="hero-navbar-links">
          <a
            href="https://github.com/prannavakhanth"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-navbar-link flex items-center gap-1.5"
          >
            <FaGithub size={15} />
          </a>
          <a
            href="https://linkedin.com/in/prannavakhanth"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-navbar-link flex items-center gap-1.5"
          >
            <FaLinkedin size={15} />
          </a>
          <a
            href="mailto:prannavakhanth12@gmail.com"
            className="hero-navbar-link flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </a>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <div className="hero-section" style={{ position: 'relative', overflow: 'hidden' }}>
        {/* ─── Dither Background + Overlay ─── */}
        <div className="absolute inset-0 z-0">
          <Dither
            waveColor={[0.0, 0.9, 0.48]}
            disableAnimation={false}
            enableMouseInteraction={true}
            mouseRadius={0.3}
            colorNum={4}
            waveAmplitude={0.3}
            waveFrequency={3}
            waveSpeed={0.04}
            pixelSize={2}
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/65 via-black/35 to-black/75 pointer-events-none" />

        <div className="relative z-[2] w-full h-full flex items-center">
          <div className="hero-content pt-20">
            {/* ─── Left column: Hero text stack ─── */}
            <div className="hero-zone-a">
              <div className="hero-clearance" style={{ minHeight: '24px' }} />

              <div className="hero-name-wrap" style={{ filter: 'drop-shadow(0 4px 30px rgba(0,0,0,0.8))' }}>
                <HeroName name={profile.name} />
              </div>

              <div className="hero-role-wrap">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5, ease: [0.22,1,0.36,1] }}
                  style={{
                    fontFamily: 'Share Tech Mono, monospace',
                    fontSize: 'clamp(16px, 2vw, 22px)',
                    color: 'rgba(0, 230, 122, 0.85)',
                    letterSpacing: '0.05em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '28px',
                  }}
                >
                  <span style={{ color: 'rgba(0,230,122,0.4)' }}>{'< '}</span>
                  <KineticText
                    text={profile.specialization}
                    as="span"
                    className="font-mono text-[#00e67a] [&_span]:transition-all [&_span]:duration-150 hover:[&_span]:text-white"
                  />
                  <span style={{ color: 'rgba(0,230,122,0.4)' }}>{' />'}</span>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5, ease: [0.22,1,0.36,1] }}
              >
                <div style={{ filter: 'drop-shadow(0 4px 30px rgba(0,0,0,0.8))' }}>
                  <HeroSubtitle
                    lines={['Building scalable AI/ML systems & agentic solutions']}
                    initialDelay={800}
                  />
                </div>
              </motion.div>

              <hr className="hero-rule" />

              <div className="hero-bio-wrap">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.6, ease: [0.22,1,0.36,1] }}
                  className="hero-bio"
                  style={{ maxWidth: '520px', filter: 'drop-shadow(0 4px 30px rgba(0,0,0,0.8))' }}
                >
                  {profile.bio}
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.5, ease: [0.22,1,0.36,1] }}
                className="hero-cta-row"
              >
                <MagicButton />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.5 }}
                className="hero-location"
                style={{ filter: 'drop-shadow(0 4px 30px rgba(0,0,0,0.8))' }}
              >
                <MapPin size={11} color="rgba(0,230,122,0.4)" />
                {profile.location}
              </motion.div>
            </div>

            {/* ─── Right column: Globe + Stats ─── */}
            <div className="hero-zone-b hero-right-col" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
              <div className="globe-container" ref={globeContainerRef} style={{ width: '472px', height: '472px', marginTop: '100px' }}>
                <CobeGlobe
                  reduced={reduced}
                  interactive={!reduced}
                  containerRef={globeContainerRef}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
