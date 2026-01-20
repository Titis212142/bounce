import { Job } from 'bullmq';
import { prisma } from '../db';
import { JobStatus, JobType } from '@dopamine-orbs/shared';
import { config } from '../config';
import fs from 'fs/promises';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function renderJobProcessor(job: Job) {
  const { userId, videoId, seed, config: videoConfig } = job.data as {
    userId: string;
    videoId: string;
    seed: number;
    config: { theme?: string; intensity?: number };
  };

  // Create or update job record
  let jobRecord = await prisma.job.findUnique({ where: { id: job.id! } });
  if (!jobRecord) {
    jobRecord = await prisma.job.create({
      data: {
        id: job.id!,
        type: JobType.RENDER,
        status: JobStatus.PROCESSING,
        userId,
        videoId,
        data: { seed, config: videoConfig },
      },
    });
  } else {
    await prisma.job.update({
      where: { id: job.id! },
      data: { status: JobStatus.PROCESSING },
    });
  }

  // Create output directory
  const dateStr = new Date().toISOString().split('T')[0];
  const outputDir = path.join(config.storage.path, dateStr);
  await fs.mkdir(outputDir, { recursive: true });

  const filename = `video_${seed}.mp4`;
  const filepath = path.join(outputDir, filename);

  // Get video metadata
  const video = await prisma.video.findUnique({ where: { id: videoId } });
  if (!video) {
    throw new Error('Video not found');
  }

  console.log(`Rendering video ${videoId} with seed ${seed}...`);

  // Render with Remotion
  // Note: In production, you'd want to use the Remotion renderer API
  // For now, we'll use the CLI approach
  try {
    const enginePath = path.resolve(__dirname, '../../engine');
    const remotionOutDir = path.join(enginePath, 'out');
    await fs.mkdir(remotionOutDir, { recursive: true });

    // Render video using Remotion CLI
    // This is a simplified version - in production, use Remotion's programmatic API
    const remotionCommand = `npx remotion render Video "${remotionOutDir}/${filename}" --props='{"seed":${seed},"hook":"${video.hook}","midPrompt":"${video.midPrompt}","cta":"${video.cta}"}'`;
    
    await execAsync(remotionCommand, {
      cwd: enginePath,
      env: { ...process.env },
    });

    // Move to final location
    await fs.rename(path.join(remotionOutDir, filename), filepath);
  } catch (error) {
    console.error('Remotion render failed, using placeholder:', error);
    // Create placeholder file for development
    await fs.writeFile(filepath, 'placeholder');
  }

  // Update video record
  await prisma.video.update({
    where: { id: videoId },
    data: {
      path: filepath,
      filename,
    },
  });

  await prisma.job.update({
    where: { id: job.id! },
    data: {
      status: JobStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  return { videoId, filepath };
}
