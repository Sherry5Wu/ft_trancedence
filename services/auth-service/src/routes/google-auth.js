const fastifyOauth2 = require('@fastify/oauth2');
const { googleAuth } = require('../services/auth.service');

module.exports = async (fastify) => {
  fastify.register(fastifyOauth2, {
    name: 'googleOAuth2',
    credentials: {
      client: {
        id: process.env.GOOGLE_CLIENT_ID,
        secret: process.env.GOOGLE_CLIENT_SECRET,
      },
      auth: fastifyOauth2.GOOGLE_CONFIGURATION,
    },
    scope: ['profile', 'email'],
  });

  fastify.get('/auth/google', async (req, reply) => {
    const token = await googleAuth(req.query.code);
    reply.send({ token });
  });
};
