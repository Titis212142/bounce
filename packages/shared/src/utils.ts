// PRNG seedable (mulberry32)
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }

  pick<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
}

// Generate unique seed from timestamp + random
export function generateSeed(): number {
  return Date.now() + Math.floor(Math.random() * 1000000);
}

// Format duration
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Default text templates
export const DEFAULT_TEMPLATES = {
  hooks: [
    'WAIT FOR THE END 😳',
    'THIS IS INSANE 🤯',
    'YOU WON\'T BELIEVE THIS 👀',
    'THE ENDING THO 💀',
    'WATCH TILL THE END ⏰',
  ],
  midPrompts: [
    'BLUE or PINK? 👇',
    'COMMENT YOUR COLOR 🎨',
    'WHICH ONE? 💬',
    'WHAT DO YOU THINK? 🤔',
    'DROP YOUR FAV 👇',
  ],
  ctas: [
    'Follow for Level 2 👀',
    'Follow for more! 🔥',
    'Follow for Part 2 🎮',
    'Follow for daily orbs ✨',
  ],
  hashtags: [
    '#dopamine',
    '#satisfying',
    '#oddlysatisfying',
    '#game',
    '#gaming',
    '#viral',
    '#fyp',
    '#foryou',
    '#trending',
    '#asmr',
  ],
};
