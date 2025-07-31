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
import jwtRoutes from './routes/jwt.routes.js';
import twoFARoutes from './routes/2fa.routes.js';

await fastify.register(jwtRoutes, { prefix: '/auth' });
await fastify.register(twoFARoutes, { prefix: '/auth' });

// --- Database Initialization & Server Start ---
try {
  await initDB();
  fastify.log.info('Database initialized');

  const address = await fastify.listen({ // the returned address is like:  http://127.0.0.1:3001
    port: process.env.PORT || 3001,
    host: '0.0.0.0',
  });
  fastify.log.info(`Auth service ready at ${address}`); // here is backticks'`'
} catch (err) {
  fastify.log.error('Database sync failed:', err);
  process.exit(1);
}
