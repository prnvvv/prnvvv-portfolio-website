import { useState } from "react"
import { motion } from "framer-motion"
import AnimatedSection from "../../animations/AnimatedSection"
import { getExperience } from "../../../services/dataService"
import "./ServiceRecord.css"

const typeLabels: Record<string, string> = {
  work: "DEPLOYMENT",
  education: "TRAINING",
  certification: "CERTIFICATION",
}

const typeColors: Record<string, string> = {
  work: "#00e67a",
  education: "#00e67a",
  certification: "rgba(0, 230, 122, 0.5)",
}

interface TimelineIconProps {
  type: string
}

function TimelineIcon({ type }: TimelineIconProps) {
  if (type === "work") {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    )
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

function CodeLine({ text, type }: { text: string; type?: "comment" | "keyword" | "string" }) {
  const cls = type === "comment" ? "terminal-code-comment" :
    type === "keyword" ? "terminal-code-keyword" :
    type === "string" ? "terminal-code-string" : ""
  return <div className={`terminal-code-line ${cls}`}>{text}</div>
}

export default function ServiceRecord() {
  const serviceRecord = getExperience()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch { /* ignore */ }
  }

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const timelineItems = serviceRecord.map((entry, ei) => {
    const lines: { text: string; type?: "comment" | "keyword" | "string" }[] = []
    const lineNumStart = ei * 25 + 1
    let ln = lineNumStart

    lines.push({ text: `# ${entry.organization}`, type: "comment" })
    lines.push({ text: `# ${entry.period}`, type: "comment" })
    ln += 2
    lines.push({ text: "" }); ln++
    lines.push({ text: `role: "${entry.title}"`, type: "string" }); ln++
    lines.push({ text: "" }); ln++
    lines.push({ text: "highlights:", type: "keyword" }); ln++

    const displayHighlights = expandedId === entry.id
      ? entry.highlights
      : entry.highlights.slice(0, 2)

    for (const h of displayHighlights) {
      lines.push({ text: `  - ${h}`, type: "string" }); ln++
    }

    if (entry.highlights.length > 2 && !displayHighlights) {
      lines.push({ text: `  # ... +${entry.highlights.length - 2} more`, type: "comment" }); ln++
    }

    const lineNumbers = lines.map((_, i) => String(lineNumStart + i))

    return { entry, lines, lineNumbers }
  })

  return (
    <AnimatedSection id="service-record" className="pt-16 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
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

        <div className="timeline-wrapper relative pl-8">
          {timelineItems.map(({ entry, lines, lineNumbers }, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="timeline-item"
              data-line-active={i === 0 || i < timelineItems.length - 1 ? "true" : undefined}
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.15, duration: 0.25, type: "spring", bounce: 0.3 }}
                className="timeline-bullet"
                data-active="true"
              >
                <TimelineIcon type={entry.type} />
              </motion.div>

              <div className="timeline-body">
                <div className="terminal-card">
                  <div className="terminal-header">
                    <div className="terminal-header-left">
                      <span
                        className="terminal-header-dot"
                        style={{ background: typeColors[entry.type] || "#00e67a" }}
                      />
                      <span className="terminal-header-title">{entry.organization}</span>
                    </div>
                    <span className="terminal-header-badge">{typeLabels[entry.type] ?? entry.type}</span>
                  </div>

                  <div className="terminal-tabs">
                    <button
                      className={`terminal-tab ${expandedId === entry.id ? "active" : ""}`}
                      onClick={() => toggleExpand(entry.id)}
                    >
                      $ {entry.title}
                    </button>
                    <button className="terminal-tab">{entry.period}</button>
                  </div>

                  <div className="terminal-body">
                    <div className="terminal-line-numbers">
                      {lineNumbers.map((n) => (
                        <span key={n}>{n}</span>
                      ))}
                    </div>
                    <div className="terminal-code">
                      {lines.map((line, li) => (
                        <CodeLine key={li} text={line.text} type={line.type} />
                      ))}
                    </div>
                  </div>

                  <div className="terminal-footer">
                    <span className="terminal-footer-label">{entry.location ?? "N/A"}</span>
                    <button
                      className="terminal-copy-btn"
                      onClick={() => handleCopy(entry.description)}
                      title="Copy description"
                    >
                      <CopyIcon />
                      <span>CP</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AnimatedSection>
  )
}
