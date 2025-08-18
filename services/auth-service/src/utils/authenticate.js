import fp from 'fastify-plugin';
import { verifyAccessToken } from './jwt.js';

/**
 * Middleware for verifying JWTs on protected routes.
 * @param {*} fastify
 * @param {*} options
 */
async function authenticate(fastify, options) {
  fastify.decorate('authenticate', async function (req, reply) {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return reply.status(401).send({ error: 'Missing Authorization header' });
      }

      const tokenMatch = authHeader.match(/^Bearer (.+)$/);
      if (!tokenMatch) {
        return reply.status(401).send({ error: 'Invalid Authorization format' });
      }

      const token = tokenMatch[1];

      // Verify token with your JWT service
      const decoded = verifyAccessToken(token);

      // Attach decoded user data to request object for handlers
      req.user = decoded;

    } catch (err) {
      // Token invalid or expired
      return reply.status(401).send({ error: 'Unauthorized: ' + err.message });
    }
  });
}

export default fp(authenticate);
