import { RetroGrid } from '@/components/ui/retro-grid';

export function TacticalRetroGrid() {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <RetroGrid
        angle={65}
        cellSize={55}
        opacity={0.18}
        darkLineColor="rgba(0, 230, 122, 0.35)"
        lightLineColor="rgba(0, 230, 122, 0.35)"
        className="w-full h-full"
      />
    </div>
  );
}
