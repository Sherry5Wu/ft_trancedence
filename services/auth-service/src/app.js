require('dotenv').config();
const fastify = require('fastify')({
  logger: true,
  trustProxy: true // Enable if behind a proxy (e.g., Nginx)
});

// Database and plugins
const db = require('./db');

// --- Rate Limiting ---
fastify.register(require('@fastify/rate-limit'), {
  global: true, // Applies to all routes
  max: 100, // Adjusted to 100 requests/minute (5 is too aggressive for auth flows)
  timeWindow: '1 minute',
  ban: 5, // Temporary ban after exceeding limits
  skipOnError: false, // Count failed requests too
  keyGenerator: (req) => req.ip // Rate limit by IP
});

// --- Security Headers ---
fastify.register(require('@fastify/helmet'), {
  contentSecurityPolicy: false // Disable if not using SSR
});

// --- Auth Plugins ---
fastify.register(require('@fastify/jwt'), {
  secret: process.env.JWT_SECRET,
  cookie: {
    cookieName: 'token',
    signed: true
  }
});

// --- Routes ---
fastify.register(require('./routes/google-auth'), { prefix: '/auth' });
fastify.register(require('./routes/jwt'), { prefix: '/auth' });
fastify.register(require('./routes/2fa'), { prefix: '/auth' });

// --- Database and Server ---
db.sequelize.sync({ alter: true }) // Use `alter` in dev, `force` in tests only
  .then(() => {
    fastify.listen({
      port: process.env.PORT || 3000,
      host: '0.0.0.0',
      listenTextResolver: (address) => `Auth service ready at ${address}`
    });
  })
  .catch((err) => {
    fastify.log.error('Database sync failed:', err);
    process.exit(1);
  });
