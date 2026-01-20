import { FastifyInstance } from 'fastify';
import fastifyOauth2 from '@fastify/oauth2';
import { config } from '../config';
import { prisma } from '../db';
import { encrypt } from '../utils/encryption';
import { signToken } from '../utils/jwt';

export async function authRoutes(fastify: FastifyInstance) {
  // Register OAuth2 plugin
  await fastify.register(fastifyOauth2, {
    name: 'tiktokOauth2',
    credentials: {
      client: {
        id: config.tiktok.clientKey,
        secret: config.tiktok.clientSecret,
      },
      auth: {
        authorizeHost: 'https://www.tiktok.com',
        authorizePath: '/v2/auth/authorize/',
        tokenHost: 'https://open.tiktokapis.com',
        tokenPath: '/v2/oauth/token/',
      },
    },
    startRedirectPath: '/api/auth/tiktok',
    callbackUri: config.tiktok.redirectUri,
    scope: ['user.info.basic', 'video.upload', 'video.publish'],
  });

  // Start OAuth flow
  fastify.get('/api/auth/tiktok', async (request, reply) => {
    return fastify.tiktokOauth2.generateAuthorizationUri(request, reply);
  });

  // OAuth callback
  fastify.get('/api/auth/tiktok/callback', async (request, reply) => {
    try {
      const token = await fastify.tiktokOauth2.getAccessTokenFromAuthorizationCodeFlow(request, reply);
      
      if (!token.token.access_token) {
        return reply.redirect(`${config.baseUrl}/login?error=no_token`);
      }

      // Get user info from TikTok
      const userResponse = await fetch('https://open.tiktokapis.com/v2/user/info/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token.token.access_token}`,
        },
      });

      if (!userResponse.ok) {
        return reply.redirect(`${config.baseUrl}/login?error=user_info_failed`);
      }

      const userData = await userResponse.json();
      const tiktokUserId = userData.data?.user?.open_id;
      const email = userData.data?.user?.email_address;

      if (!tiktokUserId) {
        return reply.redirect(`${config.baseUrl}/login?error=no_user_id`);
      }

      // Find or create user
      let user = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { id: tiktokUserId },
          ],
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: tiktokUserId,
            email: email || undefined,
            name: userData.data?.user?.display_name || undefined,
          },
        });
      }

      // Store encrypted tokens
      const expiresAt = new Date(Date.now() + (token.token.expires_in || 3600) * 1000);
      
      await prisma.tikTokToken.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          accessToken: encrypt(token.token.access_token, config.encryption.key),
          refreshToken: encrypt(token.token.refresh_token || '', config.encryption.key),
          expiresAt,
          scope: token.token.scope || [],
        },
        update: {
          accessToken: encrypt(token.token.access_token, config.encryption.key),
          refreshToken: encrypt(token.token.refresh_token || '', config.encryption.key),
          expiresAt,
          scope: token.token.scope || [],
        },
      });

      // Sign JWT
      const jwtToken = signToken({ userId: user.id, email: user.email || undefined });

      // Redirect to studio with token
      return reply.redirect(`${config.baseUrl}/?token=${jwtToken}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      return reply.redirect(`${config.baseUrl}/login?error=callback_failed`);
    }
  });
}
