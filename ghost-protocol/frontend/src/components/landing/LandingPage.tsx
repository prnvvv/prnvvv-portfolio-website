import { useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { getProfile } from '../../services/dataService';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';

import HeroName from '../HeroText/HeroName';
import HeroSubtitle from '../HeroText/HeroSubtitle';
import CobeGlobe from '../Globe/CobeGlobe';
import Dither from '../effects/Dither';
import DecryptText from '../effects/DecryptText';
import { ROTATING_TITLES } from '../../data/titles';
import MagicButton from '../ui/MagicButton';
import SocialIcons from '../social/SocialIcons';
import ObjectiveCard from './ObjectiveCard';

export default function LandingPage() {
  const profile = getProfile();
  const reduced = usePrefersReducedMotion();
  const globeContainerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <SocialIcons />

      {/* Dither Background */}
      <div className="fixed inset-0 z-0 opacity-30 md:opacity-100">
        <Dither
          waveColor={[0.0, 0.9, 0.48]}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.35}
          colorNum={4}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.04}
          pixelSize={2}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/90 via-black/75 to-black/95 md:from-black/70 md:via-black/40 md:to-black/80 pointer-events-none" />
      </div>

      {/* Main Wrapper — h-dvh locks to viewport, overflow-hidden kills scroll + flicker */}
      <div className="relative z-10 h-dvh flex flex-col overflow-hidden max-w-[100vw]">
        {/* Hero Content */}
        <div className="flex-1 flex flex-col lg:flex-row items-center justify-center px-3 sm:px-5 lg:px-8 py-2">
          {/* Left: Text Block */}
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left max-w-xl gap-1 sm:gap-1.5">
            <div className="hero-name-wrap">
              <HeroName name={profile.name} />
            </div>

            <div className="hero-role-wrap">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5, ease: [0.22,1,0.36,1] }}
              >
                <DecryptText
                  texts={ROTATING_TITLES}
                  interval={4000}
                  className="font-mono font-bold text-lg sm:text-xl md:text-2xl text-[#00e67a]"
                />
              </motion.div>
            </div>

            <div className="hero-subtitle-wrap" style={{ marginBottom: 0 }}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5, ease: [0.22,1,0.36,1] }}
              >
                <HeroSubtitle
                  lines={['Building scalable AI/ML systems & agentic solutions']}
                  initialDelay={700}
                />
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.5, ease: [0.22,1,0.36,1] }}
              className="mt-1 mb-1"
            >
              <ObjectiveCard />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5, ease: [0.22,1,0.36,1] }}
            >
              <MagicButton />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="flex items-center gap-1.5 text-xs sm:text-sm text-white/50"
            >
              <MapPin size={11} color="rgba(0,230,122,0.4)" />
              {profile.location}
            </motion.div>
          </div>

          {/* Right: Globe */}
          <div className="w-full lg:w-1/2 flex items-center justify-center mt-3 lg:mt-0">
            <div className="globe-container hero-globe-wrapper" ref={globeContainerRef}>
              <CobeGlobe
                reduced={reduced}
                interactive={!reduced}
                containerRef={globeContainerRef}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
