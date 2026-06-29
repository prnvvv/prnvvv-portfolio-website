import React from 'react';
import { TacticalTile } from './TacticalTile';

interface TacticalTileGridProps {
  children: React.ReactNode[];
  columns?: number;
  gap?: number;
  staggerBase?: number;
}

export function TacticalTileGrid({
  children,
  columns = 3,
  gap = 16,
  staggerBase = 0,
}: TacticalTileGridProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: `${gap}px`,
    }}>
      {React.Children.map(children, (child, i) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ index?: number }>, { index: staggerBase + i })
          : child
      )}
    </div>
  );
}
