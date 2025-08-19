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
          password: {
            type: 'string',
            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,72}$' // here shold be "\\d" instead i=of "\d"
          },
          pinCode: {
            type: 'string',
            pattern: '^\\d{4}$'
          },
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
    try {
      const user = await registerUser(req.body.email, req.body.username, req.body.password, req.body.pinCode);
      return reply.code(201).send(user);
    } catch (err) {
      reply.code(err.statusCode || 500).send({ error: err.message });
    }
  });

  // Login
  fastify.post('/auth/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Login user',
      description: 'Authenticates a user using email/username and password.',
      body: {
        type: 'object',
        required: ['identifier', 'password'],
        properties: {
          identifier: { type: 'string' }, // can be email or username
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
    console.log('Request body:', req.body); // for testing  only
    try {
      const { accessToken, refreshToken, user } = await authenticateUser(
        req.body.identifier,
        req.body.password,
      );
      return { accessToken, refreshToken, user };
    } catch (err) {
      console.error('Login error:', err); // for testing only
      reply.code(err.statusCode || 500).send({ error: err.message });
    }
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

  // Token Verification for Microservices
  fastify.post('/auth/verify-token', {
    schema: {
      tags: ['Auth'],
      summary: 'Verify access token',
      description: 'Validates JWT token for other microservices',
      headers: {
        type: 'object',
        properties: {
          authorization: { type: 'string' }
        },
        required: ['authorization']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' },
            username: { type: 'string'}
          }
        }
      }
    }
  }, async (req, reply) => {
    await fastify.authenticate(req, reply);
    console.log(req.user.username);
    return {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role || 'user'
    };
  });
});
