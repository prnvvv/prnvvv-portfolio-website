import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'

export interface GalleryImage {
  src: string
  alt: string
  isCover?: boolean
}

interface GalleryLayoutProps {
  images: GalleryImage[]
  onImageClick: (index: number) => void
}

/* ─── Tile ─── */
interface TileProps {
  src: string
  alt: string
  index: number
  total: number
  objectFit?: 'cover' | 'contain'
  onClick: () => void
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement>) => void
}

function Tile({ src, alt, index, total, objectFit = 'cover', onClick, onLoad }: TileProps) {
  const fitClass = objectFit === 'contain' ? 'object-contain' : 'object-cover'
  return (
    <motion.div
      className="relative overflow-hidden rounded-lg border border-white/10 hover:border-[#00e67a]/40 transition-all duration-300 cursor-pointer group bg-black/40"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 5) * 0.04, duration: 0.35, ease: 'easeOut' }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Mission intel image ${index + 1} of ${total}`}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick() }}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full ${fitClass} transition-transform duration-500 group-hover:scale-105`}
        loading="lazy"
        decoding="async"
        onLoad={onLoad}
      />
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
        <span className="text-[8px] font-mono text-[#00e67a]/70 bg-black/50 px-1.5 py-0.5 rounded border border-[#00e67a]/20">
          INTEL {String(index + 1).padStart(2, '0')}
        </span>
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00e67a]/0 via-[#00e67a]/5 to-[#00e67a]/0 animate-scanline" />
      </div>
    </motion.div>
  )
}

/* ─── +N Overlay ─── */
interface OverlayTileProps {
  count: number
  src: string
  alt: string
  onClick: () => void
}

