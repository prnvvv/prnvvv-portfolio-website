import { useRef, useEffect, useCallback } from 'react'
import { vec3, mat4 } from 'gl-matrix'

export interface InfiniteMenuItem {
  image: string
  link?: string
  title?: string
  description?: string
}

interface InfiniteMenuProps {
  items: InfiniteMenuItem[]
  width?: number
  height?: number
  radius?: number
  itemSize?: number
  autoRotateSpeed?: number
  onItemClick?: (item: InfiniteMenuItem, index: number) => void
}

const COLORS = [
  '#00e67a', '#3d9df6', '#ff5f56', '#ffbd2e',
  '#f59e0b', '#60a5fa', '#a78bfa', '#f472b6',
]

const FALLBACK_CANVASES = new Map<string, HTMLCanvasElement>()

function createFallbackCanvas(letter: string, color: string): HTMLCanvasElement {
  const key = `${letter}_${color}`
  if (FALLBACK_CANVASES.has(key)) return FALLBACK_CANVASES.get(key)!

  const c = document.createElement('canvas')
  c.width = 256
  c.height = 256
  const ctx = c.getContext('2d')!
  const cx = 128, cy = 128, r = 120

  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.fillStyle = color + '20'
  ctx.fill()
  ctx.strokeStyle = color + '60'
  ctx.lineWidth = 3
  ctx.stroke()

  ctx.fillStyle = color
  ctx.font = 'bold 64px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(letter, cx, cy)

  FALLBACK_CANVASES.set(key, c)
  return c
}

const IMAGE_CACHE = new Map<string, HTMLCanvasElement>()

function loadImage(src: string): Promise<HTMLCanvasElement> {
  if (IMAGE_CACHE.has(src)) return Promise.resolve(IMAGE_CACHE.get(src)!)

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const c = document.createElement('canvas')
      c.width = 256
      c.height = 256
      const ctx = c.getContext('2d')!
      const s = Math.min(img.width, img.height)
      const ox = (img.width - s) / 2
      const oy = (img.height - s) / 2
      ctx.beginPath()
      ctx.arc(128, 128, 120, 0, Math.PI * 2)
      ctx.clip()
      ctx.drawImage(img, ox, oy, s, s, 8, 8, 240, 240)
      IMAGE_CACHE.set(src, c)
      resolve(c)
    }
    img.onerror = () => {
      resolve(createFallbackCanvas('?', '#666'))
    }
    img.src = src
  })
}

