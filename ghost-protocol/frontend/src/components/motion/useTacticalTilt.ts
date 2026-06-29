import {
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import { useRef, useCallback, useState } from 'react';

interface UseTacticalTiltOptions {
  maxTilt?: number;
  stiffness?: number;
  damping?: number;
  scaleOnHover?: number;
  disabled?: boolean;
}

interface TacticalTiltReturn {
  ref: React.RefObject<HTMLDivElement | null>;
  rotateX: ReturnType<typeof useMotionValue<number>>;
  rotateY: ReturnType<typeof useMotionValue<number>>;
  scale: ReturnType<typeof useMotionValue<number>>;
  glowX: ReturnType<typeof useMotionValue<string>>;
  glowY: ReturnType<typeof useMotionValue<string>>;
  shadowX: ReturnType<typeof useMotionValue<number>>;
  shadowY: ReturnType<typeof useMotionValue<number>>;
  isHovered: boolean;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
  onMouseEnter: () => void;
}

export function useTacticalTilt({
  maxTilt = 8,
  stiffness = 300,
  damping = 30,
  scaleOnHover = 1.03,
  disabled = false,
}: UseTacticalTiltOptions = {}): TacticalTiltReturn {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rawScale = useMotionValue(1);
  const rawGlowX = useMotionValue(50);
  const rawGlowY = useMotionValue(50);
  const lastFrameTime = useRef(0);

  const rotateX = useSpring(rawRotateX, { stiffness, damping, mass: 0.5 });
  const rotateY = useSpring(rawRotateY, { stiffness, damping, mass: 0.5 });
  const scale = useSpring(rawScale, { stiffness: 200, damping: 25 });

  const shadowX = useTransform(rotateY, [-maxTilt, maxTilt], [-12, 12]);
  const shadowY = useTransform(rotateX, [maxTilt, -maxTilt], [-8, 8]);

  const glowXSpring = useSpring(rawGlowX, { stiffness: 150, damping: 20 });
  const glowYSpring = useSpring(rawGlowY, { stiffness: 150, damping: 20 });
  const glowX = useTransform(glowXSpring, v => `${v}%`);
  const glowY = useTransform(glowYSpring, v => `${v}%`);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled || !ref.current) return;
    const now = performance.now();
    if (now - lastFrameTime.current < 16) return;
    lastFrameTime.current = now;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) / (rect.width / 2);
    const dy = (e.clientY - centerY) / (rect.height / 2);

    rawRotateY.set(dx * maxTilt);
    rawRotateX.set(-dy * maxTilt);
    rawGlowX.set(((e.clientX - rect.left) / rect.width) * 100);
    rawGlowY.set(((e.clientY - rect.top) / rect.height) * 100);
  }, [disabled, maxTilt, rawRotateX, rawRotateY, rawGlowX, rawGlowY]);

  const onMouseEnter = useCallback(() => {
    if (disabled) return;
    setIsHovered(true);
    rawScale.set(scaleOnHover);
  }, [disabled, scaleOnHover, rawScale]);

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
    rawRotateX.set(0);
    rawRotateY.set(0);
    rawScale.set(1);
    rawGlowX.set(50);
    rawGlowY.set(50);
  }, [rawRotateX, rawRotateY, rawScale, rawGlowX, rawGlowY]);

  return {
    ref, rotateX, rotateY, scale, glowX, glowY, shadowX, shadowY,
    isHovered, onMouseMove, onMouseLeave, onMouseEnter,
  };
}
