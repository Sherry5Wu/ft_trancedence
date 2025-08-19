import fp from 'fastify-plugin';
import {
  generateTwoFASetup,
  verifyTwoFAToken,
  generateTwoFAQrCode,
  consumeBackupCode,
  disableTwoFA as disableTwoFAService,
  getTwoFAStatus
} from '../services/2fa.service.js';
import { ValidationError } from '../utils/errors.js';

export default fp(async (fastify) => {
  /**
   * @swagger
   * tags:
   *   name: TwoFactorAuth
   *   description: Endpoints for Two-Factor Authentication (2FA) setup and management
   */
  // Setup 2FA
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
        }
      }
    }
  }, async (req, reply) => {
    const { secret, otpauthUrl, backupCodes } = await generateTwoFASetup(req.user.id);
    const qrCode = await generateTwoFAQrCode(otpauthUrl);
    return { secret, otpauthUrl, qrCode, backupCodes };
  });

  // Verify TOTP code
  fastify.post('/2fa/verify', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['TwoFactorAuth'],
      summary: 'Verify 2FA TOTP',
      description: 'Verifies a 6-digit TOTP code and enables 2FA for the user.',
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
          properties: { verified: { type: 'boolean' } },
          required: ['verified']
        }
      }
    }
  }, async (req, reply) => {
    const ok = await verifyTwoFAToken(req.user.id, req.body.token);
    if (!ok) throw new ValidationError('Invalid 2FA token');
    return { verified: true };
  });

  // Consume backup code
  fastify.post('/2fa/backup', {
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
        }
      }
    }
  }, async (req, reply) => {
    const ok = await consumeBackupCode(req.user.id, req.body.code);
    if (!ok) throw new ValidationError('Invalid backup code');
    return { used: true };
  });

  // Disable 2FA
  fastify.delete('/2fa', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['TwoFactorAuth'],
      summary: 'Disable 2FA',
      description: 'Disables 2FA for the user.',
      response: {
        204: { description: '2FA successfully disabled', type: 'null' }
      }
    }
  }, async (req, reply) => {
    await disableTwoFAService(req.user.id);
    return reply.code(204).send();
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
        }
      }
    }
  }, async (req, reply) => {
    const enabled = await getTwoFAStatus(req.user.id);
    return { enabled };
  });
});
