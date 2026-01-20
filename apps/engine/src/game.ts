import Matter from 'matter-js';
import { SeededRandom } from '@dopamine-orbs/shared';
import { GameState, Ball, Orb, Particle } from './types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  DOPAMINE_COLORS,
  GOLD_COLOR,
  GOLD_CHANCE,
  BALL_A_RADIUS,
  BALL_B_RADIUS,
  BALL_A_SPEED,
  BALL_B_SPEED,
  BALL_A_DAMAGE,
  BALL_B_DAMAGE,
  ORB_MIN_RADIUS,
  ORB_MAX_RADIUS,
  ORB_MIN_HP,
  ORB_MAX_HP,
  TRAIL_LENGTH,
  TRAIL_ALPHA_DECAY,
  PARTICLE_COUNT_ON_HIT,
  PARTICLE_LIFE,
  PARTICLE_SPEED,
  SHAKE_INTENSITY,
  SHAKE_DURATION,
  FLASH_DURATION,
  BOSS_SPAWN,
  TOTAL_FRAMES,
} from './constants';

export class Game {
  private engine: Matter.Engine;
  private world: Matter.World;
  private random: SeededRandom;
  private state: GameState;
  private initialBalls: { x: number; y: number; vx: number; vy: number }[] = [];
  private initialOrbs: Array<{ x: number; y: number; radius: number; hp: number; color: string; isGold: boolean }> = [];

  constructor(seed: number) {
    this.random = new SeededRandom(seed);
    this.engine = Matter.Engine.create();
    this.world = this.engine.world;
    this.engine.world.gravity.y = 0; // No gravity
    
    // Create walls
    const wallThickness = 50;
    const walls = [
      Matter.Bodies.rectangle(CANVAS_WIDTH / 2, -wallThickness / 2, CANVAS_WIDTH, wallThickness, { isStatic: true }),
      Matter.Bodies.rectangle(CANVAS_WIDTH / 2, CANVAS_HEIGHT + wallThickness / 2, CANVAS_WIDTH, wallThickness, { isStatic: true }),
      Matter.Bodies.rectangle(-wallThickness / 2, CANVAS_HEIGHT / 2, wallThickness, CANVAS_HEIGHT, { isStatic: true }),
      Matter.Bodies.rectangle(CANVAS_WIDTH + wallThickness / 2, CANVAS_HEIGHT / 2, wallThickness, CANVAS_HEIGHT, { isStatic: true }),
    ];
    Matter.World.add(this.world, walls);

    this.state = {
      balls: [],
      orbs: [],
      particles: [],
      score: 0,
      time: 0,
      seed,
      shakeOffset: { x: 0, y: 0 },
      flashAlpha: 0,
    };

    this.initialize();
  }

  private initialize() {
    // Spawn initial orbs
    const orbCount = 8 + this.random.nextInt(0, 4);
    for (let i = 0; i < orbCount; i++) {
      const radius = this.random.nextInt(ORB_MIN_RADIUS, ORB_MAX_RADIUS);
      const x = this.random.nextInt(radius, CANVAS_WIDTH - radius);
      const y = this.random.nextInt(radius, CANVAS_HEIGHT - radius);
      const hp = this.random.nextInt(ORB_MIN_HP, ORB_MAX_HP);
      const isGold = this.random.next() < GOLD_CHANCE;
      const color = isGold ? GOLD_COLOR : this.random.pick(DOPAMINE_COLORS);

      this.initialOrbs.push({ x, y, radius, hp, color, isGold });
    }

    // Spawn balls
    const ballA = {
      x: CANVAS_WIDTH / 4,
      y: CANVAS_HEIGHT / 2,
      vx: BALL_A_SPEED * (this.random.next() > 0.5 ? 1 : -1),
      vy: BALL_A_SPEED * (this.random.next() > 0.5 ? 1 : -1),
    };
    const ballB = {
      x: (CANVAS_WIDTH * 3) / 4,
      y: CANVAS_HEIGHT / 2,
      vx: BALL_B_SPEED * (this.random.next() > 0.5 ? 1 : -1),
      vy: BALL_B_SPEED * (this.random.next() > 0.5 ? 1 : -1),
    };

    this.initialBalls = [ballA, ballB];
  }

