import { useState, useEffect, useRef } from 'react';
import { analyzeImage } from '../../lib/gallery/imageAnalyzer';
import type { GalleryImage, ImageType } from '../../lib/gallery/types';

interface RawImageInput {
  src: string;
  alt: string;
  imageType?: ImageType;
  focalPoint?: { x: number; y: number };
}

interface UseImageMetaBatchResult {
  images: GalleryImage[];
  loading: boolean;
  error: Error | null;
}

const cache = new Map<string, GalleryImage>();

function generateId(index: number): string {
  return `img_${index}`;
}

/**
 * Loads intrinsic width/height for images that only carry src+alt.
 * Returns GalleryImage[] with full metadata.
 */
export function useImageMetaBatch(
  rawImages: RawImageInput[],
  ids?: string[],
): UseImageMetaBatchResult {
  const [result, setResult] = useState<UseImageMetaBatchResult>({
    images: [],
    loading: true,
    error: null,
  });
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (rawImages.length === 0) {
      setResult({ images: [], loading: false, error: null });
      return;
    }

    const cached: GalleryImage[] = [];
    const toLoad: { index: number; raw: RawImageInput }[] = [];

    rawImages.forEach((raw, i) => {
      const cachedMeta = cache.get(raw.src);
      if (cachedMeta) {
        cached.push({
          ...cachedMeta,
          id: ids?.[i] ?? generateId(i),
          alt: raw.alt,
        });
      } else {
        toLoad.push({ index: i, raw });
      }
    });

    if (toLoad.length === 0) {
      setResult({ images: cached, loading: false, error: null });
      return;
    }

    let cancelled = false;

    Promise.all(
      toLoad.map(
        ({ index, raw }) =>
          new Promise<GalleryImage>((resolve) => {
            const img = new Image();
            img.onload = () => {
              const meta = analyzeImage(
                ids?.[index] ?? generateId(index),
                raw.src,
                raw.alt,
                img.naturalWidth,
                img.naturalHeight,
                raw.imageType,
                raw.focalPoint,
              );
              cache.set(raw.src, meta);
              resolve(meta);
            };
            img.onerror = () => {
              const fallback = analyzeImage(
                ids?.[index] ?? generateId(index),
                raw.src,
                raw.alt,
                16,
                9,
                raw.imageType,
                raw.focalPoint,
              );
              cache.set(raw.src, fallback);
              resolve(fallback);
            };
            img.src = raw.src;
          }),
      ),
    )
      .then((loaded) => {
        if (cancelled || !mountedRef.current) return;

        const allImages: GalleryImage[] = [];
        const loadedMap = new Map<number, GalleryImage>();

        for (const meta of loaded) {
          const idx = rawImages.findIndex((r) => r.src === meta.src);
          if (idx !== -1) loadedMap.set(idx, meta);
        }

        for (let i = 0; i < rawImages.length; i++) {
          const cachedMeta = cache.get(rawImages[i].src);
          if (cachedMeta) {
            allImages.push({
              ...cachedMeta,
              id: ids?.[i] ?? generateId(i),
              alt: rawImages[i].alt,
            });
          } else if (loadedMap.has(i)) {
            allImages.push(loadedMap.get(i)!);
          }
        }

        setResult({ images: allImages, loading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled && mountedRef.current) {
          setResult((prev) => ({ ...prev, loading: false, error: err }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [rawImages, ids]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return result;
}
