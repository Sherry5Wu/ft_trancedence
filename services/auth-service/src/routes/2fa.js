const { generate2FASecret, verify2FAToken } = require('../services/2fa.service');

module.exports = async (fastify) => {
  /**
   * Generate a new 2FA secret for the authenticated user
   *
   * @route POST /auth/2fa/generate
   * @auth Requires JWT-authenticated user (req.user)
   * @returns {Object} { secret: string } - The new 2FA secret
   * @throws {Error} If user ID is missing or secret generation fails
   */
  fastify.post('/auth/2fa/generate', async (req, reply) => {
    const secret = generate2FASecret(req.user.id); // Assumes JWT middleware populates req.user
    reply.send({ secret });
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
    const isValid = verify2FAToken(req.user.id, req.body.token);
    reply.send({ valid: isValid });
  });
};
