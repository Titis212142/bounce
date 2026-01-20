import { useCurrentFrame, useVideoConfig } from 'remotion';
import { Game } from '../game';
import { Renderer } from '../renderer';
import { useEffect, useRef } from 'react';
import { TOTAL_FRAMES } from '../constants';

interface VideoProps {
  seed: number;
  hook?: string;
  midPrompt?: string;
  cta?: string;
}

export const Video: React.FC<VideoProps> = ({ seed, hook, midPrompt, cta }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const rendererRef = useRef<Renderer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    if (!gameRef.current) {
      gameRef.current = new Game(seed);
    }
    if (!rendererRef.current) {
      rendererRef.current = new Renderer(ctx, hook, midPrompt, cta);
    }
  }, [seed, hook, midPrompt, cta, width, height]);

  useEffect(() => {
    if (!canvasRef.current || !gameRef.current || !rendererRef.current) return;

    const game = gameRef.current;
    const renderer = rendererRef.current;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const state = game.getState(frame);
    renderer.render(state, frame);
  }, [frame]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};
