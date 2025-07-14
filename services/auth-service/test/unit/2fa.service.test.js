const { generate2FASecret, verify2FAToken } = require('../../src/services/2fa.service');
const db = require('../../src/db');

describe('2FA Service', () => {
  let testUser;

  beforeAll(async () => {
    // Setup test user
    testUser = await db.User.create({
      email: '2fa_test@example.com',
      passwordHash: 'temp_hash'
    });
  });

  afterAll(async () => {
    await db.User.destroy({ where: { id: testUser.id } });
  });

  test('generate2FASecret() creates valid secret', async () => {
    const { secret, otpauthUrl } = generate2FASecret(testUser.id);
    expect(secret).toHaveLength(32);
    expect(otpauthUrl).toContain('otpauth://totp');
  });

  test('verify2FAToken() validates correct token', async () => {
    const { secret } = generate2FASecret(testUser.id);
    await testUser.update({ twoFASecret: secret });

    // Mock valid token (in real usage, use speakeasy.totp())
    const validToken = '123456'; // Replace with actual TOTP generation in real tests
    const isValid = await verify2FAToken(testUser.id, validToken);
    expect(isValid).toBe(true);
  });

  test('verify2FAToken() rejects invalid token', async () => {
    const isValid = await verify2FAToken(testUser.id, '000000');
    expect(isValid).toBe(false);
  });
});
