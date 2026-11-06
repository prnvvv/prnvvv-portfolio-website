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
import {
  Terminal,
  TypingAnimation,
} from '../ui/terminal';

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
      <div className="relative z-10 min-h-dvh md:h-dvh flex flex-col overflow-x-hidden md:overflow-hidden max-w-[100vw]">
        {/* Hero Content */}
        <div className="flex-1 flex flex-col lg:flex-row items-center max-md:justify-start justify-center px-4 sm:px-5 lg:px-8 pt-[64px] md:pt-[4rem] pb-6 md:pb-2">
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
                  className="font-mono font-bold text-[1.08rem] sm:text-[1.201rem] md:text-[1.441rem] text-[#00e67a]"
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
              <Terminal className="w-full max-w-[500px] h-[176px] min-[360px]:h-[150px] min-[560px]:h-[132px] md:h-[180px] border border-[#00e67a]/15 rounded-lg bg-black/40 backdrop-blur-md overflow-hidden">
                <TypingAnimation
                  duration={13}
                  className="text-white/80 text-[13px] md:text-base font-mono leading-snug md:leading-relaxed"
                >
                  Building agentic AI, generative AI, and data-driven solutions to solve real-world problems. Combining strong DSA fundamentals with end-to-end ML expertise to develop scalable, production-ready systems that drive measurable impact across industries.
                </TypingAnimation>
              </Terminal>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5, ease: [0.22,1,0.36,1] }}
              className="max-md:w-full max-md:max-w-[500px] mt-1 md:mt-0"
            >
              <MagicButton />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.5 }}
              className="flex items-center gap-1.5 text-[0.72rem] sm:text-[0.84rem] text-white/50"
            >
              <MapPin size={11} color="rgba(0,230,122,0.4)" />
              {profile.location}
            </motion.div>
          </div>

          {/* Right: Globe */}
          <div className="w-full lg:w-1/2 flex items-center justify-center mt-4 lg:mt-0">
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
