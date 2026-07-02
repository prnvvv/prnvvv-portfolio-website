import { useState, useCallback, useMemo } from 'react'

export interface UseGalleryIndexResult {
  currentIndex: number
  goNext: () => void
  goPrev: () => void
  goTo: (index: number) => void
  totalCount: number
  isFirst: boolean
  isLast: boolean
}

export function useGalleryIndex(imageCount: number, initialIndex = 0): UseGalleryIndexResult {
  const safeInitial = imageCount <= 0 ? 0 : Math.min(initialIndex, imageCount - 1)
  const [currentIndex, setCurrentIndex] = useState(safeInitial)

  const goNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, imageCount - 1))
  }, [imageCount])

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0))
  }, [])

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.min(Math.max(0, index), imageCount - 1))
  }, [imageCount])

  const isFirst = currentIndex <= 0
  const isLast = currentIndex >= imageCount - 1

  return useMemo(
    () => ({ currentIndex, goNext, goPrev, goTo, totalCount: imageCount, isFirst, isLast }),
    [currentIndex, goNext, goPrev, goTo, imageCount, isFirst, isLast],
  )
}
