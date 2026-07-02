import type { GalleryImage } from './types';

export type Orientation = 'portrait' | 'landscape' | 'square';

export interface OrientationStats {
  portrait: number;
  landscape: number;
  square: number;
  dominantOrientation: Orientation;
}

function getOrientation(img: GalleryImage): Orientation {
  const ar = img.width / img.height;
  if (ar > 1.3) return 'landscape';
  if (ar < 0.77) return 'portrait';
  return 'square';
}

export function analyzeOrientations(images: GalleryImage[]): OrientationStats {
  let portrait = 0;
  let landscape = 0;
  let square = 0;

  for (const img of images) {
    const o = getOrientation(img);
    if (o === 'portrait') portrait++;
    else if (o === 'landscape') landscape++;
    else square++;
  }

  let dominantOrientation: Orientation;
  if (portrait >= landscape && portrait >= square) dominantOrientation = 'portrait';
  else if (landscape >= portrait && landscape >= square) dominantOrientation = 'landscape';
  else dominantOrientation = 'square';

  return { portrait, landscape, square, dominantOrientation };
}
