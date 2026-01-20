import { GameState } from './types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  HOOK_START,
  HOOK_END,
  MID_PROMPT_START,
  MID_PROMPT_END,
  CTA_START,
  CTA_END,
  BOSS_DESTROY_START,
  SLOW_MO_START,
  SLOW_MO_END,
} from './constants';
import { DEFAULT_TEMPLATES } from '@dopamine-orbs/shared';

export class Renderer {
  private ctx: CanvasRenderingContext2D;
  private hook: string;
  private midPrompt: string;
  private cta: string;

  constructor(ctx: CanvasRenderingContext2D, hook?: string, midPrompt?: string, cta?: string) {
    this.ctx = ctx;
    this.hook = hook || DEFAULT_TEMPLATES.hooks[0];
    this.midPrompt = midPrompt || DEFAULT_TEMPLATES.midPrompts[0];
    this.cta = cta || DEFAULT_TEMPLATES.ctas[0];
  }

  render(state: GameState, frame: number) {
    const ctx = this.ctx;
    const { shakeOffset, flashAlpha } = state;

    // Clear
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Apply shake
    ctx.save();
    ctx.translate(shakeOffset.x, shakeOffset.y);

    // Render orbs
    for (const orb of state.orbs) {
      if (orb.destroyed) continue;

      const alpha = orb.hp / orb.maxHp;
      
      // Glow
      ctx.shadowBlur = 30;
      ctx.shadowColor = orb.color;
      
      // Orb body
      const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
      gradient.addColorStop(0, orb.color);
      gradient.addColorStop(0.5, orb.color + '80');
      gradient.addColorStop(1, orb.color + '00');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
      ctx.fill();

      // HP text
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(orb.hp.toString(), orb.x, orb.y);
    }

    // Render balls with trails
    for (const ball of state.balls) {
      // Trail
      for (let i = 0; i < ball.trail.length - 1; i++) {
        const point = ball.trail[i];
        const nextPoint = ball.trail[i + 1];
        
        ctx.strokeStyle = ball.color + Math.floor(point.alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = ball.radius * 2 * point.alpha;
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.lineTo(nextPoint.x, nextPoint.y);
        ctx.stroke();
      }

      // Ball
      ctx.shadowBlur = 20;
      ctx.shadowColor = ball.color;
      ctx.fillStyle = ball.color;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render particles
    ctx.shadowBlur = 0;
    for (const particle of state.particles) {
      const alpha = particle.life / particle.maxLife;
      ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Render overlay text
    this.renderOverlay(frame);

    // Flash effect
    if (flashAlpha > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    // Seed display (discret)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.font = '16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`Seed: ${state.seed}`, 20, CANVAS_HEIGHT - 40);
  }

  private renderOverlay(frame: number) {
    const ctx = this.ctx;

    // Hook (0-2s)
    if (frame >= HOOK_START && frame < HOOK_END) {
      const alpha = frame < HOOK_END - 30 ? 1 : 1 - (frame - (HOOK_END - 30)) / 30;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeText(this.hook, CANVAS_WIDTH / 2, 200);
      ctx.fillText(this.hook, CANVAS_WIDTH / 2, 200);
    }

    // Mid prompt (12-18s)
    if (frame >= MID_PROMPT_START && frame < MID_PROMPT_END) {
      const alpha = frame < MID_PROMPT_END - 30 ? 1 : 1 - (frame - (MID_PROMPT_END - 30)) / 30;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(this.midPrompt, CANVAS_WIDTH / 2, 300);
      ctx.fillText(this.midPrompt, CANVAS_WIDTH / 2, 300);
    }

    // CTA (41-48s)
    if (frame >= CTA_START && frame < CTA_END) {
      const alpha = frame < CTA_END - 30 ? 1 : 1 - (frame - (CTA_END - 30)) / 30;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeText(this.cta, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 200);
      ctx.fillText(this.cta, CANVAS_WIDTH / 2, CANVAS_HEIGHT - 200);
    }

    // Slow-mo effect (63.7-64s)
    if (frame >= SLOW_MO_START && frame < SLOW_MO_END) {
      // Visual effect handled by frame rate
    }
  }
}
