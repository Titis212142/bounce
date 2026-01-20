import { FastifyInstance } from 'fastify';
import { prisma } from '../db';
import { verifyToken } from '../utils/jwt';
import { generateQueue } from '../queues';
import { JobType, JobStatus } from '@dopamine-orbs/shared';

async function authenticate(request: any) {
  const token = request.headers.authorization?.replace('Bearer ', '') || 
                request.query.token as string;
  if (!token) {
    throw new Error('No token provided');
  }
  return verifyToken(token);
}

export async function videoRoutes(fastify: FastifyInstance) {
  // Generate videos
  fastify.post('/api/generate', async (request, reply) => {
    try {
      const { userId } = await authenticate(request);
      const body = request.body as { count?: number; theme?: string; intensity?: number };
      
      const count = body.count || 1;
      const theme = body.theme || 'default';
      const intensity = body.intensity || 0.5;

      const jobs = [];
      for (let i = 0; i < count; i++) {
        const job = await generateQueue.add('generate', {
          userId,
          config: {
            theme,
            intensity,
          },
        });
        
        // Create job record
        await prisma.job.create({
          data: {
            id: job.id!,
            type: JobType.GENERATE,
            status: JobStatus.PENDING,
            userId,
            data: { theme, intensity },
          },
        });
        
        jobs.push(job.id);
      }

      return { success: true, jobIds: jobs };
    } catch (error: any) {
      return reply.code(401).send({ error: error.message });
    }
  });

  // List videos
  fastify.get('/api/videos', async (request, reply) => {
    try {
      const { userId } = await authenticate(request);
      
      const videos = await prisma.video.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      return { videos };
    } catch (error: any) {
      return reply.code(401).send({ error: error.message });
    }
  });

  // Get video by ID
  fastify.get('/api/videos/:id', async (request, reply) => {
    try {
      const { userId } = await authenticate(request);
      const { id } = request.params as { id: string };
      
      const video = await prisma.video.findFirst({
        where: { id, userId },
      });

      if (!video) {
        return reply.code(404).send({ error: 'Video not found' });
      }

      return { video };
    } catch (error: any) {
      return reply.code(401).send({ error: error.message });
    }
  });
}
