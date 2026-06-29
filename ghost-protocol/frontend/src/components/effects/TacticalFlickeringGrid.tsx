import { FlickeringGrid } from '@/components/ui/flickering-grid';

export function TacticalFlickeringGrid() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
      aria-hidden="true"
    >
      <FlickeringGrid
        squareSize={3}
        gridGap={8}
        flickerChance={0.06}
        color="rgb(0, 230, 122)"
        maxOpacity={0.07}
        className="w-full h-full"
      />
    </div>
  );
}
