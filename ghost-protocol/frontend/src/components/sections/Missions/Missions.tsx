import { motion } from 'framer-motion'
import AnimatedSection from '../../animations/AnimatedSection'
import { ProjectsBentoGrid } from '../ProjectsBentoGrid'

export default function Missions() {
  return (
    <AnimatedSection id="missions" className="py-8 sm:py-10 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="section-header"
        >
          <span>◆</span>
          <span>MISSIONS // OPERATIONS LOG</span>
        </motion.div>

        <ProjectsBentoGrid />
      </div>
    </AnimatedSection>
  )
}
