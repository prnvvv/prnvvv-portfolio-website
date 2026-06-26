import { useScroll, useTransform } from 'framer-motion'

interface ScrollAnimationConfig {
  inputRange?: [number, number]
  scaleRange?: [number, number]
  opacityRange?: [number, number]
  yRange?: [number, number]
}

export function useScrollAnimation(config: ScrollAnimationConfig = {}) {
  const {
    inputRange = [0, 400],
    scaleRange = [1, 0.85],
    opacityRange = [1, 0.4],
    yRange = [0, -30],
  } = config

  const { scrollY } = useScroll()

  const scale = useTransform(scrollY, inputRange, scaleRange)
  const opacity = useTransform(scrollY, inputRange, opacityRange)
  const y = useTransform(scrollY, inputRange, yRange)

  return { scale, opacity, y }
}
