import { useMemo, useCallback, useState, useEffect } from 'react';
import { useImageMetaBatch } from '../../hooks/gallery/useImageMetaBatch';
import { getVisibleCells, selectTemplate } from '../../lib/gallery/templateRegistry';
import type { GalleryImage, ImageType } from '../../lib/gallery/types';
import { GalleryCell } from './GalleryCell';

export interface AdaptiveGalleryProps {
  images: { src: string; alt: string; imageType?: ImageType }[];
  onImageClick: (index: number) => void;
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export function AdaptiveGallery({ images, onImageClick }: AdaptiveGalleryProps) {
  const rawImages = useMemo(
    () =>
      images.map((img) => ({
        src: img.src,
        alt: img.alt,
        imageType: img.imageType,
      })),
    [images],
  );

  const { images: galleryImages, loading } = useImageMetaBatch(rawImages);

  const isMobile = useMediaQuery('(max-width: 400px)');

  const cellSpecs = useMemo(
    () => getVisibleCells(galleryImages),
    [galleryImages],
  );

  const template = useMemo(
    () => selectTemplate(galleryImages.length),
    [galleryImages.length],
  );

  const gridStyle = useMemo(() => {
    const grid = isMobile && template.mobile ? template.mobile : template.desktop;
    return {
      display: 'grid',
      gridTemplateColumns: grid.gridTemplateColumns,
      gridTemplateRows: grid.gridTemplateRows,
      gridTemplateAreas: grid.gridTemplateAreas,
      gap: '4px',
    } as React.CSSProperties;
  }, [template, isMobile]);

  const imageById = useMemo(() => {
    const map = new Map<string, GalleryImage>();
    for (const img of galleryImages) {
      map.set(img.id, img);
    }
    return map;
  }, [galleryImages]);

  const handleCellClick = useCallback(
    (imageId: string) => {
      const idx = galleryImages.findIndex((img) => img.id === imageId);
      if (idx !== -1) onImageClick(idx);
    },
    [galleryImages, onImageClick],
  );

  if (images.length === 0) return null;

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[200px]">
        <span className="text-[10px] font-mono text-white/20 animate-pulse">
          LOADING INTEL...
        </span>
      </div>
    );
  }

  if (cellSpecs.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[200px]">
        <span className="text-[10px] font-mono text-white/30">
          NO INTEL AVAILABLE
        </span>
      </div>
    );
  }

  const bucket = Math.min(galleryImages.length, 5);

  return (
    <div
      className="w-full h-full"
      style={gridStyle}
      data-count={bucket}
      data-mobile={isMobile ? 'true' : undefined}
    >
      {cellSpecs.map((spec, idx) => {
        const img = imageById.get(spec.imageId);
        if (!img) return null;

        return (
          <GalleryCell
            key={spec.imageId}
            spec={spec}
            image={img}
            index={idx}
            total={cellSpecs.length}
            onClick={() => handleCellClick(spec.imageId)}
          />
        );
      })}
    </div>
  );
}
