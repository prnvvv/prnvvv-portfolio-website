import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react'
import './LogoLoop.css'

interface LogoItem {
  node: React.ReactNode
  title: string
  href?: string
}

interface LogoLoopProps {
  logos: LogoItem[]
  speed?: number
  direction?: 'left' | 'right'
  logoHeight?: number
  gap?: number
  fadeOut?: boolean
  fadeOutColor?: string
  scaleOnHover?: boolean
  pauseOnHover?: boolean
  hoverSpeed?: number
  className?: string
  ariaLabel?: string
}

const MIN_COPIES = 2
const COPY_HEADROOM = 2
const SMOOTH_TAU = 0.25

export default memo(function LogoLoop({
  logos,
  speed = 100,
  direction = 'left',
  logoHeight = 45,
  gap = 55,
  fadeOut = true,
  fadeOutColor,
  scaleOnHover = false,
  pauseOnHover = false,
  hoverSpeed,
  className = '',
  ariaLabel = 'Technology logos',
}: LogoLoopProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const seqRef = useRef<HTMLUListElement>(null)

  const isHovered = useRef(false)
  const offsetRef = useRef(0)
  const lastTimestampRef = useRef<number | null>(null)
  const velocityRef = useRef(0)
  const rafRef = useRef<number | null>(null)

  const directionMultiplier = direction === 'left' ? 1 : -1
  const targetVelocity = speed * directionMultiplier

  const effectiveHoverSpeed = hoverSpeed ?? (pauseOnHover ? 0 : undefined)

  const [seqWidth, setSeqWidth] = useState(0)
  const [copyCount, setCopyCount] = useState(MIN_COPIES)

  const updateDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth ?? 0
    const seqElement = seqRef.current
    if (!seqElement) return

    const sequenceWidth = seqElement.getBoundingClientRect().width
    if (sequenceWidth > 0) {
      setSeqWidth(Math.ceil(sequenceWidth))
      setCopyCount(Math.max(MIN_COPIES, Math.ceil(containerWidth / sequenceWidth) + COPY_HEADROOM))
    }
  }, [])

  useEffect(() => {
    updateDimensions()
    const container = containerRef.current
    const seq = seqRef.current

    if (window.ResizeObserver && container && seq) {
      const ro = new ResizeObserver(updateDimensions)
      ro.observe(container)
      ro.observe(seq)
      return () => ro.disconnect()
    }

    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [updateDimensions])

  useEffect(() => {
    const images = seqRef.current?.querySelectorAll('img') ?? []
    if (images.length === 0) return

    let loaded = 0
    const onLoad = () => {
      loaded++
      if (loaded >= images.length) updateDimensions()
    }
    images.forEach((img) => {
      const htmlImg = img as HTMLImageElement
      if (htmlImg.complete) onLoad()
      else {
        htmlImg.addEventListener('load', onLoad, { once: true })
        htmlImg.addEventListener('error', onLoad, { once: true })
      }
    })

    return () => {
      images.forEach((img) => {
        img.removeEventListener('load', onLoad)
        img.removeEventListener('error', onLoad)
      })
    }
  }, [logos, updateDimensions])

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    if (seqWidth > 0) {
      offsetRef.current = ((offsetRef.current % seqWidth) + seqWidth) % seqWidth
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`
    }

    const animate = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp
      }

      const deltaTime = Math.max(0, timestamp - lastTimestampRef.current) / 1000
      lastTimestampRef.current = timestamp

      const target =
        isHovered.current && effectiveHoverSpeed !== undefined
          ? effectiveHoverSpeed
          : targetVelocity
      const easingFactor = 1 - Math.exp(-deltaTime / SMOOTH_TAU)
      velocityRef.current += (target - velocityRef.current) * easingFactor

      if (seqWidth > 0) {
        let nextOffset = offsetRef.current + velocityRef.current * deltaTime
        nextOffset = ((nextOffset % seqWidth) + seqWidth) % seqWidth
        offsetRef.current = nextOffset
        track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`
      }

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      lastTimestampRef.current = null
    }
  }, [targetVelocity, seqWidth, effectiveHoverSpeed])

  const rootClassName = [
    'logoloop',
    'logoloop--horizontal',
    fadeOut && 'logoloop--fade',
    scaleOnHover && 'logoloop--scale-hover',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const renderItem = useCallback(
    (item: LogoItem, key: string) => {
      const content = (
        <span className="logoloop__node" title={item.title}>
          {item.node}
        </span>
      )
      const itemContent = item.href ? (
        <a
          className="logoloop__link"
          href={item.href}
          aria-label={item.title}
          target="_blank"
          rel="noreferrer noopener"
        >
          {content}
        </a>
      ) : (
        content
      )
      return (
        <li className="logoloop__item" key={key}>
          {itemContent}
        </li>
      )
    },
    [],
  )

  const lists = useMemo(
    () =>
      Array.from({ length: copyCount }, (_, copyIdx) => (
        <ul
          className="logoloop__list"
          key={`copy-${copyIdx}`}
          aria-hidden={copyIdx > 0}
          ref={copyIdx === 0 ? seqRef : undefined}
        >
          {logos.map((item, itemIdx) => renderItem(item, `${copyIdx}-${itemIdx}`))}
        </ul>
      )),
    [copyCount, logos, renderItem],
  )

  const containerVars = useMemo(
    () =>
      ({
        '--logoloop-gap': `${gap}px`,
        '--logoloop-logoHeight': `${logoHeight}px`,
        ...(fadeOutColor ? { '--logoloop-fadeColor': fadeOutColor } : {}),
      }) as React.CSSProperties,
    [gap, logoHeight, fadeOutColor],
  )

  return (
    <div
      ref={containerRef}
      className={rootClassName}
      style={{ width: '100%', ...containerVars }}
      role="region"
      aria-label={ariaLabel}
    >
      <div
        className="logoloop__track"
        ref={trackRef}
        onMouseEnter={() => {
          if (effectiveHoverSpeed !== undefined) isHovered.current = true
        }}
        onMouseLeave={() => {
          if (effectiveHoverSpeed !== undefined) isHovered.current = false
        }}
      >
        {lists}
      </div>
    </div>
  )
})
