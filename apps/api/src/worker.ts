import { Worker } from 'bullmq';
import { connection } from './queues';
import { JobType, JobStatus } from '@dopamine-orbs/shared';
import { prisma } from './db';
import { generateJobProcessor } from './jobs/generate';
import { renderJobProcessor } from './jobs/render';
import { uploadJobProcessor } from './jobs/upload';
import { publishJobProcessor } from './jobs/publish';
import { startScheduler } from './scheduler';

// Generate worker
const generateWorker = new Worker(JobType.GENERATE, generateJobProcessor, {
  connection,
  concurrency: 2,
});

generateWorker.on('completed', async (job) => {
  console.log(`✅ Generate job ${job.id} completed`);
});

generateWorker.on('failed', async (job, err) => {
  console.error(`❌ Generate job ${job.id} failed:`, err);
  if (job) {
    await prisma.job.update({
      where: { id: job.id! },
      data: { status: JobStatus.FAILED, error: err.message },
    });
  }
});

// Render worker
const renderWorker = new Worker(JobType.RENDER, renderJobProcessor, {
  connection,
  concurrency: 1, // Limit concurrency for video rendering
});

renderWorker.on('completed', async (job) => {
  console.log(`✅ Render job ${job.id} completed`);
});

renderWorker.on('failed', async (job, err) => {
  console.error(`❌ Render job ${job.id} failed:`, err);
  if (job) {
    await prisma.job.update({
      where: { id: job.id! },
      data: { status: JobStatus.FAILED, error: err.message },
    });
  }
});

// Upload worker
const uploadWorker = new Worker(JobType.UPLOAD, uploadJobProcessor, {
  connection,
  concurrency: 1, // Limit to respect rate limits
});

uploadWorker.on('completed', async (job) => {
  console.log(`✅ Upload job ${job.id} completed`);
});

uploadWorker.on('failed', async (job, err) => {
  console.error(`❌ Upload job ${job.id} failed:`, err);
  if (job) {
    await prisma.job.update({
      where: { id: job.id! },
      data: { status: JobStatus.FAILED, error: err.message },
    });
  }
});

// Publish worker
const publishWorker = new Worker(JobType.PUBLISH, publishJobProcessor, {
  connection,
  concurrency: 1,
});

publishWorker.on('completed', async (job) => {
  console.log(`✅ Publish job ${job.id} completed`);
});

publishWorker.on('failed', async (job, err) => {
  console.error(`❌ Publish job ${job.id} failed:`, err);
  if (job) {
    await prisma.job.update({
      where: { id: job.id! },
      data: { status: JobStatus.FAILED, error: err.message },
    });
  }
});

// Start scheduler
startScheduler();

console.log('👷 Workers started');
