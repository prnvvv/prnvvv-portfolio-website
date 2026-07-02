import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText } from 'lucide-react'
import { FaGithub, FaLinkedin, FaYoutube } from 'react-icons/fa'
import type { Project } from '../data/projects'
import './TerminalModal.css'

interface TerminalModalProps {
  isOpen: boolean
  onClose: () => void
  project: Project | null
}

const STATUS_COLORS: Record<string, string> = {
  'PATENT PUBLISHED': '#00e67a',
  'PATENT FILED': '#f59e0b',
  'UNDER REVIEW': '#60a5fa',
  'DEPLOYED': '#00e67a',
  'PUBLISHED': '#00e67a',
  'COMPLETED': '#00e67a',
  'ACTIVE': '#60a5fa',
}

export const TerminalModal = ({ isOpen, onClose, project }: TerminalModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!project) return null

  const statusColor = STATUS_COLORS[project.status] || '#00e67a'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="terminal-modal-backdrop fixed inset-0 z-[1000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackdropClick}
          style={{
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <motion.div
            ref={modalRef}
            className="terminal-modal bg-[#0d0d14] border border-[#00e67a]/20 rounded-lg w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Terminal Header — Linux Terminal Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1a1a] border-b border-[#00e67a]/10 rounded-t-lg flex-shrink-0 relative z-10">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="ml-3 text-[10px] font-mono text-white/20 tracking-wider">
                  {project.id} — TERMINAL
                </span>
              </div>
              <button
                onClick={onClose}
                className="text-white/20 hover:text-white/60 transition-colors duration-200 font-mono text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Terminal Body */}
            <div className="p-4 flex-1 font-mono relative z-10">
              {/* Terminal Prompt + Action Buttons */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-1 text-sm flex-wrap min-w-0">
                  <span className="text-[#00e67a]">user</span>
                  <span className="text-white/30">@</span>
                  <span className="text-[#3d9df6]">ghost-protocol</span>
                  <span className="text-white/30">:</span>
                  <span className="text-[#3d9df6]">~/missions</span>
                  <span className="text-white/30">$</span>
                  <span className="text-white/60 ml-2">cat project-info</span>
                  <span className="text-white/20 animate-pulse ml-1">▊</span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded text-white/50 hover:text-[#00e67a] hover:border-[#00e67a]/30 transition-all duration-200 text-[10px]"
                    >
                      <FaGithub size={12} /> GitHub
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded text-white/50 hover:text-[#00e67a] hover:border-[#00e67a]/30 transition-all duration-200 text-[10px]"
                    >
                      <FaYoutube size={12} /> Demo
                    </a>
                  )}
                  {project.patentUrl && (
                    <a
                      href={project.patentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded text-white/50 hover:text-[#00e67a] hover:border-[#00e67a]/30 transition-all duration-200 text-[10px]"
                    >
                      <FaLinkedin size={12} /> Patent
                    </a>
                  )}
                  {project.linkedinPosts?.[0] && (
                    <a
                      href={project.linkedinPosts[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded text-white/50 hover:text-[#00e67a] hover:border-[#00e67a]/30 transition-all duration-200 text-[10px]"
                    >
                      <FaLinkedin size={12} /> LinkedIn
                    </a>
                  )}
                </div>
              </div>

              <div className="border-t border-[#00e67a]/10 my-2" />

              {/* Main Content — 2-Column Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column — Project Details */}
                <div className="space-y-2">
                  {/* Title */}
                  <div className="text-white font-bold text-base md:text-lg tracking-wide">
                    {project.title}
                  </div>

                  {/* Description */}
                  <div className="text-white/60 text-xs md:text-sm leading-relaxed">
                    {project.fullDescription}
                  </div>

                  {/* Status + Year */}
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-white/30 text-xs">STATUS:</span>
                    <span className="text-xs font-bold" style={{ color: statusColor }}>
                      {project.status}
                    </span>
                    {project.year && (
                      <>
                        <span className="text-white/20">|</span>
                        <span className="text-white/30 text-xs">{project.year}</span>
                      </>
                    )}
                  </div>

                  {/* Technologies */}
                  <div>
                    <span className="text-white/30 text-xs">TECHNOLOGIES:</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-2.5 py-1 text-[10px] bg-white/5 border border-white/10 rounded text-white/60"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Award / Achievements */}
                  {(project.award || project.achievements) && (
                    <div>
                      <span className="text-white/30 text-xs">ACHIEVEMENTS:</span>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        {(project.achievements || (project.award ? [project.award] : [])).map((ach) => (
                          <span
                            key={ach}
                            className="text-[10px] text-[#00e67a] bg-[#00e67a]/10 px-2 py-0.5 rounded border border-[#00e67a]/20"
                          >
                            {ach}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Paper Link (not in header) */}
                  {project.paperUrl && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href={project.paperUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded text-white/50 hover:text-[#00e67a] hover:border-[#00e67a]/30 transition-all duration-200 text-[10px]"
                      >
                        <FileText size={13} /> Paper
                      </a>
                    </div>
                  )}


                </div>

                {/* Right Column — Intel Sources (reserved for images) */}
                <div className="space-y-2">
                  <span className="text-white/30 text-xs">INTEL SOURCES</span>
                  {project.collaborators ? (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-[#00e67a]/20 transition-all duration-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#00e67a]/15 flex items-center justify-center flex-shrink-0 text-[#00e67a] font-bold text-sm font-sans">
                          {project.title.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white/80 text-sm font-sans">Collaboration</div>
                          <div className="text-white/30 text-xs font-mono">{project.collaborators}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-white/20 text-sm text-center py-4 font-mono">
                      No intel sources available
                    </div>
                  )}
                </div>
              </div>

              {/* Terminal Footer */}
              <div className="border-t border-[#00e67a]/10 mt-3 pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[#00e67a] text-xs">READY</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00e67a] animate-pulse" />
                </div>
                <div className="text-[10px] font-mono text-white/20 tracking-wider">
                  {project.id} // MISSION DOSSIER
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-white/20">SYSTEM ONLINE</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
