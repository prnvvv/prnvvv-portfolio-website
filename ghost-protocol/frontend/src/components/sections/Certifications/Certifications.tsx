import { motion } from 'framer-motion'
import AnimatedSection from '../../animations/AnimatedSection'
import { getCertifications } from '../../../services/dataService'

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
          {data.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="bg-black/60 backdrop-blur-md border border-[#00e67a]/20 rounded-lg p-5 relative overflow-hidden hover:border-[#00e67a]/50 hover:bg-black/70 transition-all duration-300 hover:scale-[1.02] border-l-2 border-[#00e67a] min-h-[160px] flex flex-col justify-between h-full"
            >
              <span
                className="absolute top-2 right-3 text-4xl font-black opacity-[0.025] text-white select-none pointer-events-none"
                aria-hidden="true"
              >
                {cert.issuerShort}
              </span>

              <div className="flex items-center justify-between mb-2">
                <span className="text-white/40 text-xs font-mono">{cert.id}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider bg-[#00e67a]/10 text-[#00e67a]">
                  {cert.category}
                </span>
              </div>

              <h3 className="text-white font-bold text-base leading-tight mt-2 relative z-[1]">
                {cert.title}
              </h3>

              <p className="text-[#00e67a] font-mono text-sm mt-1 relative z-[1]">{cert.issuer}</p>

              <div className="mt-auto pt-3 relative z-[1]">
                <span className="bg-white/5 text-white/40 text-xs px-2 py-0.5 rounded font-mono">
                  {cert.platform}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
