export interface Point {
  x: number;
  y: number;
  z?: number;
}

export interface HandData {
  landmarks: Point[];
  handedness: 'Left' | 'Right';
  score: number;
}

export interface InteractionState {
  earthRotation: { x: number; y: number };
  earthScale: number;
  panelPosition: { x: number; y: number };
  isDraggingPanel: boolean;
  detectedRegion: string;
}

export interface HUDState {
  fps: number;
  systemStatus: string;
  time: string;
}
