import { motion } from "framer-motion"
import AnimatedSection from "../../animations/AnimatedSection"
import { getExperience } from "../../../services/dataService"
import type { ServiceEntry } from "../../../types/portfolio"
import "./ServiceRecord.css"

interface MilestoneLogProps {
  entry: ServiceEntry
  index: number
}

/** Compact terminal-style log for a single career milestone. */
function MilestoneLog({ entry, index }: MilestoneLogProps) {
  const num = String(index + 1).padStart(2, "0")
  const meta = [entry.organization, entry.unit, entry.location, entry.period].filter(Boolean)

  return (
    <div className="milestone-log">
      <div className="milestone-log-bar">
        <span className="milestone-log-dots" aria-hidden="true">
          <i /><i /><i />
        </span>
        <span className="milestone-log-cmd">$ cat /career/milestone-{num}.log</span>
      </div>
      <div className="milestone-log-body">
        <h3 className="milestone-log-title">{entry.title}</h3>
        <p className="milestone-log-meta">{meta.join(" · ")}</p>
        {entry.highlights.length === 0 && (
          <p className="milestone-log-text">{entry.description}</p>
        )}
        {entry.highlights.length > 0 && (
          <ul className="milestone-log-list">
            {entry.highlights.map((h) => (
              <li key={h}>
                <span aria-hidden="true">&gt;</span>
                <span>{h}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default function ServiceRecord() {
  const entries = getExperience()

  return (
    <AnimatedSection id="service-record" className="pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1360px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="section-header mb-8"
        >
          <span>◆</span>
          <span>SERVICE RECORD</span>
        </motion.div>

        <ol className="milestone-timeline">
          {entries.map((entry, i) => (
            <motion.li
              key={entry.id}
              className="milestone"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px 0px" }}
              transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="milestone-marker" aria-hidden="true" />
              <span className="milestone-label">MILESTONE {String(i + 1).padStart(2, "0")}</span>
              <MilestoneLog entry={entry} index={i} />
            </motion.li>
          ))}
        </ol>
      </div>
    </AnimatedSection>
  )
}
