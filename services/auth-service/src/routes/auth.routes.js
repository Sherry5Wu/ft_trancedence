import fp from 'fastify-plugin';
import {
  registerUser,
  authenticateUser,
  getUserById,
} from '../services/auth.service.js';
import {
  rotateTokens,
  revokeRefreshToken,
} from '../services/jwt.service.js';
import { AuthenticationError } from '../utils/errors.js';

export default fp(async (fastify) => {
  // Register (email + password)
  fastify.post('auth/register', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8, maxLength: 32 },
      }},
      response: { 201: { $ref: 'User#' } }
    }
  }, async (req, reply) => {
    const user = await registerUser(req.body.email, req.body.password);
    return reply.code(201).send(user);
  });


// Login (email + password)
  fastify.post('auth/login', {
    schema: {
      body: {
        type: 'object',
        reuired: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        }
      },
      response: { 200: { type: 'object', properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        user: { $ref: 'User#' },
      }}},
    }
  }, async (req, reply) => {
    const { accessToken, refreshToken, user } = await authenticateUser(
      req.body.email,
      req.body.password,
    );

    return { accessToken, refreshToken, user };
  });

  // Refresh token
  fastify.post('auth/refresh', {
    schema: {
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: { refreshToken: { type: 'string' } },
      },
      response: { 200: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
        }
      }}
    }
  }, async (req, reply) => {
    const { accessToken, refreshToken } = await rotateTokens(
      req.body.refreshToken,
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    );
    return { accessToken, refreshToken };
  });

  // Logout (revoke a single refresh token)
  fastify.post('auth/logout',{
    schema: {
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' }
        }
      },
      response: { 204: { type: 'null' } }
    }
  }, async (req, reply) => {
    await revokeRefreshToken(req.body.refreshToken);
    return reply.code(204).send();
  });

  // Get current user's profile
  fastify.get('auth/profile', {
    preHandler: [fastify.authenticate],
    reponse: { 200: { $ref: 'User#' } }
  }, async (req, reply) => {
    const user = await getUserById(req.user.id);
    if (!user)  throw new AuthenticationError('User not found');
    return user;
  });
});
