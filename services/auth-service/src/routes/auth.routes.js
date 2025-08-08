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
import { NotFoundError } from '../utils/errors.js';

export default fp(async (fastify) => {
  /**
   * @swagger
   * tags:
   *   name: Auth
   *   description: Endpoints for user registration, login, and token management
   */

  // Register
  fastify.post('/auth/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register new user',
      description: 'Creates a new user account with email, username, pinCode and password.',
      body: {
        type: 'object',
        required: ['email', 'username', 'password', 'pinCode'],
        properties: {
          email: { type: 'string', format: 'email' },
          username: { type: 'string', pattern: '^[a-zA-Z][a-zA-Z0-9._-]{5,19}$' },
          password: { type: 'string', pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,72}$' },
          pinCode: { type: 'string', pattern: '^\d{4}$' },
        },
      },
      response: {
        201: {
          description: 'User successfully registered',
          $ref: 'publicUser#'
        }
      }
    }
  }, async (req, reply) => {
    const user = await registerUser(req.body.email, req.body.password);
    return reply.code(201).send(user);
  });

  // Login
  fastify.post('/auth/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login user',
      description: 'Authenticates a user using email/username and password.',
      body: {
        type: 'object',
        required: ['indentifier', 'password'],
        properties: {
          indentifier: { type: 'string' }, // can be email or username
          password: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Successful login with tokens and user info',
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            user: { $ref: 'publicUser#' }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { accessToken, refreshToken, user } = await authenticateUser(
      req.body.indentifier,
      req.body.password,
    );
    return { accessToken, refreshToken, user };
  });

  // Refresh token
  fastify.post('/auth/refresh', {
    schema: {
      tags: ['Auth'], 
      summary: 'Refresh tokens',
      description: 'Rotates tokens using a valid refresh token.',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'New tokens issued',
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { accessToken, refreshToken } = await rotateTokens(
      req.body.refreshToken,
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    );
    return { accessToken, refreshToken };
  });

  // Logout
  fastify.post('/auth/logout', {
    schema: {
      tags: ['Auth'],
      summary: 'Logout user',
      description: 'Revokes the provided refresh token.',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' }
        }
      },
      response: {
        204: { description: 'Successfully logged out', type: 'null' }
      }
    }
  }, async (req, reply) => {
    await revokeRefreshToken(req.body.refreshToken);
    return reply.code(204).send();
  });

  // Profile
  fastify.get('/auth/profile', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['Auth'],
      summary: 'Get user profile',
      description: 'Returns the authenticated user\'s profile.',
      response: {
        200: {
          description: 'User profile details',
          $ref: 'publicUser#'
        }
      }
    }
  }, async (req, reply) => {
    const user = await getUserById(req.user.id);
    if (!user) throw new NotFoundError('User not found');
    return user;
  });
});
