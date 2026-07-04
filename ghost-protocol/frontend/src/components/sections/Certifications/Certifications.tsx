import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaUniversity, FaMicrochip, FaAws, FaAward } from 'react-icons/fa'
import { SiGoogle, SiGooglecloud } from 'react-icons/si'
import AnimatedSection from '../../animations/AnimatedSection'
import { getCertifications } from '../../../services/dataService'
import type { CertificationEntry } from '../../../data/certifications'

const ISSUER_ICON: Record<string, React.ReactNode> = {
  'Stanford University': <FaUniversity />,
  'IBM': <FaMicrochip />,
  'Amazon Web Services': <FaAws />,
  'Google': <SiGoogle />,
  'Google Cloud': <SiGooglecloud />,
}

function SkeletonCard() {
  const shimmer = 'bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] animate-shimmer'
  return (
    <div className="bg-black/55 backdrop-blur-md border border-[#00e67a]/10 rounded-lg aspect-[4/3] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-black/40 border-b border-[#00e67a]/5">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-white/10" />
          <div className="w-3 h-3 rounded-full bg-white/10" />
          <div className="w-3 h-3 rounded-full bg-white/10" />
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className={`h-3 w-3/4 rounded ${shimmer}`} />
        <div className={`h-2 w-1/2 rounded ${shimmer}`} />
        <div className={`h-2 w-2/3 rounded ${shimmer}`} />
      </div>
    </div>
  )
}

function FlipCard({ cert }: { cert: CertificationEntry }) {
  const icon = ISSUER_ICON[cert.issuer] || <FaAward />

  return (
    <div className="flip-card-group perspective-1000 w-full aspect-[4/3] cursor-pointer">
      <div className="flip-card-inner preserve-3d relative w-full h-full">
        {/* ─── Front: Mac OS Terminal ─── */}
        <div className="absolute inset-0 backface-hidden bg-black/55 backdrop-blur-md border border-[#00e67a]/15 rounded-lg overflow-hidden flex flex-col">
          {/* Terminal header */}
          <div className="flex items-center justify-between px-4 py-2 bg-black/40 border-b border-[#00e67a]/10 shrink-0">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
            </div>
            <span className="text-[10px] font-mono text-white/20">{cert.issuerShort}</span>
            <div className="w-12" />
          </div>

          {/* Terminal content */}
          <div className="flex-1 p-4 font-mono flex flex-col justify-center">
            <div className="flex items-center gap-1 text-xs text-[#00e67a] flex-wrap">
              <span>user@ghost-protocol</span>
              <span className="text-white/30">:</span>
              <span className="text-white/30">~/certs</span>
              <span className="text-white/30">$</span>
              <span className="text-white/60 ml-1">ls</span>
            </div>
            <div className="mt-2 text-white/90 text-sm font-mono leading-snug tracking-wide">
              <span className="text-[#00e67a]/60">&gt;&gt;</span> {cert.title}
            </div>
            <div className="text-[#00e67a]/60 text-[11px] font-mono mt-1 tracking-wider">
              ISSUED: {cert.issuer}
            </div>
            <div className="text-[#00e67a]/60 text-[11px] font-mono mt-0.5 tracking-wider">
              PLATFORM: {cert.platform}
            </div>
            <div className="mt-2 text-[#00e67a]/80 text-[11px] font-mono tracking-wider">
              {'>'} Hover to view
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 px-4 py-1.5 border-t border-[#00e67a]/5">
            <span className="text-[10px] font-mono text-[#00e67a]/35 tracking-widest uppercase">STATUS: VERIFIED</span>
          </div>
        </div>

        {/* ─── Back: Certificate Image / Placeholder ─── */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 bg-black/55 backdrop-blur-md border border-[#00e67a]/15 rounded-lg overflow-hidden">
          {cert.image ? (
            <>
              <img src={cert.image} alt={cert.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d14]/80 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 text-[#00e67a]/30 text-lg">
                {icon}
              </div>
            </>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-black/55">
              <span className="text-[#00e67a]/15 text-6xl">{icon}</span>
              <span className="text-white/10 text-[10px] font-mono mt-3 tracking-wider">CERTIFICATE IMAGE</span>
            </div>
          )}
          <div className="absolute top-2 right-2 bg-[#00e67a]/15 border border-[#00e67a]/25 px-2 py-0.5 rounded">
            <span className="text-[8px] font-mono text-[#00e67a]/70 tracking-wider">VERIFIED</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Certifications() {
  const [loading, setLoading] = useState(true)
  const data = getCertifications()

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatedSection id="certifications" className="pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="section-header mb-8"
        >
          <span>◆</span>
          <span>CREDENTIALS VAULT</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  <SkeletonCard />
                </motion.div>
              ))
            : data.map((cert, i) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <FlipCard cert={cert} />
                </motion.div>
              ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
