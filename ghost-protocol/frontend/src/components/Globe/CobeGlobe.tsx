import { useRef, useEffect, type RefObject } from 'react'
import createGlobe from 'cobe'

const ROTATION_SPEED = 0.0035

interface CobeGlobeProps {
  reduced: boolean
  interactive: boolean
  containerRef: RefObject<HTMLDivElement | null>
}

export default function CobeGlobe({ reduced, interactive, containerRef }: CobeGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const globeRef = useRef<ReturnType<typeof createGlobe> | null>(null)
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768

  const mouseRef = useRef({ x: 0, y: 0, active: false })
  const rotRef = useRef({
    phi: 0,
    theta: 0.25,
    phiOffset: 0,
    thetaVelocity: 0,
    phiOffsetVelocity: 0,
  })

  const dragRef = useRef({ active: false, lastX: 0, lastY: 0, velPhi: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr = Math.min(window.devicePixelRatio, isMobile ? 1 : 2)

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
      dark: 0.88,
      diffuse: isMobile ? 0.4 : 0.8,
      mapSamples: isMobile ? 16000 : 60000,
      mapBrightness: 14,
      mapBaseBrightness: 0,
      baseColor: [0.03, 0.12, 0.07],
      markerColor: [0, 0, 0],
      glowColor: [0.0, 0.88, 0.48],
      markers: [],
      onRender: (state) => {
        const rot = rotRef.current
        const mouse = mouseRef.current
        const drag = dragRef.current

        // Click-and-drag: the globe follows the pointer; auto-rotation and hover easing pause.
        if (drag.active) {
          rot.thetaVelocity = 0
          state.phi = rot.phi + rot.phiOffset
          state.theta = rot.theta
          return
        }
        if (Math.abs(drag.velPhi) > 0.00005) {
          rot.phi += drag.velPhi // release inertia
          drag.velPhi *= 0.95
        } else {
          drag.velPhi = 0
        }
        const isInteracting = interactive && !isMobile && mouse.active

        rot.phi += ROTATION_SPEED

        if (isInteracting) {
          rot.thetaVelocity += ((0.25 + mouse.y * 0.18) - rot.theta) * 0.04
          rot.thetaVelocity *= 0.93
          rot.theta += rot.thetaVelocity

          rot.phiOffsetVelocity += ((mouse.x * 0.25) - rot.phiOffset) * 0.025
          rot.phiOffsetVelocity *= 0.95
          rot.phiOffset += rot.phiOffsetVelocity
        } else {
          rot.thetaVelocity += (0.25 - rot.theta) * 0.10
          rot.thetaVelocity *= 0.88
          rot.theta += rot.thetaVelocity

          rot.phiOffsetVelocity += (0 - rot.phiOffset) * 0.08
          rot.phiOffsetVelocity *= 0.90
          rot.phiOffset += rot.phiOffsetVelocity
        }

        state.phi = rot.phi + rot.phiOffset
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

  // Drag to rotate (mouse, pen and touch)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const drag = dragRef.current
    const SENSITIVITY = 0.006 // radians per pixel

    const onDown = (e: PointerEvent) => {
      drag.active = true
      drag.lastX = e.clientX
      drag.lastY = e.clientY
      drag.velPhi = 0
      canvas.setPointerCapture(e.pointerId)
      canvas.style.cursor = 'grabbing'
    }
    const onMove = (e: PointerEvent) => {
      if (!drag.active) return
      const dx = e.clientX - drag.lastX
      const dy = e.clientY - drag.lastY
      drag.lastX = e.clientX
      drag.lastY = e.clientY
      const rot = rotRef.current
      rot.phi += dx * SENSITIVITY
      rot.theta = Math.max(-0.9, Math.min(1.2, rot.theta + dy * SENSITIVITY))
      drag.velPhi = dx * SENSITIVITY
    }
    const onUp = (e: PointerEvent) => {
      if (!drag.active) return
      drag.active = false
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId)
      canvas.style.cursor = 'grab'
    }

    canvas.style.cursor = 'grab'
    canvas.style.touchAction = 'pan-y'
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointercancel', onUp)
    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointercancel', onUp)
    }
  }, [])

  useEffect(() => {
    if (isMobile) return
    const container = containerRef.current
    if (!container) return

    let leaveTimeout: ReturnType<typeof setTimeout> | null = null

    const handlePointerEnter = () => {
      if (leaveTimeout) {
        clearTimeout(leaveTimeout)
        leaveTimeout = null
      }
      mouseRef.current = { ...mouseRef.current, active: true }
    }

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
      leaveTimeout = setTimeout(() => {
        mouseRef.current = { x: 0, y: 0, active: false }
      }, 50)
    }

    container.addEventListener('pointerenter', handlePointerEnter)
    container.addEventListener('pointermove', handlePointerMove)
    container.addEventListener('pointerleave', handlePointerLeave)

    return () => {
      if (leaveTimeout) clearTimeout(leaveTimeout)
      container.removeEventListener('pointerenter', handlePointerEnter)
      container.removeEventListener('pointermove', handlePointerMove)
      container.removeEventListener('pointerleave', handlePointerLeave)
    }
  }, [containerRef, isMobile])

  return (
    <canvas
      ref={canvasRef}
      className="globe-canvas"
      role="img"
      aria-label="Interactive 3D globe showing global presence"
    />
  )
}
