import { twoFAService } from '../services/2fa.service.js';

export default async function twoFARoutes(fastify) {
  /**
   * Generate a new 2FA secret for the authenticated user
   *
   * @route POST /auth/2fa/generate
   * @auth Requires JWT-authenticated user (req.user)
   * @returns {Object} { secret: string } - The new 2FA secret
   * @throws {Error} If user ID is missing or secret generation fails
   */
  fastify.post('/auth/2fa/generate', async (req, reply) => {
    try {
      if (!req.user || !req.user.id) {
        return reply.status(401).send({ error: 'Unauthorized: User not authenticated' });
      }

      const secret = twoFAService.generate2FASecret(req.user.id); // Assumes JWT middleware populates req.user
      if (!secret) {
        throw new Error('Failed to generate 2FA secret');
      }
      reply.send({ secret });
    } catch (err) {
      fastify.log.error('Error generating 2FA secret:', err);
      reply.status(500).send({
        error: 'Internal Server Error',
        details: err.message,
      });
    }
  });

  /**
   * Verify a 2FA token for the authenticated user
   *
   * @route POST /auth/2fa/verify
   * @auth Requires JWT-authenticated user (req.user)
   * @param {string} req.body.token - The token to verify
   * @returns {Object} { valid: boolean } - Whether the token is valid
   * @throws {Error} If verification fails or user is not authenticated
   */
  fastify.post('/auth/2fa/verify', async (req, reply) => {
    try {
      if (!req.user || !req.user.id) {
        return reply.status(401).send({ error: 'Unauthorized: User not authenticated' });
      }

      if (!req.body || typeof req.body.token !== 'string') {
        return reply.status(400).send({ error: 'Bad Request: Missing or invalid token' });
      }

      const isValid = await twoFAService.verify2FAToken(req.user.id, req.body.token);
      reply.send({ valid: isValid });
    } catch (err) {
      fastify.log.error('Error verifying 2FA token:', err);
      reply.status(500).send({
        error: 'Internal Server Error',
        details: err.message,
      });
    }
  });
}
