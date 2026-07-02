interface CropCoreGalleryProps {
  images: { src: string; alt: string }[];
  onImageClick: (index: number) => void;
}

export function CropCoreGallery({ images, onImageClick }: CropCoreGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        gap: '16px',
      }}
    >
      {/* Figure 1 — Team photo, 62% of panel */}
      <div
        role="button"
        tabIndex={0}
        aria-label={images[0]?.alt || 'CropCore team photo'}
        className="group transition-all duration-250 cursor-pointer"
        style={{
          flex: '1.65 1 0%',
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '8px',
          border: '1px solid rgba(0,230,122,0.12)',
          background: '#0b0f13',
        }}
        onClick={() => onImageClick(0)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onImageClick(0);
          }
        }}
      >
        <img
          src={images[0].src}
          alt={images[0]?.alt || 'CropCore team photo'}
          draggable={false}
          loading="eager"
          className="transition-all duration-250 group-hover:brightness-[1.06] pointer-events-none select-none"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
        <div
          className="transition-all duration-250"
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '8px',
            border: '1px solid transparent',
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Figure 2 — Patent document, 38% of panel */}
      <div
        role="button"
        tabIndex={0}
        aria-label={images[1]?.alt || 'CropCore patent document'}
        className="group transition-all duration-250 cursor-pointer"
        style={{
          flex: '1 1 0%',
          minHeight: 0,
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '8px',
          border: '1px solid rgba(0,230,122,0.12)',
          background: '#070a0c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={() => onImageClick(1)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onImageClick(1);
          }
        }}
      >
        <img
          src={images[1].src}
          alt={images[1]?.alt || 'CropCore patent document'}
          draggable={false}
          loading="eager"
          className="transition-all duration-250 group-hover:brightness-[1.06] pointer-events-none select-none"
          style={{
            width: 'auto',
            height: '100%',
            maxWidth: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
    </div>
  );
}
