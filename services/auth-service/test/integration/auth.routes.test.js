// Using supertest
import Fastify from 'fastify';
import request from 'supertest';
import * as authService from '../../src/services/auth.service.js';
import * as jwtService from '../../src/services/jwt.service.js';
import {
  buildApp,
  validRegisterPayload,
  validLoginPayload,
  validRefreshPayload,
  authHeaders,
  invalidJsonString,
  expectFastifyValidationError } from './utils/helpers.js';

jest.mock('../services/auth.service.js');
jest.mock('../services/jwt.service.js');

afterEach(() => {
  jest.resetAllMocks();
});

describe('Auth routes (Supertest style)', () => {
  // ---------------- Register ----------------
  test('POST /auth/register - success -> 201 and user payload', async () => {
    const returnedUser = { id: 'u1', email: 't@example.com', username: 'tester01' };
    authService.registerUser.mockResolvedValue(returnedUser);

    const { app } = await buildApp();
    const res = await request(app.server)
      .post('/auth/register')
      .send(validRegisterPayload());

    expect(authService.registerUser).toHaveBeenCalledWith(
      't@example.com',
      'tester01',
      'Aa1@strong1',
      '1234'
    );
    expect(res.status).toBe(201);
    expect(res.body).toEqual(returnedUser);

    await app.close();
  });

  test('POST /auth/register - missing required field -> 400 (schema validation)', async () => {
    const { app } = await buildApp();
    // omit password
    const payload = validRegisterPayload();
    delete payload.password;

    const res = await request(app.server)
      .post('/auth/register')
      .send(payload);

    expectFastifyValidationError(res);
    await app.close();
  });

  test('POST /auth/register - malformed JSON -> 400', async () => {
    const { app } = await buildApp();
    // send invalid raw JSON string and force Content-Type
    const res = await request(app.server)
      .post('/auth/register')
      .set('Content-Type', 'application/json')
      .send(invalidJsonString);

    // Fastify returns 400 for malformed JSON
    expect(res.status).toBe(400);
    // payload will not be JSON parsed; supertest will set res.body to text if parsing fails.
    // we also assert there is an error message in the text body
    const text = res.text || '';
    expect(text.length).toBeGreaterThan(0);

    await app.close();
  });

  test('POST /auth/register - service error forwarded -> uses service statusCode and message', async () => {
    const err = new Error('Email already exists');
    err.statusCode = 409;
    authService.registerUser.mockRejectedValue(err);

    const { app } = await buildApp();
    const res = await request(app.server)
      .post('/auth/register')
      .send(validRegisterPayload());

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: 'Email already exists' });

    await app.close();
  });

  // ---------------- Login ----------------
  test('POST /auth/login - success returns tokens, user and TwoFAStatus false', async () => {
    const user = { id: 'u1', username: 'tester', email: 't@example.com', is2FAEnabled: false, is2FAConfirmed: false };
    authService.authenticateUser.mockResolvedValue({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      user,
    });

    const { app } = await buildApp();
    const res = await request(app.server)
      .post('/auth/login')
      .send(validLoginPayload());

    expect(authService.authenticateUser).toHaveBeenCalledWith('tester01', 'Aa1@strong1');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
      user,
      TwoFAStatus: false,
    });

    await app.close();
  });

  test('POST /auth/login - TwoFAStatus true when enabled and confirmed', async () => {
    const user = { id: 'u2', username: 't2', email: 't2@example.com', is2FAEnabled: true, is2FAConfirmed: true };
    authService.authenticateUser.mockResolvedValue({
      accessToken: 'a2',
      refreshToken: 'r2',
      user,
    });

    const { app } = await buildApp();
    const res = await request(app.server)
      .post('/auth/login')
      .send(validLoginPayload({ identifier: 't2', password: 'Aa1@strong1' }));

    expect(res.status).toBe(200);
    expect(res.body.TwoFAStatus).toBe(true);

    await app.close();
  });

  test('POST /auth/login - malformed JSON -> 400', async () => {
    const { app } = await buildApp();
    const res = await request(app.server)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send(invalidJsonString);

    expect(res.status).toBe(400);
    await app.close();
  });

  test('POST /auth/login - authentication failure -> statusCode forwarded and message', async () => {
    const err = new Error('Invalid credentials');
    err.statusCode = 401;
    authService.authenticateUser.mockRejectedValue(err);

    const { app } = await buildApp();
    const res = await request(app.server)
      .post('/auth/login')
      .send(validLoginPayload({ identifier: 'wrong', password: 'bad' }));

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Invalid credentials' });

    await app.close();
  });

  // ---------------- Refresh Token ----------------
  test('POST /auth/refresh - success returns new tokens', async () => {
    jwtService.rotateTokens.mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });

    const { app } = await buildApp();
    const res = await request(app.server)
      .post('/auth/refresh')
      .set('User-Agent', 'jest-test')
      .send(validRefreshPayload());

    expect(jwtService.rotateTokens).toHaveBeenCalledWith('refresh-xyz', expect.objectContaining({
      ipAddress: expect.any(String),
      userAgent: 'jest-test',
    }));
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ accessToken: 'new-access', refreshToken: 'new-refresh' });

    await app.close();
  });

  test('POST /auth/refresh - rotateTokens error -> forwarded', async () => {
    const err = new Error('Invalid refresh token');
    err.statusCode = 401;
    jwtService.rotateTokens.mockRejectedValue(err);

    const { app } = await buildApp();
    const res = await request(app.server)
      .post('/auth/refresh')
      .send(validRefreshPayload({ refreshToken: 'bad-refresh' }));

    // Since route doesn't catch rotateTokens errors explicitly, Fastify will send 401 and an error body
    expect(res.status).toBe(401);
    // body may be { error: 'Invalid refresh token' } if route catches, or Fastify error shape otherwise
    // We assert that the error message is present either way
    const body = res.body;
    const text = res.text;
    expect(body.error ?? text).toContain('Invalid refresh token');

    await app.close();
  });

  // ---------------- Logout ----------------
  test('POST /auth/logout - success returns 204 no content', async () => {
    jwtService.revokeRefreshToken.mockResolvedValue();

    const { app } = await buildApp();
    const res = await request(app.server)
      .post('/auth/logout')
      .send({ refreshToken: 'some-refresh' });

    expect(jwtService.revokeRefreshToken).toHaveBeenCalledWith('some-refresh');
    expect(res.status).toBe(204);
    // body should be empty
    expect(res.text).toBe('');

    await app.close();
  });

  test('POST /auth/logout - revokeRefreshToken error -> forwarded with message', async () => {
    const err = new Error('Bad request');
    err.statusCode = 400;
    jwtService.revokeRefreshToken.mockRejectedValue(err);

    const { app } = await buildApp();
    const res = await request(app.server)
      .post('/auth/logout')
      .send({ refreshToken: 'bad' });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Bad request' });

    await app.close();
  });

  // ---------------- Verify Token ----------------
  test('POST /auth/verify-token - success returns user info and defaults role to "user" when missing', async () => {
    // custom authenticate to set req.user without role
    const authenticateMock = async (req, reply) => {
      req.user = { id: 'uX', username: 'vx', email: 'vx@example.com' };
    };
    const { app } = await buildApp({ authenticateMock });

    const res = await request(app.server)
      .post('/auth/verify-token')
      .set('Authorization', 'Bearer token'); // header required by schema

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 'uX', username: 'vx', email: 'vx@example.com', role: 'user' });

    await app.close();
  });

  test('POST /auth/verify-token - missing Authorization header -> 400 (schema validation)', async () => {
    const { app } = await buildApp();
    // send without Authorization header -> Fastify schema should reject with 400
    const res = await request(app.server)
      .post('/auth/verify-token');

    // Fastify header schema validation triggers 400
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message');

    await app.close();
  });

  test('POST /auth/verify-token - authenticate throws -> forwarded status and message', async () => {
    const authenticateMock = jest.fn(async (req, reply) => {
      const err = new Error('Unauthorized token');
      err.statusCode = 401;
      throw err;
    });
    const { app } = await buildApp({ authenticateMock });

    const res = await request(app.server)
      .post('/auth/verify-token')
      .set('Authorization', 'Bearer badtoken');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'Unauthorized token' });

    await app.close();
  });

});
