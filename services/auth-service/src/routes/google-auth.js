import fastifyOauth2 from '@fastify/oauth2';
import { googleAuth } from '../services/auth.service.js';

export default async function googleAuthRoutes(fastify) {
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
}
