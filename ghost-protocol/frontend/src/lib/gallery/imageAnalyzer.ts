import type { GalleryImage, ImageType } from './types';

export function analyzeImage(
  id: string,
  src: string,
  alt: string,
  width: number,
  height: number,
  imageType?: ImageType,
  focalPoint?: { x: number; y: number },
): GalleryImage {
  return {
    id,
    src,
    alt,
    width,
    height,
    imageType: imageType ?? 'photo',
    focalPoint,
  };
}
