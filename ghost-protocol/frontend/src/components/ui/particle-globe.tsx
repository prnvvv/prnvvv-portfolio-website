"use client"

import { useEffect, useRef } from "react"
import { createMap } from "svg-dotted-map"

import { cn } from "@/lib/utils"
import { useThemeStore, type Theme } from "@/store/themeStore"

/**
 * Globe rendered as an opaque dark sphere with continents made of very fine, dense particles
 * (so it reads like a solid globe, not a dot cloud) that still behave like individual particles:
 *  - Auto-rotates slowly and can be click/touch-dragged, with inertia.
 *  - Hovering shatters the particles under the cursor; they spring back when it leaves.
 *  - Colours follow the active theme: Commander (green) and Noir (grayscale).
 */

// Original reference: 0.5°/frame at 60fps = 30°/s. Reduced by 30%, then by a further 30%.
const AUTO_ROTATE_DEG_PER_SEC = 30 * 0.7 * 0.7
const BASE_TILT = 0.3 // radians, resting camera tilt
const MAX_TILT = 1.1
const SPHERE_POINTS = 70000 // uniform samples over the sphere; ~21% fall on land
const HOVER_RADIUS = 0.2 // fraction of globe radius (screen space)
const SPRING = 0.045
const DAMPING = 0.86

interface Palette {
  land: string
  hot: string
  body: string // opaque ocean / globe body
  rim: string
}

const PALETTES: Record<Theme, Palette> = {
  commander: { land: "#00e67a", hot: "#b8ffdb", body: "#030a06", rim: "rgba(0, 230, 122, 0.22)" },
  noir: { land: "#ffffff", hot: "#ffffff", body: "#000000", rim: "rgba(255, 255, 255, 0.2)" },
}

interface Particles {
  n: number
  base: Float32Array // x,y,z unit vectors
  off: Float32Array // displacement from base
  vel: Float32Array // displacement velocity
}

/** Land mask from the bundled svg-dotted-map data, resampled onto a uniform sphere. */
function buildParticles(): Particles {
  const W = 360
  const H = 180
  const { points } = createMap({ width: W, height: H, mapSamples: 40000 })
  const landCells = new Set<number>()
  for (const p of points) landCells.add(Math.min(H - 1, Math.floor(p.y)) * W + Math.min(W - 1, Math.floor(p.x)))

  const golden = Math.PI * (3 - Math.sqrt(5))
  const xs: number[] = []

  for (let i = 0; i < SPHERE_POINTS; i++) {
    const y = 1 - (2 * (i + 0.5)) / SPHERE_POINTS
    const r = Math.sqrt(1 - y * y)
    const theta = golden * i
    const x = Math.cos(theta) * r
    const z = Math.sin(theta) * r
    const lat = (Math.asin(y) * 180) / Math.PI
    const lng = (Math.atan2(x, z) * 180) / Math.PI
    const cx = Math.min(W - 1, Math.max(0, Math.floor(((lng + 180) / 360) * W)))
    const cy = Math.min(H - 1, Math.max(0, Math.floor(((90 - lat) / 180) * H)))
    if (landCells.has(cy * W + cx)) xs.push(x, y, z)
  }

  const n = xs.length / 3
  return { n, base: Float32Array.from(xs), off: new Float32Array(n * 3), vel: new Float32Array(n * 3) }
}

interface ParticleGlobeProps {
  className?: string
  /** Disable auto-rotation and the shatter effect (prefers-reduced-motion). */
  reduced?: boolean
}

