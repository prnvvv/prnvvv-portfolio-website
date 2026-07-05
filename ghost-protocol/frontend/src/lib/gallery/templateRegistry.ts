import type { GalleryImage, GalleryCellSpec, GalleryTemplate } from './types';

/**
 * Fixed CSS Grid templates keyed by image count bucket (1-5).
 * Count is the only input — no aspect-ratio scoring, no per-image geometry.
 * Templates follow the LinkedIn/X industry convention:
 *   1 = full-bleed single cell
 *   2 = equal columns
 *   3 = hero (left, full height, ~60% width) + 2 stacked cells (right)
 *   4 = 2x2 equal grid
 *   5+ = hero (left, ~50% width) + 2x2 sub-grid on the right
 */
const TEMPLATES: Record<number, GalleryTemplate> = {
  1: {
    imageCount: 1,
    desktop: {
      gridTemplateColumns: '1fr',
      gridTemplateRows: '1fr',
      gridTemplateAreas: '"hero"',
    },
    cells: [{ gridArea: 'hero', isOverflow: false }],
  },
  2: {
    imageCount: 2,
    desktop: {
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr',
      gridTemplateAreas: '"cell-0 cell-1"',
    },
    cells: [
      { gridArea: 'cell-0', isOverflow: false },
      { gridArea: 'cell-1', isOverflow: false },
    ],
  },
  3: {
    imageCount: 3,
    desktop: {
      gridTemplateColumns: '3fr 2fr',
      gridTemplateRows: '1fr 1fr',
      gridTemplateAreas: '"hero cell-1" "hero cell-2"',
    },
    mobile: {
      gridTemplateColumns: '1fr',
      gridTemplateRows: 'auto 1fr 1fr',
      gridTemplateAreas: '"hero" "cell-1" "cell-2"',
    },
    cells: [
      { gridArea: 'hero', isOverflow: false },
      { gridArea: 'cell-1', isOverflow: false },
      { gridArea: 'cell-2', isOverflow: false },
    ],
  },
  4: {
    imageCount: 4,
    desktop: {
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gridTemplateAreas: '"cell-0 cell-1" "cell-2 cell-3"',
    },
    cells: [
      { gridArea: 'cell-0', isOverflow: false },
      { gridArea: 'cell-1', isOverflow: false },
      { gridArea: 'cell-2', isOverflow: false },
      { gridArea: 'cell-3', isOverflow: false },
    ],
  },
  5: {
    imageCount: 5,
    desktop: {
      gridTemplateColumns: '1fr 1fr 1fr',
      gridTemplateRows: '1fr 1fr',
      gridTemplateAreas: '"hero cell-1 cell-2" "hero cell-3 cell-4"',
    },
    mobile: {
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: 'auto 1fr 1fr',
      gridTemplateAreas: '"hero hero" "cell-1 cell-2" "cell-3 cell-4"',
    },
    cells: [
      { gridArea: 'hero', isOverflow: false },
      { gridArea: 'cell-1', isOverflow: false },
      { gridArea: 'cell-2', isOverflow: false },
      { gridArea: 'cell-3', isOverflow: false },
      { gridArea: 'cell-4', isOverflow: false },
    ],
  },
};

/**
 * Selects the template for a given image count.
 * Pure lookup by min(count, 5) — O(1), no computation.
 */
export function selectTemplate(imageCount: number): GalleryTemplate {
  const bucket = Math.max(1, Math.min(imageCount, 5));
  return TEMPLATES[bucket];
}

/**
 * Returns the visible cell specs for a set of images.
 * - Maps images 1:1 to template cells in upload order (no reordering).
 * - Caps at 5 cells regardless of total image count.
 * - When count > 5, marks the last cell as overflow with the remaining count.
 */
export function getVisibleCells(images: GalleryImage[]): GalleryCellSpec[] {
  if (images.length === 0) return [];

  const count = images.length;
  const template = selectTemplate(count);
  const visibleCount = Math.min(count, 5);

  const cells: GalleryCellSpec[] = [];
  for (let i = 0; i < visibleCount; i++) {
    cells.push({
      imageId: images[i].id,
      gridArea: template.cells[i].gridArea,
      isOverflow: false,
    });
  }

  if (count > 5) {
    const last = cells[cells.length - 1];
    last.isOverflow = true;
    last.overflowCount = count - 5;
  }

  return cells;
}
