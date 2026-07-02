/**
 * GalleryLayout — legacy-compatible wrapper that delegates to AdaptiveGallery.
 *
 * The old GalleryImage interface is re-exported here for backward compatibility.
 * New code should import GalleryImage from the types module directly.
 */
import { AdaptiveGallery } from './AdaptiveGallery';
import type { AdaptiveGalleryProps } from './AdaptiveGallery';
import type { GalleryImage as LibGalleryImage } from '../../lib/gallery/types';

export type GalleryImage = LibGalleryImage;

interface GalleryLayoutProps {
  images: { src: string; alt: string }[];
  onImageClick: (index: number) => void;
}

export function GalleryLayout({ images, onImageClick }: GalleryLayoutProps) {
  return (
    <AdaptiveGallery
      images={images}
      onImageClick={onImageClick}
    />
  );
}