  getState(frame: number): GameState {
    const time = (frame / 60) * 1000; // ms
    const shouldReset = frame >= TOTAL_FRAMES - 1;

    if (shouldReset || frame === 0) {
      // Reset to initial state for perfect loop
      this.state.balls = this.initialBalls.map((ball, i) => ({
        id: `ball_${i}`,
        x: ball.x,
        y: ball.y,
        radius: i === 0 ? BALL_A_RADIUS : BALL_B_RADIUS,
        vx: ball.vx,
        vy: ball.vy,
        color: i === 0 ? DOPAMINE_COLORS[0] : DOPAMINE_COLORS[1],
        trail: [],
        damage: i === 0 ? BALL_A_DAMAGE : BALL_B_DAMAGE,
      }));

      this.state.orbs = this.initialOrbs.map((orb, i) => ({
        id: `orb_${i}`,
        x: orb.x,
        y: orb.y,
        radius: orb.radius,
        hp: orb.hp,
        maxHp: orb.hp,
        color: orb.color,
        isGold: orb.isGold,
        destroyed: false,
      }));

      this.state.particles = [];
      this.state.score = 0;
      this.state.time = 0;
      this.state.shakeOffset = { x: 0, y: 0 };
      this.state.flashAlpha = 0;
    }

    // Update physics
    this.update(frame, time);

    return { ...this.state };
  }

  private update(frame: number, time: number) {
    this.state.time = time;

    // Spawn boss at 52s
    if (frame === BOSS_SPAWN && !this.state.orbs.some(o => o.isGold && !o.destroyed)) {
      const boss: Orb = {
        id: 'boss',
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2,
        radius: 120,
        hp: 50,
        maxHp: 50,
        color: GOLD_COLOR,
        isGold: true,
        destroyed: false,
      };
      this.state.orbs.push(boss);
    }

    // Update balls
    for (const ball of this.state.balls) {
      // Update position
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Bounce off walls
      if (ball.x - ball.radius <= 0 || ball.x + ball.radius >= CANVAS_WIDTH) {
        ball.vx *= -1;
        ball.x = Math.max(ball.radius, Math.min(CANVAS_WIDTH - ball.radius, ball.x));
      }
      if (ball.y - ball.radius <= 0 || ball.y + ball.radius >= CANVAS_HEIGHT) {
        ball.vy *= -1;
        ball.y = Math.max(ball.radius, Math.min(CANVAS_HEIGHT - ball.radius, ball.y));
      }

      // Update trail
      ball.trail.push({ x: ball.x, y: ball.y, alpha: 1.0 });
      if (ball.trail.length > TRAIL_LENGTH) {
        ball.trail.shift();
      }
      ball.trail.forEach((point, i) => {
        point.alpha = Math.max(0, 1 - (TRAIL_LENGTH - i) * TRAIL_ALPHA_DECAY);
      });

      // Check collisions with orbs
      for (const orb of this.state.orbs) {
        if (orb.destroyed) continue;

        const dx = ball.x - orb.x;
        const dy = ball.y - orb.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = ball.radius + orb.radius;

        if (distance < minDistance) {
          // Collision!
          orb.hp -= ball.damage;

          // Bounce ball
          const angle = Math.atan2(dy, dx);
          const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
          ball.vx = Math.cos(angle) * speed;
          ball.vy = Math.sin(angle) * speed;

          // Create particles
          for (let i = 0; i < PARTICLE_COUNT_ON_HIT; i++) {
            const angle = (Math.PI * 2 * i) / PARTICLE_COUNT_ON_HIT;
            this.state.particles.push({
              x: orb.x,
              y: orb.y,
              vx: Math.cos(angle) * PARTICLE_SPEED * this.random.nextFloat(0.5, 1.5),
              vy: Math.sin(angle) * PARTICLE_SPEED * this.random.nextFloat(0.5, 1.5),
              life: PARTICLE_LIFE,
              maxLife: PARTICLE_LIFE,
              color: orb.isGold ? GOLD_COLOR : orb.color,
              size: this.random.nextFloat(2, 6),
            });
          }

          // Screen shake
          this.state.shakeOffset = {
            x: this.random.nextFloat(-SHAKE_INTENSITY, SHAKE_INTENSITY),
            y: this.random.nextFloat(-SHAKE_INTENSITY, SHAKE_INTENSITY),
          };
          setTimeout(() => {
            this.state.shakeOffset = { x: 0, y: 0 };
          }, SHAKE_DURATION);

          if (orb.hp <= 0) {
            orb.destroyed = true;
            this.state.score += orb.isGold ? 100 : 10;

            // Flash effect
            this.state.flashAlpha = 0.3;
            setTimeout(() => {
              this.state.flashAlpha = 0;
            }, FLASH_DURATION);

            // Gold explosion
            if (orb.isGold) {
              for (let i = 0; i < 30; i++) {
                const angle = (Math.PI * 2 * i) / 30;
                this.state.particles.push({
                  x: orb.x,
                  y: orb.y,
                  vx: Math.cos(angle) * PARTICLE_SPEED * 2,
                  vy: Math.sin(angle) * PARTICLE_SPEED * 2,
                  life: PARTICLE_LIFE * 2,
                  maxLife: PARTICLE_LIFE * 2,
                  color: GOLD_COLOR,
                  size: this.random.nextFloat(4, 10),
                });
              }
            }
          }
        }
      }
    }

    // Update particles
    this.state.particles = this.state.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      return p.life > 0;
    });
  }
}
