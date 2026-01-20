import { Queue } from 'bullmq';
import { config } from '../config';
import { JobType } from '@dopamine-orbs/shared';

export const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  ...(process.env.REDIS_URL && { url: process.env.REDIS_URL }),
};

export const generateQueue = new Queue(JobType.GENERATE, { connection });
export const renderQueue = new Queue(JobType.RENDER, { connection });
export const uploadQueue = new Queue(JobType.UPLOAD, { connection });
export const publishQueue = new Queue(JobType.PUBLISH, { connection });
