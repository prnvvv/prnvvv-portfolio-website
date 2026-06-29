export interface TileVariant {
  base: 'stat' | 'skill' | 'project' | 'mission' | 'intel' | 'cert' | 'generic';
}

export interface TacticalTileProps {
  children: React.ReactNode;
  variant?: TileVariant['base'];
  className?: string;
  expandContent?: React.ReactNode;
  autoReveal?: boolean;
  autoRevealDelay?: number;
  index?: number;
  disableTilt?: boolean;
  maxTilt?: number;
  showRadar?: boolean;
  accentColor?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export interface StatTileData {
  value: string | number;
  label: string;
  suffix?: string;
  icon?: string;
  detail: string;
  subDetail?: string;
  trend?: 'up' | 'stable';
}

export interface TiltState {
  rotateX: number;
  rotateY: number;
  glowX: number;
  glowY: number;
  isHovered: boolean;
  scale: number;
}
