/**
 * Purpose of app.js
 * The app.js file is the main entry point of auth-service server. When the container
 * starts (after dependencies are installed and the setup is complete), this is the
 * file that gets executed to start your authentication service
 */

import dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import { sequelize, initDB } from './db/index.js';

// Initialize Fastify
const fastify = Fastify({
  logger: true,
  trustProxy: true // Enable if behind a proxy (e.g., Nginx)
});

// ---Rate Limiting---
await fastify.register(rateLimit, {
  global: true, // Applies to all routes
  max: 100, // Adjusted to 100 requests/minute
  timeWindow: '1 minute',
  ban: 5, // Temporary ban after exceeding limits
  skipOnError: false,
  keyGenerator: (req) => req.ip
});

// --- Security Headers---
await fastify.register(helmet, {
  contentSecurityPolicy: false
});

// ---JWT Authentication---
await fastify.register(jwt, {
  secret: process.env.JWT_SECRET,
  cookie: {
    cookieName: 'token',
    signed: true
  }
});

// Register routes
import googleAuthRoutes from './routes/google-auth.js';
import jwtRoutes from './routes/jwt.js';
import twoFARoutes from './routes/2fa.js';

await fastify.register(googleAuthRoutes, { prefix: '/auth' });
await fastify.register(jwtRoutes, { prefix: '/auth' });
await fastify.register(twoFARoutes, { prefix: '/auth' });

// --- Database Initialization & Server Start ---
try {
  await initDB();
  fastify.log.info('Database initialized');

  await fastify.listen({
    port: process.env.PORT || 3000,
    host: '0.0.0.0',
    // `listenTextResolver` is a new Fastify option (>=4.8.0)
    //listenTextResolver: (address) => `Auth service ready at ${address}` // ??????????
  });
  fastify.log.info('Auth service ready at ${fastify.server.address().port}');
} catch (err) {
  fastify.log.error('Database sync failed:', err);
  process.exit(1);
}
