import type { GalleryImage } from './types';

export interface AspectRatioDistribution {
  min: number;
  max: number;
  mean: number;
  median: number;
  deviation: number;
}

export function analyzeAspectRatios(images: GalleryImage[]): AspectRatioDistribution {
  const ratios = images.map(i => i.width / i.height).sort((a, b) => a - b);
  const mean = ratios.reduce((s, r) => s + r, 0) / ratios.length;
  const variance = ratios.reduce((s, r) => s + (r - mean) ** 2, 0) / ratios.length;

  return {
    min: ratios[0],
    max: ratios[ratios.length - 1],
    mean,
    median:
      ratios.length % 2 === 0
        ? (ratios[ratios.length / 2 - 1] + ratios[ratios.length / 2]) / 2
        : ratios[Math.floor(ratios.length / 2)],
    deviation: Math.sqrt(variance),
  };
}
