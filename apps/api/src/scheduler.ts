import { Queue, QueueScheduler } from 'bullmq';
import { connection } from './queues';
import { uploadQueue } from './queues';
import { prisma } from './db';
import { PostStatus } from '@dopamine-orbs/shared';

// Queue scheduler for delayed jobs
const scheduler = new QueueScheduler('scheduled-posts', { connection });

export async function processScheduledPosts() {
  const now = new Date();
  
  // Find posts scheduled for now or in the past
  const posts = await prisma.scheduledPost.findMany({
    where: {
      status: PostStatus.SCHEDULED,
      scheduledAt: {
        lte: now,
      },
    },
    include: {
      video: true,
    },
  });

  console.log(`Found ${posts.length} posts to publish`);

  for (const post of posts) {
    try {
      // Update status
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: { status: PostStatus.UPLOADING },
      });

      // Queue upload job
      await uploadQueue.add(
        'upload',
        {
          userId: post.userId,
          videoId: post.videoId,
          mode: post.mode,
          caption: post.caption,
          hashtags: post.hashtags,
          postId: post.id,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        }
      );

      console.log(`Queued post ${post.id} for upload`);
    } catch (error) {
      console.error(`Failed to queue post ${post.id}:`, error);
      await prisma.scheduledPost.update({
        where: { id: post.id },
        data: {
          status: PostStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }
}

// Run every minute
export function startScheduler() {
  console.log('📅 Scheduler started');
  
  // Run immediately
  processScheduledPosts();
  
  // Then every minute
  setInterval(() => {
    processScheduledPosts();
  }, 60 * 1000);
}
