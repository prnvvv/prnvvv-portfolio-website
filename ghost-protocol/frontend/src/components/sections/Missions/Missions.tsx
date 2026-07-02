import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import AnimatedSection from '../../animations/AnimatedSection'
import { ProjectsBentoGrid } from '../ProjectsBentoGrid'

export default function Missions() {
  return (
    <AnimatedSection id="missions" className="pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="section-header"
            style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}
          >
            <span>◆</span>
            <span>TOP MISSIONS</span>
          </motion.div>
          <Link
            to="/missions/all"
            className="group relative inline-flex items-center gap-3 px-6 py-3
              bg-black/40 backdrop-blur-md
              border border-[#00e67a]/20 rounded-full
              font-mono text-xs uppercase tracking-[0.15em] text-white no-underline
              hover:bg-black/60 hover:border-[#00e67a]/40
              transition-all duration-300 ease-in-out
              hover:scale-[0.975]
              shadow-[inset_0_0.125em_0.125em_rgba(0,0,0,0.05)]
              hover:shadow-[0_0.25em_0.125em_-0.125em_rgba(0,0,0,0.2)]"
          >
            <span>VIEW MORE MISSIONS</span>
            <span className="text-[#00e67a] group-hover:translate-x-1 transition-transform duration-300">&rarr;</span>
          </Link>
        </div>

        <hr style={{ border: 'none', height: '1px', background: 'rgba(0,230,122,0.2)', marginBottom: '24px' }} />

        <ProjectsBentoGrid />
      </div>
    </AnimatedSection>
  )
}
