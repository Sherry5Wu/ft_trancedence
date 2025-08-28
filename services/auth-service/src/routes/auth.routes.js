import fp from 'fastify-plugin';
import {
  registerUser,
  authenticateUser,
  getUserById,
  getUserByUsername,
  getUserByIdentifier,
} from '../services/auth.service.js';
import {
  rotateTokens,
  revokeRefreshToken,
} from '../services/jwt.service.js';
import { InvalidCredentialsError, ValidationError, ConflictError, NotFoundError } from '../utils/errors.js';
import { sendError } from '../utils/sendError.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie } from '../utils/authCookie.js';
import { userLogin } from '../services/google-auth.service.js';

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
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            userId: { type: 'string' },
          }
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
      return reply.code(201).send({ success: true, userId: user.id });
    } catch (err) {
      if (err instanceof InvalidCredentialsError) return sendError(reply, 400, 'Bad request', err.message);
      if (err instanceof ConflictError) return sendError(reply, 409, 'Conflict error', err.message);
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
            success: { type: 'boolean' },
            code: { type: 'string' },
            matched: { type: 'string' }, // does the username/email matches with password
            TwoFA: { type: 'boolean' },
            accessToken: { type: 'string' },
            userId: { type: 'string' },
            user: { $ref: 'publicUser#' },
          }
        },
        400: { description:'Bad Request', $ref: 'errorResponse#' },
        404: { description: 'Not found', $ref: 'errorResponse#' },
        // 500: { description:'Server Internal Error',$ref: 'errorResponse#' },
      }
    }
  }, async (req, reply) => {
    try {
      const { matched, TwoFA, existingUser } = await authenticateUser(req.body.identifier, req.body.password);
      // return the doesn't match information
      if (matched === false) {
        return reply.code(200).send({ success: true, code: 'PASSWORD_NOT_MATCH' });
      }
      // TwoFAStatus disable, normal login, return accessToken and publicUser information
      if (matched === true && TwoFA === false) {
        const { accessToken, refreshToken, publicUser } = await userLogin(existingUser);

        const user = {
          id: publicUser.id,
          username: publicUser.username,
          avatarUrl: publicUser.avatarUrl || null,
          TwoFAStatus: !!(publicUser.is2FAEnabled && publicUser.is2FAConfirmed),
          registerFromGoogle: !!publicUser.googleId,
        };

        // Set refreshToken cookie  uncomment it
        setRefreshTokenCookie(reply, refreshToken);
        return reply.code(200).send({
          success: true,
          code: 'PASSWORD_MATCH_2FA_DISABLE',
          matched,
          TwoFA,
          accessToken,
          user,
        });
      }

      // TwoFAStatus enables, need verify the 2FA before normal login
      if (matched === true && TwoFA === true) {
        return reply.code(200).send({
          success: true,
          code: 'PASSWORD_MATCH_2FA-ENABLE',
          matched,
          TwoFA,
          userId: existingUser.id,
        });
      }

    } catch (err) {
      if (err instanceof InvalidCredentialsError) return sendError(reply, 400, 'Bad request', err.message);
      if (err instanceof NotFoundError) return sendError(reply, 404, 'Not found', err.message);
      fastify.log.error(err);
      return sendError(reply, 500, err.name || 'Internal Server Error', err.message);
    }
  });

  // ---------------- Refresh Token ----------------
  fastify.post('/auth/refresh', {
    schema: {
      tags: ['Auth'],
      summary: 'Rotate tokens (cookie-based)',
      description: 'Rotate access and refresh tokens using refresh token cookie.',
      response: {
        200: {
          description: 'New tokens set in cookies',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            accessToken: { type: 'string' },
            user: { type: 'object', $ref: 'publicUser#' },
          }
        },
        401: { $ref: 'errorResponse#' },
        500: { $ref: 'errorResponse#' }
      }
    }
  }, async (req, reply) => {
  try {
      // Read refresh token from cookie
      const refreshToken = req.cookies?.['__Host-refreshToken'] || null;
      if (!refreshToken) {
        return sendError(reply, 401, 'Unauthorized', 'Missing refresh token cookie');
      }

      // rotateTokens must validate the refresh token, rotate (issue new access + refresh)
      // and return { accessToken, refreshToken: newRefreshToken }
      const { accessToken, newRefreshToken, user } = await rotateTokens(
        refreshToken,
        { ipAddress: req.ip, userAgent: req.headers['user-agent'] }
      );
      setRefreshTokenCookie(reply, newRefreshToken);
      return reply.send({ success: true, accessToken, user });
    } catch (err) {
      if (err instanceof InvalidCredentialsError) sendError(reply, 400, 'Bad Request', err.message);
      if (err instanceof NotFoundError) sendError(reply, 404, 'Not Found', err.message);
      // rotateTokens should throw for invalid/expired refresh token
      return sendError(reply, reply.statusCode || 500, 'Internal Server Error', err.message);
    }
  });

  // ---------------- Logout ----------------
  fastify.post('/auth/logout', {
  schema: {
    tags: ['Auth'],
    summary: 'Logout user',
    description: 'Revokes refresh token (from cookie) and clears auth cookies.',
    response: {
      204: { description: 'Successfully logged out', type: 'null' },
      400: { $ref: 'errorResponse#' },
      500: { $ref: 'errorResponse#' },
    }
  }
}, async (req, reply) => {
  try {
    // Read refresh token from HttpOnly cookie
   const refreshToken = req.cookies?.['__Host-refreshToken'] || null;

    // If present, revoke it server-side (rotate/blacklist DB, etc.)
    if (refreshToken) {
      await revokeRefreshToken(refreshToken);
    } else {
      return sendError(reply, 400, 'Bad Request', 'There is no refreshToken');
    }

    // Clear both access and refresh cookies
    clearRefreshTokenCookie(reply, false); // clear __Host-refreshToken

    return reply.code(204).send();
  } catch (err) {
    return sendError(
      reply,
      err.statusCode || 500,
      err.name || 'Internal Server Error',
      err.message || 'Logout failed'
    );
  }
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
