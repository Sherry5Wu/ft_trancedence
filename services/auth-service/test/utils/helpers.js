import Fastify from 'fastify';
import authRoutes from '../../src/routes/auth.routes.js';

/**
 * buildApp(options)
 * - authenticateMock: optional function to attach as fastify.decorate('authenticate', fn)
 * - logger: false by default
 * Returns { app } where app.server can be passed to supertest
 */
export const buildApp = async ({ authenticateMock, logger = false } = {}) => {
  const app = Fastify({ logger });
  // Decorate authenticate BEFORE registering routes because routes call fastify.authenticate
  app.decorate('authenticate', authenticateMock ?? (async (req, reply) => {
    // default: populate a bearer-authenticated user
    req.user = { id: 'u1', username: 'tester', email: 't@example.com', role: 'user' };
  }));
  await app.register(authRoutes);
  await app.ready();
  return { app };
};

/* Payload factories */
export const validRegisterPayload = (overrides = {}) => ({
  email: 't@example.com',
  username: 'tester01',
  password: 'Aa1@strong1',
  pinCode: '1234',
  ...overrides,
});

export const validLoginPayload = (overrides = {}) => ({
  identifier: 'tester01',
  password: 'Aa1@strong1',
  ...overrides,
});

export const validRefreshPayload = (overrides = {}) => ({
  refreshToken: 'refresh-xyz',
  ...overrides,
});

/* Helpers */
export const authHeaders = (token = 'bearer-token') => ({
  authorization: `Bearer ${token}`,
});

export const invalidJsonString = '{ bad json'; // used to send malformed JSON

export const expectFastifyValidationError = (res) => {
  // Fastify responds with { "statusCode":400, "error":"Bad Request", "message": "..." }
  expect(res.status).toBe(400);
  expect(res.body).toHaveProperty('message');
};
