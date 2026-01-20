import { Job } from 'bullmq';
import { prisma } from '../db';
import { JobStatus, JobType } from '@dopamine-orbs/shared';
import { generateSeed } from '@dopamine-orbs/shared';

export async function generateJobProcessor(job: Job) {
  const { userId, config } = job.data as {
    userId: string;
    config: { theme?: string; intensity?: number };
  };

  // Create or update job record
  let jobRecord = await prisma.job.findUnique({ where: { id: job.id! } });
  if (!jobRecord) {
    jobRecord = await prisma.job.create({
      data: {
        id: job.id!,
        type: JobType.GENERATE,
        status: JobStatus.PROCESSING,
        userId,
        data: config,
      },
    });
  } else {
    await prisma.job.update({
      where: { id: job.id! },
      data: { status: JobStatus.PROCESSING },
    });
  }

  // Generate seed
  const seed = generateSeed();

  // Create video record (will be updated after render)
  const video = await prisma.video.create({
    data: {
      userId,
      seed,
      filename: `video_${seed}.mp4`,
      path: '', // Will be set after render
      duration: 65000,
      title: `Dopamine Orbs #${seed}`,
      hook: 'WAIT FOR THE END 😳',
      midPrompt: 'BLUE or PINK? 👇',
      cta: 'Follow for Level 2 👀',
      hashtags: ['#dopamine', '#satisfying', '#fyp'],
    },
  });

  // Queue render job
  const { renderQueue } = await import('../queues');
  await renderQueue.add('render', {
    userId,
    videoId: video.id,
    seed,
    config,
  });

  await prisma.job.update({
    where: { id: job.id! },
    data: {
      status: JobStatus.COMPLETED,
      videoId: video.id,
      completedAt: new Date(),
    },
  });

  return { videoId: video.id, seed };
}
