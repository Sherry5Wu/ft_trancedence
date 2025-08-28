import fp from 'fastify-plugin';
import {
  generateTwoFASetup,
  verifyTwoFAToken,
  generateTwoFAQrCode,
  consumeBackupCode,
  disableTwoFA as disableTwoFAService,
  getTwoFAStatus
} from '../services/2fa.service.js';
import { ValidationError, NotFoundError } from '../utils/errors.js';
import { sendError } from '../utils/sendError.js';
import { models } from '../db/index.js';
import { authenticateUser, getUserById } from '../services/auth.service.js';
import refreshToken from '../db/models/refreshToken.js';
import { userLogin, } from '../services/google-auth.service.js';
import { storeRefreshTokenHash } from '../utils/jwt.js';

const { User } = models;

export default fp(async (fastify) => {
  /**
   * @swagger
   * tags:
   *   name: TwoFactorAuth
   *   description: Endpoints for Two-Factor Authentication (2FA) setup and management
   */

  /**
  * @route   POST /2fa/setup
  * @desc    Enable the 2FA for user. Generate qrCode, secret, otpauthUrl, backupCodes
  * storing in DB.
  */
  fastify.post('/2fa/setup', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['TwoFactorAuth'],
      summary: 'Setup 2FA',
      description: 'Generates a secret, otpauth URL, QR code, and backup codes for enabling 2FA.',
      response: {
        200: {
          description: '2FA setup details including QR code and backup codes',
          type: 'object',
          required: ['secret', 'otpauthUrl', 'qrCode', 'backupCodes'],
          properties: {
            secret: { type: 'string' },
            otpauthUrl: { type: 'string' },
            qrCode: { type: 'string' },
            backupCodes: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        },
        400: { description: 'Bad Request', $ref: 'errorResponse#' },
        401: { description: 'Unauthorized', $ref: 'errorResponse#' },
        403: { description: 'Forbidden', $ref: 'errorResponse#' },
        409: { description: 'Conflict (2FA already enabled)', $ref: 'errorResponse#' },
        500: { description: 'Internal Server Error', $ref: 'errorResponse#' },
      }
    }
  }, async (req, reply) => {
    try {
      // if req.user exists(not null or undefined), then take its '.id'
      // '?' optional chainning
      const userId = req.user?.id;
      if (!userId) {
        return sendError(reply, 401, 'Unauthorized', 'Missing or invalid authentication token');
      }

      // If user already has 2FA enabled, return 409 Conflict
      const already = await getTwoFAStatus(userId);
      if (already) {
        return sendError(reply, 409, 'Conflict', '2FA is already enabled for this user');
      }

      // generateTwoFASetup will persist the secret and hashed backup codes and return plain backup codes
      const { secret, otpauthUrl, backupCodes } = await generateTwoFASetup(userId);

      // generate qr code (data URL)
      const qrCode = await generateTwoFAQrCode(otpauthUrl);

      // Return setup info (frontend must display QR + backup codes and prompt user to confirm)
      return { secret, otpauthUrl, qrCode, backupCodes };
    } catch (err) {
      if (err instanceof NotFoundError) {
        return sendError(reply, 404, 'Not Found', err.message);
      }
      if (err instanceof ValidationError) {
        // validation error from service (e.g. "2FA already enabled") -> map to 400 or 409 depending on message
        // We already check for existing 2FA above; treat as Bad Request by default
        return sendError(reply, 400, 'Bad Request', err.message);
      }
      // unexpected
      fastify.log.error(err);
      return sendError(reply, 500, 'Internal Server Error', 'Something went wrong');
    }
  });

  /**
  * @route   POST /2fa/confirmaiton
  * @desc    In the 2fa setup flow, to confirm the 2fa works properly.
  */
  fastify.post('/2fa/confirmation', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['TwoFactorAuth'],
      summary: 'Confirm 2FA TOTP',
      description: 'Verifies a 6-digit TOTP code and enables 2FA for the user. For 2FA setup flow',
      body: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string', pattern: '^[0-9]{6}$', description: '6-digit TOTP code' }
        }
      },
      response: {
        200: {
          description: 'Verification result',
          type: 'object',
          required: ['verified'],
          properties: { verified: { type: 'boolean' } },
        },
        400: { description: 'Bad Request', $ref: 'errorResponse#' },
        401: { description: 'Unauthorized', $ref: 'errorResponse#' },
        404: { description: 'Not Found', $ref: 'errorResponse#' },
        500: { description: 'Internal Server Error', $ref: 'errorResponse#' },
      }
    }
  }, async (req, reply) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(reply, 401, 'Unauthorized', 'Missing or invalid authentication token');
      }

      const ok = await verifyTwoFAToken(userId, req.body.token);
      if (!ok) {
        throw new ValidationError('Invalid 2FA token');
      }

      // Set is2FAConfirmed Flag to true
      await User.update(
        { is2FAConfirmed: true },
        { where: { id: userId } },
      );

      return { verified: true };
    } catch (err) {
      if (err instanceof NotFoundError) {
        return sendError(reply, 404, 'Not Found', err.message);
      }
      if (err instanceof ValidationError) {
        return sendError(reply, 400, 'Bad Request', err.message);
      }
      fastify.log.error(err);
      return sendError(reply, 500, 'Internal Server Error', 'Something went wrong');
    }
  });

  /**
  * @route   POST /2fa/confirmaiton
  * @desc    In the 2fa setup flow, to confirm the 2fa works properly.
  */
  fastify.post('/2fa/confirmation', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['TwoFactorAuth'],
      summary: 'Confirm 2FA TOTP',
      description: 'Verifies a 6-digit TOTP code and enables 2FA for the user. For 2FA setup flow',
      body: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string', pattern: '^[0-9]{6}$', description: '6-digit TOTP code' }
        }
      },
      response: {
        200: {
          description: 'Verification result',
          type: 'object',
          required: ['verified'],
          properties: { verified: { type: 'boolean' } },
        },
        400: { description: 'Bad Request', $ref: 'errorResponse#' },
        401: { description: 'Unauthorized', $ref: 'errorResponse#' },
        404: { description: 'Not Found', $ref: 'errorResponse#' },
        500: { description: 'Internal Server Error', $ref: 'errorResponse#' },
      }
    }
  }, async (req, reply) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(reply, 401, 'Unauthorized', 'Missing or invalid authentication token');
      }

      const ok = await verifyTwoFAToken(userId, req.body.token);
      if (!ok) {
        throw new ValidationError('Invalid 2FA token');
      }

      // Set is2FAConfirmed Flag to true
      await User.update(
        { is2FAConfirmed: true },
        { where: { id: userId } },
      );

      return { verified: true };
    } catch (err) {
      if (err instanceof NotFoundError) {
        return sendError(reply, 404, 'Not Found', err.message);
      }
      if (err instanceof ValidationError) {
        return sendError(reply, 400, 'Bad Request', err.message);
      }
      fastify.log.error(err);
      return sendError(reply, 500, 'Internal Server Error', 'Something went wrong');
    }
  });

  /**
  * @route   POST /2fa/verification
  * @desc    For login flow, to verify the 2fa if the user enables it.
  * @return  If success, return accessToken and user information
  */
  fastify.post('/2fa/verification', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['TwoFactorAuth'],
      summary: 'Verify 2FA TOTP',
      description: 'Verifies a 6-digit TOTP code and enables 2FA for the user, for login flow.',
      body: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string', pattern: '^[0-9]{6}$', description: '6-digit TOTP code' }
        }
      },
      response: {
        200: {
          description: 'Verification result',
          type: 'object',
          required: ['success', 'code', 'accessToken', 'user'],
          properties: {
            success: { type: 'boolean' },
            code: { type: 'string' },
            accessToken: { type: 'string' },
            user: { type: 'object', $ref: 'publicUser#' }
          },
        },
        400: { description: 'Bad Request', $ref: 'errorResponse#' },
        401: { description: 'Unauthorized', $ref: 'errorResponse#' },
        404: { description: 'Not Found', $ref: 'errorResponse#' },
        500: { description: 'Internal Server Error', $ref: 'errorResponse#' },
      }
    }
  }, async (req, reply) => {
    const ip = req.ip || null;
    const userAgent = req.headers['user-agent'] || null;
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(reply, 401, 'Unauthorized', 'Missing or invalid authentication token');
      }

      const ok = await verifyTwoFAToken(userId, req.body.token);
      if (!ok) {
        throw new ValidationError('Invalid 2FA token');
      }

      // Set is2FAConfirmed Flag to true
      await User.update(
        { is2FAConfirmed: true },
        { where: { id: userId } },
      );

      const existingUser = await getUserById(userId);
      if (!existingUser) return sendError(reply, 404, 'Not Found', 'User not found');

      const { accessToken, refreshToken, user } = await userLogin(existingUser);

      try {
        await storeRefreshTokenHash(refreshToken, existingUser.id, ip, userAgent);
      } catch (err) {
        // Treat persistence failure as a server error (do not continue)
        fastify.log.error(err);
        // return reply.code(503).send({ message: 'Service temporarily unavailable. Please try again later. ' });
        return sendError(reply, 503, 'Service Unavailable', 'Service temporarily unavailable. Please try again later.');
      }

      setRefreshTokenCookie(reply, refreshToken);
      return reply.code(200).send({ success: true, code: '2FA_MATCH', accessToken, user });
    } catch (err) {
      if (err instanceof NotFoundError) {
        return sendError(reply, 404, 'Not Found', err.message);
      }
      if (err instanceof ValidationError) {
        return sendError(reply, 400, 'Bad Request', err.message);
      }
      fastify.log.error(err);
      return sendError(reply, 500, 'Internal Server Error', 'Something went wrong');
    }
  });


  /**
  * @route   POST /2fa/backup
  * @desc    Consume backup code
  */
  fastify.post('/2fa/backupcode', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['TwoFactorAuth'],
      summary: 'Consume backup code',
      description: 'Consumes a backup code when the user cannot provide a TOTP code.',
      body: {
        type: 'object',
        required: ['code'],
        properties: {
          code: { type: 'string', description: 'One-time backup code' }
        }
      },
      response: {
        200: {
          description: 'Backup code usage status',
          type: 'object',
          properties: { used: { type: 'boolean' } },
          required: ['used']
        },
        400: { $ref: 'errorResponse#' },
        401: { $ref: 'errorResponse#' },
        404: { $ref: 'errorResponse#' },
        500: { $ref: 'errorResponse#' }
      }
    }
  }, async (req, reply) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(reply, 401, 'Unauthorized', 'Missing or invalid authentication token');
      }

      const ok = await consumeBackupCode(userId, req.body.code);
      if (!ok) {
        // user provided wrong code
        throw new ValidationError('Invalid backup code');
      }

      return { used: true };
    } catch (err) {
      if (err instanceof NotFoundError) {
        return sendError(reply, 404, 'Not Found', err.message);
      }
      if (err instanceof ValidationError) {
        return sendError(reply, 400, 'Bad Request', err.message);
      }
      fastify.log.error(err);
      return sendError(reply, 500, 'Internal Server Error', 'Something went wrong');
    }
  });

  /**
  * @route   POST /2fa/disable
  * @desc    Disable 2FA, delele secret, backupCodes from DB
  */
  fastify.delete('/2fa/disable', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['TwoFactorAuth'],
      summary: 'Disable 2FA',
      description: 'Disables 2FA for the user.',
      response: {
        204: { description: '2FA successfully disabled', type: 'null' },
        400: { $ref: 'errorResponse#' },
        401: { $ref: 'errorResponse#' },
        404: { $ref: 'errorResponse#' },
        500: { $ref: 'errorResponse#' },
      }
    }
  }, async (req, reply) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(reply, 401, 'Unauthorized', 'Missing or invalid authentication token');
      }
      await disableTwoFAService(userId);
      return reply.code(204).send();
    } catch (err) {
      if (err instanceof NotFoundError) {
        return sendError(reply, 404, 'Not Found', err.message);
      }
      fastify.log.error(err);
      return sendError(reply, 500, 'Internal Server Error', 'Something went wrong');
    }
  });

  // 2FA Status
  fastify.get('/2fa/status', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['TwoFactorAuth'],
      summary: 'Check 2FA status',
      description: 'Checks whether 2FA is currently enabled for the user.',
      response: {
        200: {
          description: '2FA status',
          type: 'object',
          properties: { enabled: { type: 'boolean' } },
          required: ['enabled']
        },
        401: { $ref: 'errorResponse#' },
        500: { $ref: 'errorResponse#' }
      }
    }
  }, async (req, reply) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(reply, 401, 'Unauthorized', 'Missing or invalid authentication token');
      }
      const enabled = await getTwoFAStatus(userId);
      return { enabled };
    } catch (err) {
      fastify.log.error(err);
      return sendError(reply, 500, 'Internal Server Error', 'Something went wrong');
    }
  });
});
