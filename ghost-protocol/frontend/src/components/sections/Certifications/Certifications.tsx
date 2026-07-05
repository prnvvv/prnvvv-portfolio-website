"use client"

import { motion } from "framer-motion"
import AnimatedSection from "../../animations/AnimatedSection"
import { getCertifications } from "../../../services/dataService"
import type { CertificationEntry } from "../../../data/certifications"

function CertCard({ cert }: { cert: CertificationEntry }) {
  return (
    <div className="border border-[#00e67a]/15 bg-black/55 backdrop-blur-md rounded-lg overflow-hidden h-full">
      <div className="h-24 shrink-0">
        {cert.image ? (
          <img src={cert.image} alt={cert.title} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-[#00e67a]/5 flex items-center justify-center">
            <span className="text-[#00e67a]/20 text-2xl font-mono">◆</span>
          </div>
        )}
      </div>

      <div className="p-3 space-y-2">
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
          className="cir-btn"
          style={{ height: '36px', padding: '0 18px', fontSize: '13px', gap: '8px' }}
        >
          Show Credentials
          <span className="cir-btn__arrow">→</span>
        </a>
      </div>
    </div>
  )
}

export default function Certifications() {
  const data = getCertifications()

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {data.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
            >
              <CertCard cert={cert} />
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
