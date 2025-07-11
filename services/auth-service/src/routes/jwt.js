const { loginUser } = require('../services/auth.service');

module.exports = async (fastify) => {
  fastify.post('/auth/login', async (req, reply) => {
    const { email, password } = req.body;
    const token = await loginUser(email, password);
    reply.send({ token });
  });

  fastify.post('/auth/validate', async (req, reply) => {
    await req.jwtVerify(); // Uses @fastify/jwt
    reply.send({ valid: true });
  });
};
