import { useRef, useEffect, type RefObject } from 'react'
import createGlobe, { type Marker } from 'cobe'

const TECH_HUB_MARKERS: Marker[] = [
  { location: [37.7749, -122.4194], size: 0.04 },
  { location: [40.7128, -74.006], size: 0.04 },
  { location: [51.5074, -0.1278], size: 0.04 },
  { location: [52.52, 13.405], size: 0.04 },
  { location: [12.9716, 77.5946], size: 0.04 },
  { location: [1.3521, 103.8198], size: 0.04 },
  { location: [35.6762, 139.6503], size: 0.04 },
  { location: [37.5665, 126.978], size: 0.04 },
  { location: [13.0827, 80.2707], size: 0.04 },
]

const ROTATION_SPEED = 0.002

interface CobeGlobeProps {
  reduced: boolean
  interactive: boolean
  containerRef: RefObject<HTMLDivElement | null>
}

export default function CobeGlobe({ reduced, interactive, containerRef }: CobeGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null)

  const mouseRef = useRef({ x: 0, y: 0, active: false })
  const rotRef = useRef({ phi: 0, theta: 0.25, targetPhi: 0, targetTheta: 0.25 })

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr = Math.min(window.devicePixelRatio, 2)

    canvas.width = container.clientWidth * dpr
    canvas.height = container.clientHeight * dpr
    canvas.style.width = `${container.clientWidth}px`
    canvas.style.height = `${container.clientHeight}px`

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: canvas.width,
      height: canvas.height,
      phi: 0,
      theta: 0.25,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 30000,
      mapBrightness: 8,
      mapBaseBrightness: 0.1,
      baseColor: [0.02, 0.10, 0.06],
      markerColor: [0.0, 0.95, 0.45],
      glowColor: [0.0, 0.65, 0.35],
      markers: TECH_HUB_MARKERS,
      onRender: (state) => {
        const rot = rotRef.current
        const mouse = mouseRef.current

        if (interactive && mouse.active) {
          rot.targetPhi = mouse.x * 0.5
          rot.targetTheta = 0.25 + mouse.y * 0.3
        } else {
          rot.targetPhi = 0
          rot.targetTheta = 0.25
        }

        rot.phi += (rot.targetPhi - rot.phi) * 0.045
        rot.theta += (rot.targetTheta - rot.theta) * 0.045

        if (!mouse.active) {
          rot.phi += ROTATION_SPEED
        }

        state.phi = rot.phi
        state.theta = rot.theta
      },
    })

    globeRef.current = globe

    return () => {
      globe.destroy()
      globeRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handlePointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / (rect.width / 2)
      const dy = (e.clientY - cy) / (rect.height / 2)
      mouseRef.current = {
        x: Math.max(-1, Math.min(1, dx)),
        y: Math.max(-1, Math.min(1, dy)),
        active: true,
      }
    }

    const handlePointerLeave = () => {
      mouseRef.current = { x: 0, y: 0, active: false }
    }

    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [containerRef])

  return (
    <canvas
      ref={canvasRef}
      className="globe-canvas"
      role="img"
      aria-label="Holographic Earth globe showing global AI intelligence network"
    />
  )
}
