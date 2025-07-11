import bcrypt from 'bcrypt';
import speakeasy from 'speakeasy';
import { getDb } from './db.js';
import { normalizeEmail } from './util.js';

/**
 * Authentication routes with JWT and 2FA support
 * @module authRoutes
 * @param {import('fastify').FastifyInstance} fastify - Fastify instance
 * @param {Object} options - Plugin options
 * @param {number} [options.jwtExpiry=3600] - JWT expiration in seconds
 */
export default async function authRoutes(fastify, options) {
  const db = getDb();
  const jwtExpiry = options?.jwtExpiry || 3600; // Default: 1 hour

  // Register rate limiter (5 attempts per minute)
  await fastify.register(import('@fastify/rate-limit'), {
    max: 5,
    timeWindow: '1 minute'
  });

  /**
   * User registration endpoint
   * @route POST /signup
   * @param {Object} body - Request body
   * @param {string} body.email - Valid email address
   * @param {string} body.password - Password (min 8 chars)
   * @returns {Object} 201 - Success response
   * @returns {Object} 400 - Validation error
   * @returns {Object} 409 - Email already exists
   */
  fastify.post('/signup', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 }
        }
      }
    }
  }, async (req, reply) => {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    try {
      const hash = await bcrypt.hash(password, 10);
      await db.run(
        `INSERT INTO users (email, password) VALUES (?, ?)`,
        [email, hash]
      );
      return reply.status(201).send({ message: 'User registered' });
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT') {
        return reply.status(409).send({ error: 'Email already registered' });
      }
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Registration failed' });
    }
  });

  /**
   * User login endpoint
   * @route POST /login
   * @param {Object} body - Request body
   * @param {string} body.email - Registered email
   * @param {string} body.password - User password
   * @returns {Object} 200 - JWT token or 2FA required
   * @returns {Object} 401 - Invalid credentials
   */
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 }
        }
      }
    }
  }, async (req, reply) => {
    const email = normalizeEmail(req.body.email);
    const password = req.body.password;

    try {
      const user = await db.get(
        `SELECT userId, password, is_2fa_enabled FROM users WHERE email = ?`,
        [email]
      );

      if (!user || !(await bcrypt.compare(password, user.password))) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      if (user.is_2fa_enabled) {
        return reply.send({
          message: '2FA required',
          userId: user.userId
        });
      }

      const token = fastify.jwt.sign(
        { userId: user.userId },
        { expiresIn: jwtExpiry }
      );
      return reply.send({ token });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Login failed' });
    }
  });

  /**
   * 2FA setup endpoint
   * @route POST /2fa/setup
   * @security bearerAuth
   * @param {Object} body - Request body
   * @param {string} body.email - User email
   * @returns {Object} 200 - OTP auth URL
   * @returns {Object} 404 - User not found
   */
  fastify.post('/2fa/setup', {
    preValidation: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' }
        }
      }
    }
  }, async (req, reply) => {
    try {
      const email = normalizeEmail(req.body.email);
      const secret = speakeasy.generateSecret({ length: 20 });

      const { changes } = await db.run(
        `UPDATE users 
         SET is_2fa_enabled = 1, totp_secret = ? 
         WHERE email = ?`,
        [secret.base32, email]
      );

      if (changes === 0) {
        return reply.status(404).send({ error: 'User not found' });
      }

      return reply.send({
        secretUrl: secret.otpauth_url,
        manualCode: secret.base32
      });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: '2FA setup failed' });
    }
  });

  /**
   * 2FA verification endpoint
   * @route POST /2fa/verify
   * @param {Object} body - Request body
   * @param {number} body.userId - User ID
   * @param {string} body.token - 6-digit 2FA token
   * @returns {Object} 200 - JWT token
   * @returns {Object} 401 - Invalid token
   */
  fastify.post('/2fa/verify', {
    schema: {
      body: {
        type: 'object',
        required: ['userId', 'token'],
        properties: {
          userId: { type: 'number' },
          token: { type: 'string', pattern: '^\\d{6}$' }
        }
      }
    }
  }, async (req, reply) => {
    try {
      const { userId, token } = req.body;
      const user = await db.get(
        `SELECT totp_secret FROM users WHERE userId = ?`,
        [userId]
      );

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const verified = speakeasy.totp.verify({
        secret: user.totp_secret,
        encoding: 'base32',
        token,
        window: 1
      });

      if (!verified) {
        return reply.status(401).send({ error: 'Invalid 2FA token' });
      }

      const jwtToken = fastify.jwt.sign(
        { userId },
        { expiresIn: jwtExpiry }
      );
      return reply.send({ token: jwtToken });
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Verification failed' });
    }
  });

  /**
   * Current user endpoint
   * @route GET /whoami
   * @security bearerAuth
   * @returns {Object} 200 - Authenticated user ID
   */
  fastify.get('/whoami', {
    preValidation: [fastify.authenticate]
  }, async (req, reply) => {
    return reply.send({ userId: req.user.userId });
  });
}
