/**
 * Old-TV "signal change" theme transition (~2s, monochrome only).
 *
 *   0–400ms     signal disruption: scanlines fade in, sparse static pixels, thin
 *               horizontal interference bands
 *   400–1000ms  a dither/pixel front sweeps down the screen, progressively
 *               covering the interface (Bayer-threshold coverage, top → bottom)
 *   ~1000ms     fully covered → `onSwap()` flips the theme underneath
 *   1000–1900ms the same sweep dissolves, revealing the new theme top → bottom
 *   1900–2000ms scanlines fade out, overlay is removed
 *
 * Implementation: one low-resolution <canvas> (one cell = one chunky pixel,
 * ~50–40k cells) is created on demand and drawn at ~30fps with ImageData,
 * plus one CSS scanline layer. Both are `position: fixed; pointer-events: none`
 * so layout and interaction are untouched, and both are removed afterwards.
 */

export const TV_TRANSITION_MS = 2000
const SWAP_AT = 1000
const COVER_START = 400
const CLEAR_END = 1900
const FRAME_MS = 1000 / 30

const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

const easeInOut = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2)
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)

// Greys used for static / pixel fragments (black, white and grayscale only).
const GREYS = [8, 20, 38, 64, 96, 140, 190, 235, 255]

let running = false

export function isTvTransitionRunning() {
  return running
}

export function runTvTransition(onSwap: () => void, onDone?: () => void) {
  if (running) return
  running = true

  const vw = window.innerWidth
  const vh = window.innerHeight
  const block = vw < 640 ? 8 : 6
  const cols = Math.ceil(vw / block)
  const rows = Math.ceil(vh / block)

  const wrap = document.createElement('div')
  wrap.setAttribute('aria-hidden', 'true')
  wrap.className = 'tv-transition'

  const canvas = document.createElement('canvas')
  canvas.width = cols
  canvas.height = rows
  canvas.className = 'tv-transition__canvas'
  const scan = document.createElement('div')
  scan.className = 'tv-transition__scan'
  wrap.append(canvas, scan)
  document.body.appendChild(wrap)

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    wrap.remove()
    running = false
    onSwap()
    onDone?.()
    return
  }
  const img = ctx.createImageData(cols, rows)
  const data = img.data

  // Per-row stagger so the sweep edge is slightly ragged, like a failing signal.
  const rowJitter = new Float32Array(rows)
  for (let y = 0; y < rows; y++) rowJitter[y] = Math.random() * 0.06

  let bands: { y: number; h: number; shift: number }[] = []
  const start = performance.now()
  let last = 0
  let swapped = false
  let raf = 0

  const finish = () => {
    cancelAnimationFrame(raf)
    wrap.remove()
    running = false
    if (!swapped) onSwap()
    onDone?.()
  }

  const frame = (now: number) => {
    const t = now - start
    if (t >= TV_TRANSITION_MS) return finish()
    raf = requestAnimationFrame(frame)
    if (now - last < FRAME_MS) return
    last = now

    if (!swapped && t >= SWAP_AT) {
      swapped = true
      onSwap()
    }

    // Scanline layer opacity: in during phase 1, out during the last 100ms.
    const scanOpacity =
      t < 400 ? t / 400 : t > CLEAR_END ? 1 - (t - CLEAR_END) / (TV_TRANSITION_MS - CLEAR_END) : 1
    scan.style.opacity = String(0.85 * clamp01(scanOpacity))
    // Slow vertical drift of the scanlines.
    scan.style.backgroundPositionY = `${Math.round(t / 40)}px`

    // Phase-1 static density and interference bands.
    const staticDensity = t < COVER_START ? 0.02 + 0.06 * (t / COVER_START) : 0.08
    if (Math.random() < 0.35 || bands.length === 0) {
      bands = []
      const n = 1 + Math.floor(Math.random() * 3)
      for (let i = 0; i < n; i++) {
        bands.push({
          y: Math.floor(Math.random() * rows),
          h: 1 + Math.floor(Math.random() * 3),
          shift: Math.floor(Math.random() * cols),
        })
      }
    }
    const bandIntensity = t < COVER_START ? t / COVER_START : 1

    // Coverage sweep: 0 → 1 between 400 and 1000ms, then 1 → 0 until 1900ms.
    const phaseIn = clamp01((t - COVER_START) / (SWAP_AT - COVER_START))
    const phaseOut = clamp01((t - SWAP_AT) / (CLEAR_END - SWAP_AT))
    const sweepIn = easeInOut(phaseIn)
    const sweepOut = easeInOut(phaseOut)

    for (let y = 0; y < rows; y++) {
      const yn = y / rows + rowJitter[y]
      // Front position relative to this row: rows near the top get covered first.
      const covIn = clamp01(sweepIn * 2 - yn)
      // Clearing runs top → bottom as well, so the top is revealed first.
      const covOut = 1 - clamp01(sweepOut * 2 - yn)
      const coverage = t < SWAP_AT ? covIn : covOut
      let inBand = false
      for (const b of bands) if (y >= b.y && y < b.y + b.h) inBand = true

      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4
        const threshold = (BAYER[y & 3][x & 3] + 0.5) / 16
        let a = 0
        let g = 0

        if (coverage > threshold) {
          // Dither-covered cell: opaque chunky grey/white noise.
          g = GREYS[(Math.random() * GREYS.length) | 0]
          a = 235
        } else if (Math.random() < staticDensity * (1 - coverage)) {
          // Sparse static pixel fragment.
          g = GREYS[(Math.random() * GREYS.length) | 0]
          a = 150 + ((Math.random() * 90) | 0)
        } else if (inBand && Math.random() < 0.5 * bandIntensity) {
          // Horizontal interference: streaks of light/dark cells.
          g = ((x + y) & 1) === 0 ? 235 : 20
          a = 110
        }
        data[i] = data[i + 1] = data[i + 2] = g
        data[i + 3] = a
      }
    }
    ctx.putImageData(img, 0, 0)
  }

  raf = requestAnimationFrame(frame)
}
