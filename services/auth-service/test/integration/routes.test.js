const { setup, createTestUser, teardown } = require('../helpers/test-db');
const buildServer = require('../helpers/test-server');
const db = require('../../src/db');

describe('Auth Routes', () => {
  let server;
  let testUser;
  let validToken;

  // ======================
  // Setup & Teardown
  // ======================
  beforeAll(async () => {
    await setup();
    server = await buildServer();
    testUser = await createTestUser({
      email: 'test@example.com',
      passwordHash: '$2b$10$fakehashedpassword123' // bcrypt hash of 'Testpass123!'
    });
  });

  afterAll(async () => {
    await teardown();
    await server.close();
  });

  // ======================
  // Test Cases
  // ======================
  describe('POST /auth/register', () => {
    test('should register a new user', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'new@example.com',
          password: 'ValidPass123!'
        }
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('token');
    });

    test('should reject duplicate emails', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          email: 'test@example.com', // Duplicate of testUser
          password: 'AnotherPass123!'
        }
      });
      expect(response.statusCode).toBe(409);
    });
  });

  describe('POST /auth/login', () => {
    test('should login with valid credentials', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'Testpass123!'
        }
      });
      expect(response.statusCode).toBe(200);
      validToken = response.json().token; // Store for later tests
    });

    test('should reject invalid password', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'WrongPass123!'
        }
      });
      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /auth/validate', () => {
    test('should validate a good token', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/auth/validate',
        headers: {
          Authorization: `Bearer ${validToken}`
        }
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ valid: true });
    });

    test('should reject invalid token', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/auth/validate',
        headers: {
          Authorization: 'Bearer invalid.token.here'
        }
      });
      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /auth/2fa/generate', () => {
    test('should generate 2FA secret for authenticated user', async () => {
      const response = await server.inject({
        method: 'POST',
        url: '/auth/2fa/generate',
        headers: {
          Authorization: `Bearer ${validToken}`
        }
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toHaveProperty('secret');
      expect(response.json()).toHaveProperty('otpauthUrl');
    });
  });
});
