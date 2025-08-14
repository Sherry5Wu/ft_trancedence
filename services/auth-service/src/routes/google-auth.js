import fp from 'fastify-plugin';
import { models } from '../db/index.js';
import { createTokens } from '../services/jwt.service.js';

const { User } = models;

export default fp(async (fastify) => {
  /**
   * @swagger
   * tags:
   *   name: GoogleAuth
   *   description: Google OAuth 2.0 authentication
   */

  // Redirect to Google OAuth2
  fastify.get('/auth/google', {
    schema: {
      tags: ['GoogleAuth'],
      summary: 'Redirect to Google OAuth2',
      description: 'Redirects the user to Google for OAuth2 authentication.',
      response: {
        302: { description: 'Redirect to Google OAuth consent screen' }
      }
    }
  }, async (req, reply) => {
    const url = fastify.googleOAuth2.generateAuthorizationUrl(
      fastify.config.GOOGLE_CALLBACK_URL
    );
    reply.redirect(url);
  });

  // Google callback
  fastify.get('/auth/google/callback', {
    schema: {
      tags: ['GoogleAuth'],
      summary: 'Google OAuth callback',
      description: 'Handles the Google OAuth2 callback and returns JWT tokens and user info.',
      querystring: {
        type: 'object',
        properties: {
          code: { type: 'string', description: 'Authorization code returned by Google' },
          state: { type: 'string', description: 'Optional state parameter' }
        },
        required: ['code']
      },
      response: {
        200: {
          description: 'JWT tokens and user info after successful Google authentication',
          type: 'object',
          properties: {
            accessToken: { type: 'string', description: 'JWT access token' },
            refreshToken: { type: 'string', description: 'JWT refresh token' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                email: { type: 'string', format: 'email' },
                isVerified: { type: 'boolean' },
                googleId: { type: 'string' },
                is2FAEnabled: { type: 'boolean' }
              }
            }
          }
        }
      }
    }
  }, async (req, reply) => {
    const token = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);
    const userInfo = await fastify.googleOAuth2.getUserInfo(token);

    let user = await User.findOne({ where: { googleId: userInfo.sub } });
    if (!user) {
      user = await User.create({
        email: userInfo.email,
        googleId: userInfo.sub,
        isVerified: true,
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      is2FAEnabled: !!user.twoFASecret,
    };

    const tokens = await createTokens(payload, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        isVerified: user.isVerified,
        googleId: user.googleId,
        is2FAEnabled: !!user.twoFASecret
      }
    };
  });
});