export default function ParticleGlobe({ className, reduced = false }: ParticleGlobeProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const paletteRef = useRef<Palette>(PALETTES[useThemeStore.getState().theme])

  // Theme -> palette (no re-init of the simulation)
  useEffect(() => {
    paletteRef.current = PALETTES[useThemeStore.getState().theme]
    return useThemeStore.subscribe((s) => {
      paletteRef.current = PALETTES[s.theme]
    })
  }, [])

  useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!wrap || !canvas || !ctx) return

    const isMobile = window.innerWidth <= 768
    const { n, base, off, vel } = buildParticles()

    let cssSize = 0
    let dpr = 1
    let cx = 0
    let radius = 0

    const resize = () => {
      const rect = wrap.getBoundingClientRect()
      cssSize = Math.max(1, Math.floor(Math.min(rect.width, rect.height || rect.width)))
      dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2)
      canvas.width = cssSize * dpr
      canvas.height = cssSize * dpr
      canvas.style.width = `${cssSize}px`
      canvas.style.height = `${cssSize}px`
      cx = cssSize / 2
      radius = cssSize * 0.42 // leaves room for displaced particles
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    // View state
    let yaw = 0
    let pitch = BASE_TILT
    let yawVel = 0 // rad/s, from drag inertia
    let pitchVel = 0
    let dragging = false
    let lastX = 0
    let lastY = 0
    let lastMoveT = 0
    // Cursor in canvas CSS pixels (far away when outside)
    let mx = -1e4
    let my = -1e4
    let hovering = false
    let mvx = 0 // cursor speed, scales the blast
    let mvy = 0

    const onPointerDown = (e: PointerEvent) => {
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      lastMoveT = performance.now()
      yawVel = 0
      pitchVel = 0
      canvas.setPointerCapture(e.pointerId)
      canvas.style.cursor = "grabbing"
    }
    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      const nx = e.clientX - rect.left
      const ny = e.clientY - rect.top
      mvx = nx - mx
      mvy = ny - my
      mx = nx
      my = ny
      hovering = true
      if (dragging) {
        const dx = e.clientX - lastX
        const dy = e.clientY - lastY
        const now = performance.now()
        const dt = Math.max(1, now - lastMoveT) / 1000
        const k = Math.PI / (radius * 1.15) // px -> radians, ~1:1 with the globe surface
        yaw += dx * k
        pitch = Math.max(-MAX_TILT, Math.min(MAX_TILT, pitch + dy * k))
        yawVel = (dx * k) / dt
        pitchVel = (dy * k) / dt
        lastX = e.clientX
        lastY = e.clientY
        lastMoveT = now
      }
    }
    const endDrag = (e: PointerEvent) => {
      if (!dragging) return
      dragging = false
      if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId)
      canvas.style.cursor = "grab"
      if (performance.now() - lastMoveT > 90) {
        yawVel = 0
        pitchVel = 0
      }
    }
    const onPointerLeave = () => {
      if (dragging) return
      hovering = false
      mx = my = -1e4
    }
    canvas.addEventListener("pointerdown", onPointerDown)
    canvas.addEventListener("pointermove", onPointerMove)
    canvas.addEventListener("pointerup", endDrag)
    canvas.addEventListener("pointercancel", endDrag)
    canvas.addEventListener("pointerleave", onPointerLeave)
    canvas.style.cursor = "grab"

    // Visibility gating
    let visible = true
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
    })
    io.observe(wrap)

    let raf = 0
    let prev = performance.now()
    const TAU = Math.PI * 2

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible || document.hidden) {
        prev = now
        return
      }
      const dt = Math.min(0.05, (now - prev) / 1000)
      prev = now

      // --- rotation: auto-rotate + inertia + tilt easing
      if (!dragging) {
        if (!reduced) yaw += (AUTO_ROTATE_DEG_PER_SEC * Math.PI) / 180 * dt
        yaw += yawVel * dt
        pitch += pitchVel * dt
        const decay = Math.pow(0.04, dt) // inertia fades in ~1s
        yawVel *= decay
        pitchVel *= decay
        pitch += (BASE_TILT - pitch) * Math.min(1, dt * 1.6)
        pitch = Math.max(-MAX_TILT, Math.min(MAX_TILT, pitch))
      }
      yaw %= TAU

      const cyaw = Math.cos(yaw)
      const syaw = Math.sin(yaw)
      const cp = Math.cos(pitch)
      const sp = Math.sin(pitch)

      const pal = paletteRef.current
      const hoverR = radius * HOVER_RADIUS
      const hoverR2 = hoverR * hoverR
      const blast = reduced ? 0 : Math.min(1.8, 0.7 + Math.hypot(mvx, mvy) * 0.04)
      const damp = Math.pow(DAMPING, dt * 60)
      const step = dt * 60
      mvx *= 0.8
      mvy *= 0.8

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, cssSize, cssSize)

      // Opaque globe body (the "ocean") + a faint limb
      ctx.globalAlpha = 1
      ctx.fillStyle = pal.body
      ctx.beginPath()
      ctx.arc(cx, cx, radius, 0, TAU)
      ctx.fill()
      ctx.strokeStyle = pal.rim
      ctx.lineWidth = 1
      ctx.stroke()

      // Fine particles: dense enough to merge into continents
      const size = Math.max(1.3, radius / 105)
      let lastHot = -1

      for (let i = 0; i < n; i++) {
        const i3 = i * 3
        let ox = off[i3]
        let oy = off[i3 + 1]
        let oz = off[i3 + 2]
        const settled = ox * ox + oy * oy + oz * oz < 1e-8

        // model-space position (base + displacement)
        const px = base[i3] + ox
        const py = base[i3 + 1] + oy
        const pz = base[i3 + 2] + oz

        // yaw (around Y) then pitch (around X)
        const x1 = px * cyaw + pz * syaw
        const z1 = -px * syaw + pz * cyaw
        const y2 = py * cp - z1 * sp
        const z2 = py * sp + z1 * cp

        const sx = cx + x1 * radius
        const sy = cx - y2 * radius

        // hover: shatter particles under the cursor
        if (hovering && blast > 0 && z2 > -0.1) {
          const dx = sx - mx
          const dy = sy - my
          const d2 = dx * dx + dy * dy
          if (d2 < hoverR2) {
            const d = Math.sqrt(d2) + 0.001
            const f = (1 - d / hoverR) * blast * 0.09
            // screen-space push, back-projected into model space (inverse of the view rotation)
            const vx2 = (dx / d) * f
            const vy2 = (-dy / d) * f
            const vz2 = f * 0.9 // outward along the view axis => particles pop off the surface
            const vy1 = vy2 * cp + vz2 * sp
            const vz1 = -vy2 * sp + vz2 * cp
            vel[i3] += vx2 * cyaw - vz1 * syaw
            vel[i3 + 1] += vy1
            vel[i3 + 2] += vx2 * syaw + vz1 * cyaw
          }
        }

        // spring back to rest (skipped entirely for particles at rest and not being hit)
        if (!settled || vel[i3] !== 0 || vel[i3 + 1] !== 0 || vel[i3 + 2] !== 0) {
          vel[i3] = (vel[i3] - ox * SPRING) * damp
          vel[i3 + 1] = (vel[i3 + 1] - oy * SPRING) * damp
          vel[i3 + 2] = (vel[i3 + 2] - oz * SPRING) * damp
          ox += vel[i3] * step
          oy += vel[i3 + 1] * step
          oz += vel[i3 + 2] * step
          if (ox * ox + oy * oy + oz * oz < 1e-9 && vel[i3] * vel[i3] + vel[i3 + 1] * vel[i3 + 1] + vel[i3 + 2] * vel[i3 + 2] < 1e-10) {
            ox = oy = oz = 0
            vel[i3] = vel[i3 + 1] = vel[i3 + 2] = 0
          }
          off[i3] = ox
          off[i3 + 1] = oy
          off[i3 + 2] = oz
        }

        if (z2 < 0) continue // hidden behind the opaque body

        const disp = Math.abs(ox) + Math.abs(oy) + Math.abs(oz)
        const hot = Math.min(1, disp * 5)
        // limb darkening gives the globe volume; displaced particles brighten and grow
        const alpha = Math.min(1, (0.3 + 0.7 * z2) * (1 - hot * 0.25) + hot * 0.2)
        const hotBucket = hot > 0.25 ? 1 : 0
        if (hotBucket !== lastHot) {
          ctx.fillStyle = hotBucket ? pal.hot : pal.land
          lastHot = hotBucket
        }
        ctx.globalAlpha = alpha
        const s = size * (1 + hot * 0.8)
        ctx.fillRect(sx - s / 2, sy - s / 2, s, s)
      }
      ctx.globalAlpha = 1
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      canvas.removeEventListener("pointerdown", onPointerDown)
      canvas.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("pointerup", endDrag)
      canvas.removeEventListener("pointercancel", endDrag)
      canvas.removeEventListener("pointerleave", onPointerLeave)
    }
  }, [reduced])

  return (
    <div ref={wrapRef} className={cn("relative flex h-full w-full items-center justify-center", className)}>
      <canvas
        ref={canvasRef}
        className="relative z-[1] block select-none"
        style={{ touchAction: "pan-y" }}
        role="img"
        aria-label="Interactive globe. Drag to rotate; hover to scatter the particles."
      />
    </div>
  )
}
