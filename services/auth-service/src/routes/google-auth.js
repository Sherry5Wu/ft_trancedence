import fp from 'fastify-plugin';

import { googleRegister, googleCompleteRegistration } from '../services/google-auth.service.js';

export default fp(async (fastify) => {
  fastify.post('/auth/google-register', {
    schema: {
      tags: ['GoogleAuth'],
      summary: 'Verify Google idToken and either login or indicate profile completion is needed',
      body: {
        type: 'object',
        required: ['idToken'],
        properties: {
          idToken: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Login success or profile incomplete',
          type: 'object'
        }
      }
    }
  }, async (req, reply) => {
    const { idToken } = req.body;
    const ip = req.ip || null;
    const userAgent = req.headers['user-agent'] || null;

    try {
      const result = await googleRegister(idToken, ip, userAgent);
      if (result && result.accessToken) {
        return reply.code(200).send(result);
      }
      return reply.code(200).send(result);
    } catch (err) {
      if (err.name === 'ConflictError' || err instanceof Error && err.name === 'ConflictError') {
        return reply.code(409).send({ message: err.message });
      }
      if (err.name === 'ValidationError' || err instanceof Error && err.name === 'ValidationError') {
        return reply.code(400).send({ message: err.message });
      }
      return reply.code(401).send({ message: err.message });
    }
  });

  fastify.post('/auth/google-complete', {
    schema: {
      tags: ['GoogleAuth'],
      summary: 'Complete registration for Google users (username + pin)',
      body: {
        type: 'object',
        required: ['idToken', 'username', 'pinCode'],
        properties: {
          idToken: { type: 'string' },
          username: { type: 'string' },
          pinCode: { type: 'string' }
        }
      }
    }
  }, async (req, reply) => {
    const { idToken, username, pinCode } = req.body;
    const ip = req.ip || null;
    const userAgent = req.headers['user-agent'] || null;

    try {
      const result = await googleCompleteRegistration(idToken, username, pinCode, ip, userAgent);
      return reply.code(201).send(result);
    } catch (err) {
      if (err.name === 'ConflictError' || err instanceof Error && err.name === 'ConflictError') {
        return reply.code(409).send({ message: err.message });
      }
      if (err.name === 'ValidationError' || err instanceof Error && err.name === 'ValidationError') {
        return reply.code(400).send({ message: err.message });
      }
      if (err instanceof InvalidCredentialsError) {
        return reply.code(401).send({ message: err.message });
      }
      return reply.code(500).send({ message: err.message });
    }
  });
});