export function InfiniteMenu({
  items,
  width: propWidth,
  height: propHeight,
  radius = 350,
  itemSize = 80,
  autoRotateSpeed = 0.15,
  onItemClick,
}: InfiniteMenuProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef({
    angle: 0,
    targetAngle: 0,
    isDragging: false,
    lastX: 0,
    dragStartX: 0,
    dragStartAngle: 0,
    imageTextures: new Map<number, HTMLCanvasElement>(),
    loaded: false,
    animFrame: 0,
    hoveredIndex: -1,
  })

  const itemsRef = useRef(items)
  itemsRef.current = items

  const onItemClickRef = useRef(onItemClick)
  onItemClickRef.current = onItemClick

  const getLetter = useCallback((i: number) => {
    const item = items[i]
    return item.title ? item.title.charAt(0).toUpperCase() : String(i + 1)
  }, [items])

  // Preload images
  useEffect(() => {
    items.forEach((item, i) => {
      const color = COLORS[i % COLORS.length]
      loadImage(item.image).catch(() => {
        return createFallbackCanvas(getLetter(i), color)
      }).then((canvas) => {
        stateRef.current.imageTextures.set(i, canvas)
      })
    })
  }, [items, getLetter])

  // Auto-resize
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        const canvas = canvasRef.current
        if (canvas) {
          canvas.width = width * devicePixelRatio
          canvas.height = height * devicePixelRatio
          canvas.style.width = `${width}px`
          canvas.style.height = `${height}px`
        }
      }
    })
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const state = stateRef.current

    function render() {
      const w = canvas!.width
      const h = canvas!.height
      const dpr = devicePixelRatio
      ctx.clearRect(0, 0, w, h)

      const len = itemsRef.current.length
      if (len === 0) return

      // Smooth rotation
      if (!state.isDragging) {
        state.angle += autoRotateSpeed * 0.01
      } else {
        state.angle += (state.targetAngle - state.angle) * 0.08
      }

      // Projection matrix
      const proj = mat4.create()
      const aspect = w / h
      mat4.perspective(proj, Math.PI / 4, aspect, 1, 3000)

      // View matrix
      const view = mat4.create()
      const eye: vec3 = [0, 0, 1200]
      const center: vec3 = [0, 0, 0]
      const up: vec3 = [0, 1, 0]
      mat4.lookAt(view, eye, center, up)

      const vp = mat4.create()
      mat4.multiply(vp, proj, view)

      // Build items with 3D positions
      const items3d: {
        index: number
        x: number
        y: number
        z: number
        screenX: number
        screenY: number
        scale: number
        alpha: number
      }[] = []

      for (let i = 0; i < len; i++) {
        const theta = (i / len) * Math.PI * 2 + state.angle
        const x = Math.sin(theta) * radius
        const z = Math.cos(theta) * radius
        const y = Math.sin(theta * 2) * radius * 0.15

        const pos: vec3 = [x, y, z]
        const screenPos: vec3 = [0, 0, 0]
        vec3.transformMat4(screenPos, pos, vp)

        const sx = (screenPos[0] / screenPos[2] + 1) * 0.5 * w
        const sy = (-screenPos[1] / screenPos[2] + 1) * 0.5 * h
        const sz = screenPos[2]

        const dist = Math.abs(z)
        const maxDist = radius * 1.5
        const scale = 1 - (dist / maxDist) * 0.6
        const alpha = 1 - (dist / maxDist) * 0.7

        items3d.push({ index: i, x, y, z, screenX: sx, screenY: sy, scale, alpha })
      }

      // Sort by Z (back to front)
      items3d.sort((a, b) => a.z - b.z)

      // Draw
      const itemW = itemSize * dpr
      const halfW = itemW / 2
      const labelSize = 10 * dpr

      for (const item of items3d) {
        const { index, screenX, screenY, scale, alpha } = item
        if (alpha <= 0.05) continue

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.translate(screenX, screenY)
        ctx.scale(scale, scale)

        const size = itemW
        const half = halfW

        // Glow
        ctx.shadowColor = COLORS[index % COLORS.length] + '40'
        ctx.shadowBlur = 30 * scale

        // Circle mask + image
        ctx.beginPath()
        ctx.arc(0, 0, half, 0, Math.PI * 2)
        ctx.closePath()

        const tex = state.imageTextures.get(index)
        if (tex) {
          ctx.save()
          ctx.clip()
          ctx.drawImage(tex, -half, -half, size, size)
          ctx.restore()
        } else {
          const letter = itemsRef.current[index]?.title?.charAt(0)?.toUpperCase() || String(index + 1)
          const color = COLORS[index % COLORS.length]
          ctx.fillStyle = color + '20'
          ctx.fill()
          ctx.strokeStyle = color + '60'
          ctx.lineWidth = 2 * dpr
          ctx.stroke()

          ctx.fillStyle = color
          ctx.font = `bold ${size * 0.3}px monospace`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(letter, 0, 0)
        }

        // Ring on hover
        if (state.hoveredIndex === index) {
          ctx.beginPath()
          ctx.arc(0, 0, half + 4 * dpr, 0, Math.PI * 2)
          ctx.strokeStyle = COLORS[index % COLORS.length]
          ctx.lineWidth = 3 * dpr
          ctx.stroke()
        }

        ctx.restore()
      }

      state.animFrame = requestAnimationFrame(render)
    }

    state.animFrame = requestAnimationFrame(render)
    return () => cancelAnimationFrame(state.animFrame)
  }, [radius, itemSize, autoRotateSpeed])

  // Mouse / touch handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const state = stateRef.current
    state.isDragging = true
    state.lastX = e.clientX
    state.dragStartX = e.clientX
    state.dragStartAngle = state.angle
    const canvas = canvasRef.current
    if (canvas) canvas.setPointerCapture(e.pointerId)
  }, [])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const state = stateRef.current
    if (!state.isDragging) {
      // Hit test for hover
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      // Simple distance check — find closest item to cursor
      state.hoveredIndex = -1
    } else {
      const dx = e.clientX - state.lastX
      state.angle += dx * 0.005
      state.lastX = e.clientX
      state.targetAngle = state.angle
    }
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const state = stateRef.current
    const dx = Math.abs(e.clientX - state.dragStartX)
    if (dx < 5) {
      // Click
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      // Find closest front item
      const len = itemsRef.current.length
      let closestIdx = -1
      let closestDist = Infinity
      for (let i = 0; i < len; i++) {
        const theta = (i / len) * Math.PI * 2 + state.angle
        const z = Math.cos(theta) * radius
        if (z < 0) continue // Only front-facing
        const sx = Math.sin(theta) * radius
        const sy = Math.sin(theta * 2) * radius * 0.15
        // Simple screen projection
        const fov = 1200
        const projectedZ = fov / (fov + z)
        const screenX = (sx * projectedZ) + canvas.width / (2 * devicePixelRatio)
        const screenY = (-sy * projectedZ) + canvas.height / (2 * devicePixelRatio)
        const d = Math.hypot(mx - screenX, my - screenY)
        if (d < closestDist) {
          closestDist = d
          closestIdx = i
        }
      }

      if (closestIdx >= 0 && closestDist < itemSize * 0.6) {
        onItemClickRef.current?.(itemsRef.current[closestIdx], closestIdx)
      }
    }
    state.isDragging = false
  }, [radius, itemSize])

  return (
    <div
      ref={containerRef}
      className="infinite-menu-container"
      style={{
        width: propWidth ? `${propWidth}px` : '100%',
        height: propHeight ? `${propHeight}px` : '100%',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <canvas
        ref={canvasRef}
        id="infinite-grid-menu-canvas"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          width: '100%',
          height: '100%',
          cursor: 'pointer',
          display: 'block',
          touchAction: 'none',
        }}
      />
    </div>
  )
}
