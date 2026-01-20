import { Job } from 'bullmq';
import { prisma } from '../db';
import { JobStatus, PostStatus, JobType } from '@dopamine-orbs/shared';
import { config } from '../config';
import { decrypt } from '../utils/encryption';
import fs from 'fs/promises';

export async function uploadJobProcessor(job: Job) {
  const { userId, videoId, mode, caption, hashtags, postId } = job.data as {
    userId: string;
    videoId: string;
    mode: string;
    caption: string;
    hashtags: string[];
    postId?: string;
  };

  // Create or update job record
  let jobRecord = await prisma.job.findUnique({ where: { id: job.id! } });
  if (!jobRecord) {
    jobRecord = await prisma.job.create({
      data: {
        id: job.id!,
        type: JobType.UPLOAD,
        status: JobStatus.PROCESSING,
        userId,
        videoId,
        data: { mode, caption, hashtags },
      },
    });
  } else {
    await prisma.job.update({
      where: { id: job.id! },
      data: { status: JobStatus.PROCESSING },
    });
  }

  // Get video
  const video = await prisma.video.findUnique({
    where: { id: videoId },
  });

  if (!video) {
    throw new Error('Video not found');
  }

  // Get TikTok token
  const tokenRecord = await prisma.tikTokToken.findUnique({
    where: { userId },
  });

  if (!tokenRecord) {
    throw new Error('TikTok token not found');
  }

  // Check if token expired
  if (tokenRecord.expiresAt < new Date()) {
    // TODO: Refresh token
    throw new Error('TikTok token expired');
  }

  const accessToken = decrypt(tokenRecord.accessToken, config.encryption.key);

  // Read video file
  let videoBuffer: Buffer;
  try {
    videoBuffer = await fs.readFile(video.path);
  } catch (error) {
    throw new Error(`Failed to read video file: ${error}`);
  }

  // Upload to TikTok
  // Step 1: Initialize upload
  const initResponse = await fetch(`${config.tiktok.apiBaseUrl}/v2/post/publish/inbox/video/init/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      post_info: {
        title: caption,
        privacy_level: 'PUBLIC_TO_EVERYONE',
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: {
        source: 'FILE_UPLOAD',
      },
    }),
  });

  if (!initResponse.ok) {
    const error = await initResponse.text();
    throw new Error(`TikTok init failed: ${error}`);
  }

  const initData = await initResponse.json();
  const uploadUrl = initData.data?.upload_url;
  const publishId = initData.data?.publish_id;

  if (!uploadUrl || !publishId) {
    throw new Error('Invalid TikTok init response');
  }

  // Step 2: Upload video file
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'video/mp4',
    },
    body: videoBuffer,
  });

  if (!uploadResponse.ok) {
    const error = await uploadResponse.text();
    throw new Error(`TikTok upload failed: ${error}`);
  }

  // Step 3: Publish (if direct_post mode)
  if (mode === 'direct_post') {
    const publishResponse = await fetch(`${config.tiktok.apiBaseUrl}/v2/post/publish/status/fetch/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publish_id: publishId,
      }),
    });

    if (!publishResponse.ok) {
      // May require user action
      if (postId) {
        await prisma.scheduledPost.update({
          where: { id: postId },
          data: { status: PostStatus.ACTION_REQUIRED },
        });
      }
      throw new Error('Publish may require user action');
    }
  }

  // Update post status
  if (postId) {
    await prisma.scheduledPost.update({
      where: { id: postId },
      data: {
        status: mode === 'direct_post' ? PostStatus.PUBLISHED : PostStatus.UPLOADED,
        tiktokVideoId: publishId,
      },
    });
  }

  await prisma.job.update({
    where: { id: job.id! },
    data: {
      status: JobStatus.COMPLETED,
      completedAt: new Date(),
    },
  });

  return { publishId, mode };
}
