"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import AnimatedSection from "../../animations/AnimatedSection"
import { getCertifications } from "../../../services/dataService"
import type { CertificationEntry } from "../../../data/certifications"
import {
  CutoutCard,
  CutoutCardMedia,
  CutoutCardImage,
  CutoutCardOverlay,
  CutoutCardContent,
  useCutoutContentStaggerVariants,
} from "../../ui/cutout-card"

function SkeletonCard() {
  const shimmer = "bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] animate-shimmer"
  return (
    <div className="rounded-lg border border-[#00e67a]/15 bg-black/55 backdrop-blur-md overflow-hidden">
      <div className={`h-24 ${shimmer}`} />
      <div className="p-3 space-y-2">
        <div className={`h-3 w-3/4 rounded ${shimmer}`} />
        <div className={`h-2 w-1/2 rounded ${shimmer}`} />
      </div>
    </div>
  )
}

function CertCard({ cert, index }: { cert: CertificationEntry; index: number }) {
  const stagger = useCutoutContentStaggerVariants()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <CutoutCard className="border border-[#00e67a]/15 bg-black/55 backdrop-blur-md transition-all duration-300">
        <CutoutCardMedia className="h-24">
          {cert.image ? (
            <>
              <CutoutCardImage src={cert.image} alt={cert.title} className="h-full w-full object-cover" />
              <CutoutCardOverlay />
            </>
          ) : (
            <div className="h-full w-full bg-[#00e67a]/5 flex items-center justify-center">
              <span className="text-[#00e67a]/20 text-2xl font-mono">◆</span>
            </div>
          )}
        </CutoutCardMedia>

        <CutoutCardContent>
          <motion.div
            animate="show"
            className="contents"
            initial="hidden"
            variants={stagger.container}
          >
            <motion.div className="p-3 space-y-2" variants={stagger.item}>
              <h3 className="text-white/90 text-xs font-mono leading-tight line-clamp-2">
                {cert.title}
              </h3>
              <p className="text-[#00e67a] text-[10px] font-mono truncate">
                {cert.issuer}
              </p>
              <a
                href={cert.credentialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-1.5 rounded border border-[#00e67a]/40 bg-[#00e67a]/10 px-2 py-0.5 text-[9px] font-mono uppercase tracking-[0.15em] text-white shadow-[0_0_20px_rgba(0,230,122,0.08)] transition-all duration-300 hover:bg-[#00e67a]/20 hover:shadow-[0_0_30px_rgba(0,230,122,0.2)] active:scale-[0.97]"
              >
                Show Credentials
                <span className="text-[10px] transition-transform duration-300 group-hover:translate-x-0.5">→</span>
              </a>
            </motion.div>
          </motion.div>
        </CutoutCardContent>
      </CutoutCard>
    </motion.div>
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
      <div className="max-w-7xl mx-auto">
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

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={`skeleton-${i}`} />
              ))
            : data.map((cert, i) => (
                <CertCard key={cert.id} cert={cert} index={i} />
              ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
