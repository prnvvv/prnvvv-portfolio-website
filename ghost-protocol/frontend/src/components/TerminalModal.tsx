import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { FaGithub, FaLinkedin, FaYoutube } from 'react-icons/fa'
import type { Project } from '../data/projects'
import { GalleryLayout } from './gallery/GalleryLayout'
import type { GalleryImage } from './gallery/GalleryLayout'
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
  const lightboxRef = useRef<HTMLDivElement>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const images = project?.images || []

  const galleryImages: GalleryImage[] = useMemo(() =>
    images.map((src, i) => ({
      src,
      alt: `${project?.id || ''} intel ${String(i + 1).padStart(2, '0')}`,
    })),
    [images, project?.id]
  )

  const openLightbox = useCallback((index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
  }, [])

  const touchStartX = useRef(0)

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false)
  }, [])

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + images.length) % images.length)
  }, [images.length])

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % images.length)
  }, [images.length])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 60) {
      diff > 0 ? goToNext() : goToPrevious()
    }
  }, [goToNext, goToPrevious])

  useEffect(() => {
    if (!lightboxOpen) return
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape': closeLightbox(); break
        case 'ArrowLeft': goToPrevious(); break
        case 'ArrowRight': goToNext(); break
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [lightboxOpen, closeLightbox, goToPrevious, goToNext])

  useEffect(() => {
    if (lightboxOpen && lightboxRef.current) {
      lightboxRef.current.focus()
    }
  }, [lightboxOpen])

  useEffect(() => {
    if (!lightboxOpen || images.length < 2) return
    const prev = (currentIndex - 1 + images.length) % images.length
    const next = (currentIndex + 1) % images.length
    ;[images[prev], images[next]].forEach(src => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
      setTimeout(() => link.remove(), 2000)
    })
  }, [lightboxOpen, currentIndex, images])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !lightboxOpen) onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, lightboxOpen, onClose])

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose()
  }

  if (!project) return null

  const statusColor = STATUS_COLORS[project.status] || '#00e67a'

  return (
    <>
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
              className="terminal-modal bg-[#0d0d14] border border-[#00e67a]/20 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative"
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Terminal Header */}
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
              <div className="p-4 flex-1 font-mono relative z-10 min-h-0 flex flex-col">
                {/* Terminal Prompt */}
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
                        <FaGithub size={13} /> GitHub
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded text-white/50 hover:text-[#00e67a] hover:border-[#00e67a]/30 transition-all duration-200 text-[10px]"
                      >
                        <FaYoutube size={13} /> Demo
                      </a>
                    )}
                    {project.patentUrl && (
                      <a
                        href={project.patentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded text-white/50 hover:text-[#00e67a] hover:border-[#00e67a]/30 transition-all duration-200 text-[10px]"
                      >
                        <FileText size={13} /> Patent
                      </a>
                    )}
                    {project.linkedinPosts?.[0] && (
                      <a
                        href={project.linkedinPosts[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 border border-white/10 rounded text-white/50 hover:text-[#00e67a] hover:border-[#00e67a]/30 transition-all duration-200 text-[10px]"
                      >
                        <FaLinkedin size={13} /> LinkedIn
                      </a>
                    )}
                  </div>
                </div>

                <div className="border-t border-[#00e67a]/10 my-2" />

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0 grid-rows-[1fr]">
                  {/* Left Column */}
                  <div className="space-y-2 overflow-y-auto">
                    <div className="text-white font-bold text-base md:text-lg tracking-wide">
                      {project.title}
                    </div>
                    <div className="text-white/60 text-xs md:text-sm leading-relaxed">
                      {project.fullDescription}
                    </div>
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
                    {(project.award || project.achievements) && (
                      <div className="max-w-full overflow-hidden">
                        <span className="text-white/30 text-xs">ACHIEVEMENTS:</span>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {(project.achievements || (project.award ? [project.award] : [])).map((ach) => (
                            <span
                              key={ach}
                              className="text-[10px] text-[#00e67a] bg-[#00e67a]/10 px-2 py-0.5 rounded border border-[#00e67a]/20 whitespace-nowrap mr-1"
                            >
                              {ach}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
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

                  {/* Right Column — Intelligence Gallery */}
                  {galleryImages.length > 0 && (
                    <div className="h-full flex flex-col">
                      <span className="text-white/30 text-xs mb-1">INTEL SOURCES</span>
                      <div className="flex-1 min-h-0 rounded-lg overflow-hidden border border-white/5 bg-black/20 flex flex-col">
                        <div className="flex-1 min-h-0 p-3">
                          <GalleryLayout images={galleryImages} onImageClick={openLightbox} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Terminal Footer */}
                <div className="border-t border-[#00e67a]/10 mt-3 pt-2 flex justify-between">
                  <div />
                  <span className="text-[10px] font-mono text-white/20 tracking-wider">
                    {project.id} // MISSION DOSSIER
                  </span>
                  <div />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && images.length > 0 && (
          <motion.div
            ref={lightboxRef}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/85 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeLightbox}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Image lightbox viewer"
          >
            <motion.div
              className="relative max-w-[90vw] md:max-w-[85vw] max-h-[80vh] md:max-h-[85vh] flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="absolute top-4 left-4 flex items-center gap-2 z-10 pointer-events-none">
                <span className="text-[10px] font-mono text-[#00e67a] tracking-wider">MISSION INTEL</span>
                <span className="text-[10px] font-mono text-white/20">//</span>
                <span className="text-[10px] font-mono text-white/20">{project.id}</span>
              </div>

              {/* Close */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-10 text-white/30 hover:text-white/80 transition-colors duration-200 cursor-pointer"
                aria-label="Close lightbox"
              >
                <X size={24} />
              </button>

              {/* Previous */}
              {images.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); goToPrevious() }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:border-[#00e67a]/30 flex items-center justify-center text-white/40 hover:text-white/80 transition-all duration-200 hover:scale-105 cursor-pointer"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              {/* Image */}
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentIndex}
                  src={images[currentIndex]}
                  alt={`${project.id} intel ${currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg border border-[#00e67a]/30 shadow-[0_0_60px_rgba(0,230,122,0.05)] select-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  draggable={false}
                />
              </AnimatePresence>

              {/* Next */}
              {images.length > 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); goToNext() }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:border-[#00e67a]/30 flex items-center justify-center text-white/40 hover:text-white/80 transition-all duration-200 hover:scale-105 cursor-pointer"
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              )}

              {/* Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
                <span className="text-xs font-mono text-white/40">
                  {currentIndex + 1} / {images.length}
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}


