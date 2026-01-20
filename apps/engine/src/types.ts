export interface Ball {
  id: string;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
  trail: Array<{ x: number; y: number; alpha: number }>;
  damage: number;
}

export interface Orb {
  id: string;
  x: number;
  y: number;
  radius: number;
  hp: number;
  maxHp: number;
  color: string;
  isGold: boolean;
  destroyed: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface GameState {
  balls: Ball[];
  orbs: Orb[];
  particles: Particle[];
  score: number;
  time: number;
  seed: number;
  shakeOffset: { x: number; y: number };
  flashAlpha: number;
}
