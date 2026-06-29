import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { getProfile } from '../../services/dataService';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import ClearanceBadge from '../HeroBadge/ClearanceBadge';
import HeroName from '../HeroText/HeroName';
import HeroSubtitle from '../HeroText/HeroSubtitle';
import HeroStats from '../HeroStats/HeroStats';
import CobeGlobe from '../Globe/CobeGlobe';
import { TacticalRetroGrid } from '../effects/TacticalRetroGrid';
import { KineticText } from '@/components/ui/kinetic-text';
import MagicButton from '../ui/MagicButton';
import SocialIcons from '../social/SocialIcons';

export default function LandingPage() {
  const navigate = useNavigate();
  const profile = getProfile();
  const reduced = usePrefersReducedMotion();
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const starfieldRef = useRef<HTMLCanvasElement>(null);

  /* ─── Starfield background canvas ─── */
  useEffect(() => {
    if (reduced) return
    const canvasEl = starfieldRef.current
    if (!canvasEl) return
    const ctx = canvasEl.getContext('2d')
    if (!ctx) return

    canvasEl.width = window.innerWidth
    canvasEl.height = window.innerHeight

    interface Star {
      x: number; y: number; size: number; speed: number; alpha: number; twinkleSpeed: number; twinklePhase: number
    }
    const stars: Star[] = []
    for (let i = 0; i < 240; i++) {
      stars.push({
        x: Math.random() * canvasEl.width,
        y: Math.random() * canvasEl.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.15 + 0.04,
        alpha: Math.random() * 0.4 + 0.15,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
      })
    }

    let animId: number
    const startTime = Date.now()

    const animate = () => {
      const c = starfieldRef.current
      const cx = c?.getContext('2d')
      if (!c || !cx) { animId = requestAnimationFrame(animate); return }

      const elapsed = Date.now() - startTime
      c.width = window.innerWidth
      c.height = window.innerHeight
      cx.clearRect(0, 0, c.width, c.height)
      for (const star of stars) {
        star.y += star.speed * 0.3
        if (star.y > c.height + 5) {
          star.y = -5
          star.x = Math.random() * c.width
        }

        const twinkle = 0.5 + 0.5 * Math.sin(elapsed * star.twinkleSpeed + star.twinklePhase)
        const currentAlpha = star.alpha * twinkle

        cx.beginPath()
        cx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        cx.fillStyle = `rgba(0, 255, 136, ${currentAlpha})`
        cx.fill()

        if (star.size > 1.5) {
          const glow = cx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 4)
          glow.addColorStop(0, `rgba(0, 255, 136, ${currentAlpha * 0.15})`)
          glow.addColorStop(1, 'rgba(0, 255, 136, 0)')
          cx.fillStyle = glow
          cx.beginPath()
          cx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2)
          cx.fill()
        }
      }
      animId = requestAnimationFrame(animate)
    }
    animate()

    const handleResize = () => {
      canvasEl.width = window.innerWidth
      canvasEl.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleScrollToDossier = () => {
    navigate('/dashboard');
  };

  return (
    <>
      {/* ─── Background Atmosphere Layers ─── */}
      <div className="hero-bg-layer hero-bg-base" aria-hidden="true" style={{ zIndex: 0 }} />
      <TacticalRetroGrid />
      <canvas ref={starfieldRef} className="hero-bg-starfield" aria-hidden="true" />
      <div className="hero-bg-layer hero-bg-vignette" aria-hidden="true" />
      <div className="hero-bg-layer hero-bg-scanlines" aria-hidden="true" />

      <SocialIcons />

      {/* ─── Navbar ─── */}
      <nav className="hero-navbar" role="navigation" aria-label="Main navigation">
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
            <FaGithub size={13} />
            GITHUB
          </a>
          <a
            href="https://linkedin.com/in/prannavakhanth"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-navbar-link flex items-center gap-1.5"
          >
            <FaLinkedin size={13} />
            LINKEDIN
          </a>
          <a
            href="mailto:prannavakhanth12@gmail.com"
            className="hero-navbar-link flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            EMAIL
          </a>
        </div>
      </nav>

      {/* ─── Hero Section ─── */}
      <div className="hero-section">
        <div className="hero-content">
          {/* ─── Left column: Hero text stack ─── */}
          <div className="hero-zone-a">
            <div className="hero-clearance">
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: [0.22,1,0.36,1] }}
              >
                <ClearanceBadge />
              </motion.div>
            </div>

            <div className="hero-name-wrap">
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
              <HeroSubtitle
                lines={['Building scalable AI/ML systems & agentic solutions']}
                initialDelay={800}
              />
            </motion.div>

            <hr className="hero-rule" />

            <div className="hero-bio-wrap">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0, duration: 0.6, ease: [0.22,1,0.36,1] }}
                className="hero-bio"
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
            >
              <MapPin size={11} color="rgba(0,200,100,0.4)" />
              {profile.location}
            </motion.div>
          </div>

          {/* ─── Right column: Globe + Stats ─── */}
          <div className="hero-zone-b hero-right-col">
            <div className="globe-container" ref={globeContainerRef}>
              <CobeGlobe
                reduced={reduced}
                interactive={!reduced}
                containerRef={globeContainerRef}
              />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6, duration: 0.5 }}
            >
              <HeroStats />
            </motion.div>
          </div>
        </div>

      </div>
    </>
  );
}
