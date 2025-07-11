const { generate2FASecret, verify2FAToken } = require('../services/2fa.service');

module.exports = async (fastify) => {
  fastify.post('/auth/2fa/generate', async (req, reply) => {
    const secret = generate2FASecret(req.user.id); // req.user from JWT
    reply.send({ secret });
  });

  fastify.post('/auth/2fa/verify', async (req, reply) => {
    const isValid = verify2FAToken(req.user.id, req.body.token);
    reply.send({ valid: isValid });
  });
};
