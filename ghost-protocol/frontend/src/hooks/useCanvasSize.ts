import { useEffect, useState } from 'react'

interface CanvasSize {
  width: number
  height: number
}

export function useCanvasSize(breakpoints: Record<string, number>): CanvasSize {
  const [size, setSize] = useState<CanvasSize>({ width: 780, height: 780 })

  useEffect(() => {
    function getSize(): CanvasSize {
      const w = window.innerWidth
      const sorted = Object.entries(breakpoints)
        .sort(([a], [b]) => Number(b) - Number(a))
      for (const [bp, val] of sorted) {
        if (w <= Number(bp)) {
          return { width: val, height: val }
        }
      }
      const last = sorted[sorted.length - 1]
      return { width: last[1], height: last[1] }
    }

    setSize(getSize())

    let timer: ReturnType<typeof setTimeout>
    const handler = () => {
      clearTimeout(timer)
      timer = setTimeout(() => setSize(getSize()), 200)
    }
    window.addEventListener('resize', handler)
    return () => {
      window.removeEventListener('resize', handler)
      clearTimeout(timer)
    }
  }, [breakpoints])

  return size
}
