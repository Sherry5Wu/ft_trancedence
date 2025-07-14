const { jwtSign, jwtVerify } = require('../../src/services/jwt.service');

describe('JWT Service', () => {
  const payload = { userId: '123' };

  test('Sign and verify token', () => {
    const token = jwtSign(payload);
    const decoded = jwtVerify(token);
    expect(decoded.userId).toBe(payload.userId);
  });

  test('Rejects invalid token', () => {
    expect(() => jwtVerify('invalid.token.here')).toThrow();
  });
});
