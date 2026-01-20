import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config';
import { authRoutes } from './routes/auth';
import { videoRoutes } from './routes/videos';
import { postRoutes } from './routes/posts';

const fastify = Fastify({
  logger: {
    level: config.nodeEnv === 'production' ? 'info' : 'debug',
  },
});

// CORS
await fastify.register(cors, {
  origin: config.baseUrl,
  credentials: true,
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok' };
});

// Routes
await fastify.register(authRoutes);
await fastify.register(videoRoutes);
await fastify.register(postRoutes);

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`🚀 API server listening on http://localhost:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
