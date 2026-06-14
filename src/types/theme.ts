export interface ThemeContextValue {
  clownMode: boolean;
  toggleClownMode: () => void;
}

export interface EmoteConfig {
  src: string;
  size: number;
  position: { x: number; y: number };
  rotation: number;
  animationDelay: number;
}

export type EmotePosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'left' | 'right';
