import { motion } from 'framer-motion';
import type { GalleryCellSpec, GalleryImage } from '../../lib/gallery/types';

interface GalleryCellProps {
  spec: GalleryCellSpec;
  image: GalleryImage;
  index: number;
  total: number;
  onClick: () => void;
  stagger?: number;
}

export function GalleryCell({
  spec,
  image,
  index,
  total,
  onClick,
  stagger = 0.04,
}: GalleryCellProps) {
  const delay = Math.min(index, 5) * stagger;
  const isDocument = image.imageType === 'document';

  const imgFit = isDocument ? 'object-contain' : 'object-cover';
  const bgStyle = isDocument
    ? { background: 'rgba(255,255,255,0.03)' }
    : undefined;

  const objPos = image.focalPoint
    ? `${image.focalPoint.x * 100}% ${image.focalPoint.y * 100}%`
    : 'center';

  return (
    <motion.div
      className="relative overflow-hidden rounded-lg border border-white/10 hover:border-[#00e67a]/40 transition-all duration-300 cursor-pointer group bg-black/40"
      style={{ gridArea: spec.gridArea, ...bgStyle }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={
        spec.isOverflow
          ? `View ${spec.overflowCount} more images`
          : `Mission intel image ${index + 1} of ${total}`
      }
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      data-type={isDocument ? 'document' : undefined}
    >
      {/* INTEL badge — hidden on overflow cell */}
      {!spec.isOverflow && (
        <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
          <span className="text-[10px] font-mono text-[#00e67a]/70 bg-black/50 px-1.5 py-0.5 rounded border border-[#00e67a]/20">
            INTEL {String(index + 1).padStart(2, '0')}
          </span>
        </div>
      )}

      {/* Scanline overlay on hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-[#00e67a]/0 via-[#00e67a]/5 to-[#00e67a]/0 animate-scanline" />
      </div>

      <img
        src={image.src}
        alt={image.alt || `Project image ${index + 1}`}
        className={`w-full h-full ${imgFit} transition-transform duration-500 group-hover:scale-105 pointer-events-none select-none`}
        style={{
          objectPosition: objPos,
          ...(isDocument ? { background: 'rgba(255,255,255,0.03)' } : {}),
        }}
        loading={index === 0 ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
      />

      {/* +N overflow overlay — visual-only, aria-label on the container handles AT */}
      {spec.isOverflow && (
        <>
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
            <span className="text-xl md:text-2xl font-mono font-bold text-white/60 group-hover:text-white/90 transition-colors">
              +{spec.overflowCount}
            </span>
          </div>
          <span className="sr-only">
            View {spec.overflowCount} more images
          </span>
        </>
      )}
    </motion.div>
  );
}
