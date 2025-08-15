import fp from 'fastify-plugin';
import { models } from '../db/index.js';
import { registerGoogleUser } from '../services/google-auth.service.js';

export default fp(async (fastify) => {
  /**
   * @swagger
   * tags:
   *   name: GoogleAuth
   *   description: Google OAuth 2.0 authentication
   */

  // Redirect to Google OAuth2
  fastify.post('/auth/google-register', {
    schema: {
      tags: ['GoogleAuth'],
      summary: 'Redirect to Google OAuth2',
      description: 'Verify the google Id Token and register google user.',
      body: {
        type: 'object',
        required: [{ idToken }, { username }, { pinCode }],
        properties: {
          idToken: { type: 'string' },
          username: { type: 'string' },
          pinCode: { type: 'string' }
        }
      },
      response: {
        201: {
          description: 'User successfully registered',
          $ref: 'publicUser#'
        }
      }
    },
  handler: async (req, reply) => {
    const { idToken, username, pinCode } = req.body;
    try {
      const user = await registerGoogleUser(idToken, username, pinCode);
      return reply.status(201).send(user);
    } catch (err) {
      return reply.status(400).send({ message: err.message });
    }
    }
  });
});
