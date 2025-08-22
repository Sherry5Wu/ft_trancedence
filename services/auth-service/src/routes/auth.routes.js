import fp from 'fastify-plugin';
import {
  registerUser,
  authenticateUser,
  getUserById,
  getUserByIdentifier,
} from '../services/auth.service.js';
import {
  rotateTokens,
  revokeRefreshToken,
} from '../services/jwt.service.js';
import { InvalidCredentialsError, ValidationError, ConflictError, NotFoundError } from '../utils/errors.js';
import { sendError } from '../utils/sendError.js';

export default fp(async (fastify) => {
  /**
   * @swagger
   * tags:
   *   - name: Auth
   *     description: Endpoints for user registration, login, logout, token management, and verification
   */

  // ---------------- Register ----------------
  fastify.post('/auth/register', {
    schema: {
      tags: ['Auth'],
      summary: 'Register a new user',
      description: `
        Creates a new user account.
        Required fields: email, username, password, and pinCode.
        Password must include at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character, length 8-72.
      `,
      body: {
        type: 'object',
        required: ['email', 'username', 'password', 'pinCode'],
        properties: {
          email: { type: 'string', format: 'email' },
          username: { type: 'string', pattern: '^[a-zA-Z][a-zA-Z0-9._-]{5,19}$' },
          password: {
            type: 'string',
            pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,72}$'
          },
          pinCode: { type: 'string', pattern: '^\\d{4}$' },
        },
      },
      response: {
        201: {
          description: 'User successfully registered',
          $ref: 'publicUser#'
        },
        400: { description:'Bad Request', $ref: 'errorResponse#' },
        409: { description:'Conflict', $ref: 'errorResponse' },
        500: { description:'Server Internal Error',$ref: 'errorResponse#' },
      }
    }
  }, async (req, reply) => {
    try {
      const user = await registerUser(
        req.body.email,
        req.body.username,
        req.body.password,
        req.body.pinCode
      );
      return reply.code(201).send(user);
    } catch (err) {
      if (err instanceof InvalidCredentialsError) sendError(reply, 400, 'Bad request', err.message);
      if (err instanceof ConflictError) sendError(reply, 409, 'Conflict error', err.message);
      return sendError(reply, err.statusCode || 500, err.name || 'Internal Server Error', err.message);
    }
  });

  // ---------------- Login ----------------
  fastify.post('/auth/login', {
    schema: {
      tags: ['Auth'],
      summary: 'Authenticate user',
      description: `
        Authenticates a user using email or username and password.
        Returns accessToken, refreshToken, user info, and 2FA status if enabled.
      `,
      body: {
        type: 'object',
        required: ['identifier', 'password'],
        properties: {
          identifier: { type: 'string', description: 'Email or username' },
          password: { type: 'string' },
        }
      },
      response: {
        200: {
          description: 'Successful login',
          type: 'object',
          properties: {
            accessToken: { type: 'string', description: 'JWT access token' },
            refreshToken: { type: 'string', description: 'JWT refresh token' },
            user: { $ref: 'publicUser#' },
            TwoFAStatus: { type: 'boolean', description: 'Whether 2FA is enabled and confirmed' },
          }
        },
        400: { description:'Bad Request', $ref: 'errorResponse#' },
        404: { description: 'Not found', $ref: 'errorResponse#' },
        500: { description:'Server Internal Error',$ref: 'errorResponse#' },
      }
    }
  }, async (req, reply) => {
    try {
      const { accessToken, refreshToken, user } = await authenticateUser(
        req.body.identifier,
        req.body.password
      );
      const TwoFAStatus = user.is2FAEnabled && user.is2FAConfirmed;
      return { accessToken, refreshToken, user, TwoFAStatus };
    } catch (err) {
      if (err instanceof InvalidCredentialsError) sendError(reply, 400, 'Bad request', err.message);
      if (err instanceof NotFoundError) sendError(reply, 404, 'Not found', err.message);
      return sendError(reply, err.statusCode || 500, err.name || 'Internal Server Error', err.message);
    }
  });

  // ---------------- Refresh Token ----------------
  fastify.post('/auth/refresh', {
    schema: {
      tags: ['Auth'],
      summary: 'Rotate tokens',
      description: `
        Rotates access and refresh tokens using a valid refresh token.
        Useful for maintaining session without requiring login.
      `,
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', description: 'Refresh token to rotate' },
        }
      },
      response: {
        200: {
          description: 'New access and refresh tokens',
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' }
          }
        },
        401: { $ref: 'errorResponse#' },
        500: { $ref: 'errorResponse#' },
      }
    }
  }, async (req, reply) => {
    const { accessToken, refreshToken } = await rotateTokens(
      req.body.refreshToken,
      { ipAddress: req.ip, userAgent: req.headers['user-agent'] }
    );
    return { accessToken, refreshToken };
  });

  // ---------------- Logout ----------------
  fastify.post('/auth/logout', {
    schema: {
      tags: ['Auth'],
      summary: 'Logout user',
      description: 'Revokes the provided refresh token, logging the user out.',
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: { refreshToken: { type: 'string' } },
      },
      response: {
        204: { description: 'Successfully logged out', type: 'null' },
        400: { $ref: 'errorResponse#' },
        500: { $ref: 'errorResponse#' },
      }
    }
  }, async (req, reply) => {
    await revokeRefreshToken(req.body.refreshToken);
    return reply.code(204).send();
  });

  // ---------------- Verify Token ----------------
  fastify.post('/auth/verify-token', {
    schema: {
      tags: ['Auth'],
      summary: 'Verify access token',
      description: `
        Validates JWT token for other microservices.
        Returns basic user info if token is valid.
      `,
      headers: {
        type: 'object',
        required: ['authorization'],
        properties: { authorization: { type: 'string', description: 'Bearer token' } }
      },
      response: {
        200: {
          description: 'User info from valid token',
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string' }
          }
        },
        401: { $ref: 'errorResponse#' },
        500: { $ref: 'errorResponse#' },
      }
    }
  }, async (req, reply) => {
    await fastify.authenticate(req, reply);
    return {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role || 'user'
    };
  });
});
