import fp from 'fastify-plugin';

import { userLogin, googleCompleteRegistration, verifyGoogleIdToken } from '../services/google-auth.service.js';
import { generateAccessToken, storeRefreshTokenHash } from '../utils/jwt.js';
import { InvalidCredentialsError,ValidationError, NotFoundError } from '../utils/errors.js';
import { sendError } from '../utils/sendError.js';
import { models } from '../db/index.js';
import { setRefreshTokenCookie } from '../utils/authCookie.js';
import { normalizeAndValidateEmail } from '../utils/validators.js';

const { User } = models;

export default fp(async (fastify) => {
  fastify.post('/auth/google-login', {
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
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            code: { type: 'string' },
            needCompleteProfile: { type: 'boolean' },
            TwoFA: { type: 'boolean' },
            userId: { type: 'string'},
            accessToken: { type: 'string' },
            user: { $ref: 'publicUser#' },
          },
        },
        400: { description: 'Bad Request', $ref: 'errorResponse#' },
        401: { description: 'Unauthorized', $ref: 'errorResponse#' },
        409: { description: 'Conflict', $ref: 'errorResponse#' },
        500: { description: 'Inernal Server Error', $ref: 'errorResponse#' },
        503: { description: 'Service Unavailable', $ref: 'errorResponse#' },
      }
    }
  }, async (req, reply) => {
    // 1. get the idToken.
    const { idToken } = req.body;
    const ip = req.ip || null;
    const userAgent = req.headers['user-agent'] || null;
    try {
      // 2. verify idToken and basic claims
      const payload = await verifyGoogleIdToken(idToken);
      if (!payload || !payload.sub) {
        // return reply.code(401).send({ message: 'Invalid idToken payload' });
        return sendError(reply, 401, 'Unauthorized', 'Invalid idToken payload');
      }

      if (!payload.email_verified) {
        // return reply.code(400).send({ message: 'Google email is not verified' });
        return sendError(reply, 400, 'Bad Request', 'Google email is not verified');
      }
      const googleId = payload.sub;
      // const email = payload.email.toLowerCase();
      const email = normalizeAndValidateEmail(payload.email);

      // 3. Is googldId already in DB?
      const existingUser = await User.findOne({ where: { googleId } });
      // 4a. Already registered -> sign in
      if (existingUser) {
        // get 2fa status
        const TwoFA = !!(existingUser.is2FAEnabled && existingUser.is2FAConfirmed);

        // 2fa is disable, then normal login
        if (TwoFA === false) {
           const { accessToken, refreshToken, user } = await userLogin(existingUser);

        // Store the refreshToken into DB
        try {
          await storeRefreshTokenHash(refreshToken, existingUser.id, ip, userAgent);
        } catch (err) {
          // Treat persistence failure as a server error (do not continue)
         fastify.log.error(err);
          // return reply.code(503).send({ message: 'Service temporarily unavailable. Please try again later. ' });
          return sendError(reply, 503, 'Service Unavailable', 'Service temporarily unavailable. Please try again later.');
        }

        setRefreshTokenCookie(reply, refreshToken);
        return reply.code(200).send({ success: ture, code: 'TWOFA_DISABLE', TwoFA, accessToken, user});
        } else {
          return reply.code(200).send({ success: ture, code: 'TWOFA_ENABLE', TwoFA, userId: existingUser.id });
        }
      }

      // 4b. Not registered by gogole -> check if email already exists
      // Checking the if email is token
      const existingByEmail = await User.findOne({ where: { email } });
      if (existingByEmail) {
        return reply.code(409).send({ message: 'Email is already registered' });
      }

      // 5. Otherwise tell client profile completion is required (no DB row created)
      return reply.code(200).send({
        success: true,
        code: 'NEED_COMPLETE_PROFILE',
        needCompleteProfile: true
      });
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        return sendError(reply, 400, 'Bad Request', err.message);
      }
      fastify.log.error(err);
      return sendError(reply, 500, 'Internal Server Error', err.message);
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
      fastify.log.error(err);
      return reply.code(500).send({ message: err.message });
    }
  });
});
