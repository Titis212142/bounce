import { Job } from 'bullmq';
import { prisma } from '../db';
import { JobStatus, PostStatus, JobType } from '@dopamine-orbs/shared';
import { config } from '../config';
import { decrypt } from '../utils/encryption';

export async function publishJobProcessor(job: Job) {
  const { userId, publishId } = job.data as {
    userId: string;
    publishId: string;
  };

  // Create or update job record
  let jobRecord = await prisma.job.findUnique({ where: { id: job.id! } });
  if (!jobRecord) {
    jobRecord = await prisma.job.create({
      data: {
        id: job.id!,
        type: JobType.PUBLISH,
        status: JobStatus.PROCESSING,
        userId,
        data: { publishId },
      },
    });
  } else {
    await prisma.job.update({
      where: { id: job.id! },
      data: { status: JobStatus.PROCESSING },
    });
  }

  // Get TikTok token
  const tokenRecord = await prisma.tikTokToken.findUnique({
    where: { userId },
  });

  if (!tokenRecord) {
    throw new Error('TikTok token not found');
  }

  const accessToken = decrypt(tokenRecord.accessToken, config.encryption.key);

  // Check publish status
  const statusResponse = await fetch(`${config.tiktok.apiBaseUrl}/v2/post/publish/status/fetch/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      publish_id: publishId,
    }),
  });

  if (!statusResponse.ok) {
    throw new Error('Failed to check publish status');
  }

  const statusData = await statusResponse.json();
  const status = statusData.data?.status;

  if (status === 'PUBLISHED') {
    await prisma.scheduledPost.updateMany({
      where: { tiktokVideoId: publishId },
      data: { status: PostStatus.PUBLISHED },
    });
  } else if (status === 'PROCESSING') {
    // Still processing, reschedule check
    throw new Error('Still processing');
  } else {
    await prisma.scheduledPost.updateMany({
      where: { tiktokVideoId: publishId },
      data: { status: PostStatus.ACTION_REQUIRED },
    });
  }

  await prisma.job.update({
    where: { id: job.id! },
    data: {
      status: JobStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  return { publishId, status };
}
