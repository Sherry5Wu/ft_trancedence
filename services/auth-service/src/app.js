/**
 * Main entry point for the Auth Service.
 * Initializes Fastify, loads environment variables, sets up plugins, routes, and starts the server.
 */

import Fastify from 'fastify';
import path from 'path';
import dotenv from 'dotenv';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Import DB and utils
import { initDB, models } from './db/index.js';
import errorPlugin from './utils/errors.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import twoFARoutes from './routes/2fa.routes.js';
import googleAuthRoutes from './routes/google-auth.js';
import userRoutes from './routes/user.routes.js';
import healthRoutes from './routes/health.routes.js';

// Import authenticate plugin and schemas
import authenticate from './utils/authenticate.js';
import userSchema from './schemas/publicUser.schema.js';

async function buildApp() {
  const app = Fastify({ logger: true });

  // Add JSON schemas for validation and serialization
  app.addSchema(userSchema);

  // Initialize database with error handling
  try {
    await initDB();
    app.log.info('Database initialized successfully');
  } catch (err) {
    app.log.error('Database initialization failed:', err);
    process.exit(1);
  }

  // Decorate Fastify instance with DB models
  app.decorate('models', models);

  // Register plugins and routes with async/await to catch errors early
  app.register(errorPlugin);

  await app.register(authenticate);

  // Swagger/OpenAPI configuration
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Auth Service API',
        description: 'Authentication and Authorization Service for ft_transcendence',
        version: '1.0.0',
      },
      servers: [
        { url: `http://localhost:${process.env.PORT || 3001}`, description: 'Local server' },
      ],
    },
    // with transform, Swagger uses the actual registered route URL, which includes the prefix
  });

  await app.register(swaggerUI, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
  });

  app.register(authRoutes);
  app.register(twoFARoutes);
  app.register(googleAuthRoutes);
  app.register(userRoutes);
  app.register(healthRoutes);

  // for testing
  app.log.info(app.printRoutes());// only for testing

  return app;
}

(async () => {
  try {
    const app = await buildApp();
    const port = process.env.PORT || 3001;
    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(`Server listening on http://localhost:${port}`);
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
