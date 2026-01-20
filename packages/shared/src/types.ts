import { z } from 'zod';

// Video generation config
export const VideoConfigSchema = z.object({
  seed: z.number().int().positive().optional(),
  intensity: z.number().min(0).max(1).default(0.5),
  theme: z.enum(['default', 'neon', 'pastel', 'dark']).default('default'),
  duration: z.number().default(65000), // 65s in ms
});

export type VideoConfig = z.infer<typeof VideoConfigSchema>;

// Job types
export enum JobType {
  GENERATE = 'generate',
  RENDER = 'render',
  UPLOAD = 'upload',
  PUBLISH = 'publish',
}

export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface Job {
  id: string;
  type: JobType;
  status: JobStatus;
  userId: string;
  videoId?: string;
  data: Record<string, unknown>;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Video metadata
export interface VideoMetadata {
  id: string;
  seed: number;
  filename: string;
  path: string;
  duration: number;
  title: string;
  hook: string;
  midPrompt: string;
  cta: string;
  hashtags: string[];
  createdAt: Date;
}

// TikTok post
export enum PostMode {
  UPLOAD_ONLY = 'upload_only',
  DIRECT_POST = 'direct_post',
}

export enum PostStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  UPLOADING = 'uploading',
  UPLOADED = 'uploaded',
  PUBLISHED = 'published',
  FAILED = 'failed',
  ACTION_REQUIRED = 'action_required',
}

export interface ScheduledPost {
  id: string;
  videoId: string;
  userId: string;
  scheduledAt: Date;
  caption: string;
  hashtags: string[];
  mode: PostMode;
  status: PostStatus;
  tiktokVideoId?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

// TikTok OAuth
export interface TikTokToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string[];
}

// Template text
export interface TextTemplates {
  hooks: string[];
  midPrompts: string[];
  ctas: string[];
  hashtags: string[];
}
