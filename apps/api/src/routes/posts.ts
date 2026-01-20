import { FastifyInstance } from 'fastify';
import { prisma } from '../db';
import { verifyToken } from '../utils/jwt';
import { uploadQueue, publishQueue } from '../queues';
import { PostMode, PostStatus } from '@dopamine-orbs/shared';

async function authenticate(request: any) {
  const token = request.headers.authorization?.replace('Bearer ', '') || 
                request.query.token as string;
  if (!token) {
    throw new Error('No token provided');
  }
  return verifyToken(token);
}

export async function postRoutes(fastify: FastifyInstance) {
  // Schedule post
  fastify.post('/api/schedule', async (request, reply) => {
    try {
      const { userId } = await authenticate(request);
      const body = request.body as {
        videoId: string;
        scheduledAt: string;
        caption: string;
        hashtags: string[];
        mode: PostMode;
      };

      const video = await prisma.video.findFirst({
        where: { id: body.videoId, userId },
      });

      if (!video) {
        return reply.code(404).send({ error: 'Video not found' });
      }

      const post = await prisma.scheduledPost.create({
        data: {
          videoId: body.videoId,
          userId,
          scheduledAt: new Date(body.scheduledAt),
          caption: body.caption,
          hashtags: body.hashtags,
          mode: body.mode,
          status: PostStatus.SCHEDULED,
        },
      });

      return { success: true, post };
    } catch (error: any) {
      return reply.code(401).send({ error: error.message });
    }
  });

  // Publish now
  fastify.post('/api/publish-now', async (request, reply) => {
    try {
      const { userId } = await authenticate(request);
      const body = request.body as {
        videoId: string;
        caption?: string;
        hashtags?: string[];
        mode: PostMode;
      };

      const video = await prisma.video.findFirst({
        where: { id: body.videoId, userId },
      });

      if (!video) {
        return reply.code(404).send({ error: 'Video not found' });
      }

      const job = await uploadQueue.add('upload', {
        userId,
        videoId: body.videoId,
        mode: body.mode,
        caption: body.caption || video.title,
        hashtags: body.hashtags || video.hashtags,
      });

      return { success: true, jobId: job.id };
    } catch (error: any) {
      return reply.code(401).send({ error: error.message });
    }
  });

  // List posts
  fastify.get('/api/posts', async (request, reply) => {
    try {
      const { userId } = await authenticate(request);
      
      const posts = await prisma.scheduledPost.findMany({
        where: { userId },
        include: { video: true },
        orderBy: { scheduledAt: 'desc' },
        take: 100,
      });

      return { posts };
    } catch (error: any) {
      return reply.code(401).send({ error: error.message });
    }
  });

  // Get jobs
  fastify.get('/api/jobs', async (request, reply) => {
    try {
      const { userId } = await authenticate(request);
      
      const jobs = await prisma.job.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });

      return { jobs };
    } catch (error: any) {
      return reply.code(401).send({ error: error.message });
    }
  });
}
