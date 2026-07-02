export type ImageType = 'photo' | 'screenshot' | 'document';

export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  imageType?: ImageType;
  focalPoint?: { x: number; y: number };
}

export interface GalleryCellSpec {
  imageId: string;
  gridArea: string;
  isOverflow: boolean;
  overflowCount?: number;
}

export interface GalleryTemplateGrid {
  gridTemplateColumns: string;
  gridTemplateRows: string;
  gridTemplateAreas: string;
}

export interface GalleryTemplate {
  imageCount: number;
  desktop: GalleryTemplateGrid;
  mobile?: GalleryTemplateGrid;
  cells: Omit<GalleryCellSpec, 'imageId'>[];
}
