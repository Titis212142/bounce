export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1920;
export const DURATION_MS = 65000;
export const FPS = 60;
export const TOTAL_FRAMES = Math.floor((DURATION_MS / 1000) * FPS);

// Colors
export const DOPAMINE_COLORS = [
  '#8B5CF6', // Purple
  '#00E5FF', // Cyan
  '#00FF9C', // Green
  '#FFD93D', // Yellow
  '#FF2D95', // Pink
];

export const GOLD_COLOR = '#FFD700';
export const GOLD_CHANCE = 0.01; // 1%

// Ball config
export const BALL_A_RADIUS = 25;
export const BALL_B_RADIUS = 30;
export const BALL_A_SPEED = 8;
export const BALL_B_SPEED = 6;
export const BALL_A_DAMAGE = 1;
export const BALL_B_DAMAGE = 2;

// Orb config
export const ORB_MIN_RADIUS = 40;
export const ORB_MAX_RADIUS = 80;
export const ORB_MIN_HP = 3;
export const ORB_MAX_HP = 10;

// Trail
export const TRAIL_LENGTH = 15;
export const TRAIL_ALPHA_DECAY = 0.15;

// Particles
export const PARTICLE_COUNT_ON_HIT = 8;
export const PARTICLE_LIFE = 30;
export const PARTICLE_SPEED = 5;

// Effects
export const SHAKE_INTENSITY = 3;
export const SHAKE_DURATION = 80; // ms
export const FLASH_DURATION = 200; // ms

// Timing (in frames)
export const HOOK_START = 0;
export const HOOK_END = FPS * 2; // 0-2s
export const MID_PROMPT_START = FPS * 12; // 12s
export const MID_PROMPT_END = FPS * 18; // 18s
export const CTA_START = FPS * 41; // 41s
export const CTA_END = FPS * 48; // 48s
export const BOSS_SPAWN = FPS * 52; // 52s
export const BOSS_DESTROY_START = FPS * 63; // 63s
export const BOSS_DESTROY_END = FPS * 64; // 64s
export const SLOW_MO_START = FPS * 63.7; // 63.7s
export const SLOW_MO_END = FPS * 64; // 64s