function OverlayTile({ count, src, alt, onClick }: OverlayTileProps) {
  return (
    <motion.div
      className="relative overflow-hidden rounded-lg border border-white/10 hover:border-[#00e67a]/40 transition-all duration-300 cursor-pointer group bg-black/40"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.16, duration: 0.35, ease: 'easeOut' }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Show ${count} more images`}
      onKeyDown={(e) => { if (e.key === 'Enter') onClick() }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        decoding="async"
      />
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
        <span className="text-xl md:text-2xl font-mono font-bold text-white/60 group-hover:text-white/90 transition-colors">
          +{count}
        </span>
      </div>
    </motion.div>
  )
}

/* ─── Hero Grid 5 (shared by 5 and 6+ templates) ─── */
interface HeroGridFiveProps {
  images: GalleryImage[]
  onImageClick: (index: number) => void
  overlayCount?: number
}

function HeroGridFive({ images, onImageClick, overlayCount }: HeroGridFiveProps) {
  return (
    <div className="grid grid-cols-[2fr_1fr_1fr] grid-rows-[1fr_1fr] gap-2 h-full">
      <div className="col-span-1 row-span-2">
        <Tile
          src={images[0].src}
          alt={images[0].alt}
          index={0}
          total={5}
          onClick={() => onImageClick(0)}
        />
      </div>
      <div className="col-span-1 row-span-1">
        <Tile
          src={images[1].src}
          alt={images[1].alt}
          index={1}
          total={5}
          onClick={() => onImageClick(1)}
        />
      </div>
      <div className="col-span-1 row-span-1">
        <Tile
          src={images[2].src}
          alt={images[2].alt}
          index={2}
          total={5}
          onClick={() => onImageClick(2)}
        />
      </div>
      <div className="col-span-1 row-span-1">
        <Tile
          src={images[3].src}
          alt={images[3].alt}
          index={3}
          total={5}
          onClick={() => onImageClick(3)}
        />
      </div>
      <div className="col-span-1 row-span-1">
        {overlayCount ? (
          <OverlayTile
            count={overlayCount}
            src={images[4].src}
            alt={images[4].alt}
            onClick={() => onImageClick(4)}
          />
        ) : (
          <Tile
            src={images[4].src}
            alt={images[4].alt}
            index={4}
            total={5}
            onClick={() => onImageClick(4)}
          />
        )}
      </div>
    </div>
  )
}

/* ─── Mobile collapsed layout (hero + 2-col grid) ─── */
function MobileCollapsed({ images, onImageClick }: GalleryLayoutProps) {
  const [hero, ...rest] = images
  return (
    <div className="h-full overflow-y-auto">
      <div className="flex flex-col gap-2">
        <div className="h-48 flex-shrink-0">
          <Tile
            src={hero.src}
            alt={hero.alt}
            index={0}
            total={images.length}
            onClick={() => onImageClick(0)}
          />
        </div>
        {rest.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {rest.map((img, i) => (
              <Tile
                key={i}
                src={img.src}
                alt={img.alt}
                index={i + 1}
                total={images.length}
                onClick={() => onImageClick(i + 1)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Media query hook ─── */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])

  return matches
}

/* ─── Main component ─── */
export function GalleryLayout({ images, onImageClick }: GalleryLayoutProps) {
  const isMobile = useMediaQuery('(max-width: 400px)')
  const [singlePortrait, setSinglePortrait] = useState<boolean | null>(null)
  const [bothPortrait, setBothPortrait] = useState(false)
  const ratios = useRef<number[]>([])
  const initialRender = useRef(true)

  if (images.length === 0) return null

  const handleLoad = useCallback((idx: number) => (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget
    const ratio = naturalWidth / naturalHeight
    ratios.current[idx] = ratio

    if (images.length === 1 && initialRender.current) {
      initialRender.current = false
      setSinglePortrait(ratio < 1)
    }

    if (images.length === 2) {
      if (ratios.current[0] !== undefined && ratios.current[1] !== undefined) {
        setBothPortrait(ratios.current[0] < 1 && ratios.current[1] < 1)
      }
    }
  }, [images.length])

  const count = images.length

  if (isMobile && count >= 3) {
    return <MobileCollapsed images={images} onImageClick={onImageClick} />
  }

  switch (count) {
    case 0:
      return null
    case 1: {
      const isPortrait = singlePortrait === true
      return (
        <div className={`h-full w-full ${isPortrait ? 'bg-black/20 rounded-lg' : ''}`}>
          <Tile
            src={images[0].src}
            alt={images[0].alt}
            index={0}
            total={1}
            objectFit={isPortrait ? 'contain' : 'cover'}
            onClick={() => onImageClick(0)}
            onLoad={handleLoad(0)}
          />
        </div>
      )
    }
    case 2:
      return (
        <div className={`grid gap-2 h-full ${bothPortrait ? 'grid-rows-2' : 'grid-cols-2'}`}>
          {images.map((img, i) => (
            <Tile
              key={i}
              src={img.src}
              alt={img.alt}
              index={i}
              total={2}
              onClick={() => onImageClick(i)}
              onLoad={handleLoad(i)}
            />
          ))}
        </div>
      )
    case 3:
      return (
        <div className="grid grid-cols-[2fr_1fr] grid-rows-[1fr_1fr] gap-2 h-full">
          <div className="col-span-1 row-span-2">
            <Tile
              src={images[0].src}
              alt={images[0].alt}
              index={0}
              total={3}
              onClick={() => onImageClick(0)}
            />
          </div>
          {[1, 2].map(i => (
            <div key={i} className="col-span-1 row-span-1">
              <Tile
                src={images[i].src}
                alt={images[i].alt}
                index={i}
                total={3}
                onClick={() => onImageClick(i)}
              />
            </div>
          ))}
        </div>
      )
    case 4:
      return (
        <div className="grid grid-cols-2 grid-rows-[1fr_1fr] gap-2 h-full">
          {images.map((img, i) => (
            <Tile
              key={i}
              src={img.src}
              alt={img.alt}
              index={i}
              total={4}
              onClick={() => onImageClick(i)}
            />
          ))}
        </div>
      )
    case 5:
      return <HeroGridFive images={images} onImageClick={onImageClick} />
    default: // 6+
      return (
        <HeroGridFive
          images={images.slice(0, 5)}
          onImageClick={onImageClick}
          overlayCount={images.length - 5}
        />
      )
  }
}
