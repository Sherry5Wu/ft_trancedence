// tests/2fa.service.test.js
import { jest } from '@jest/globals';

// Mock the models import used in the service
jest.unstable_mockModule('../db/index.js', () => ({
  models: {
    User: {
      findByPk: jest.fn(),
    },
  },
}));

// Mock crypto helpers used by service
jest.unstable_mockModule('../utils/crypto.js', () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
  encryptSecret: jest.fn(),
  decryptSecret: jest.fn(),
}));

// Now import the service (ESM)
const { models } = await import('../db/index.js');
const {
  hashPassword,
  comparePassword,
  encryptSecret,
  decryptSecret,
} = await import('../utils/crypto.js');

const {
  generateTwoFASetup,
  consumeBackupCode,
} = await import('../services/2fa.service.js');

describe('2FA service (unit)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('generateTwoFASetup: persists encrypted secret and hashed backup codes, returns plaintext backup codes', async () => {
    // Arrange: fake user
    const fakeUser = {
      id: 'user-1',
      email: 'a@b.com',
      twoFASecret: null,
      backupCodes: null,
      update: jest.fn().mockResolvedValue(true),
    };
    models.User.findByPk.mockResolvedValue(fakeUser);

    // make deterministic crypto functions
    encryptSecret.mockImplementation((plain) => `enc(${plain})`);
    // hash backup returns predictable hashed value
    hashPassword.mockImplementation((code) => Promise.resolve(`HASHED:${code}`));

    // Act
    const result = await generateTwoFASetup('user-1');

    // Assert
    expect(result).toHaveProperty('secret');
    expect(result).toHaveProperty('otpauthUrl');
    expect(Array.isArray(result.backupCodes)).toBe(true);
    expect(result.backupCodes.length).toBe(10);

    // user.update should be called with encrypted secret and hashed backup codes
    expect(fakeUser.update).toHaveBeenCalledTimes(1);
    const updateArg = fakeUser.update.mock.calls[0][0];
    expect(updateArg.twoFASecret).toMatch(/^enc\(/);
    expect(Array.isArray(updateArg.backupCodes)).toBe(true);
    expect(updateArg.backupCodes.length).toBe(10);
    // hashed values prefix
    expect(updateArg.backupCodes[0]).toMatch(/^HASHED:/);
  });

  test('consumeBackupCode: returns true and removes a matched hashed code', async () => {
    // Arrange: fake user with two hashed codes
    const hashedArray = ['H1', 'H2', 'H3'];
    const fakeUser = {
      id: 'user-2',
      email: 'x@y.com',
      twoFASecret: 'whatever',
      backupCodes: [...hashedArray],
      update: jest.fn().mockResolvedValue(true),
    };
    models.User.findByPk.mockResolvedValue(fakeUser);

    // comparePassword should return false for index 0, true for index 1
    comparePassword.mockImplementation((code, hashed) => {
      if (hashed === 'H2') return Promise.resolve(true);
      return Promise.resolve(false);
    });

    // Act
    const ok = await consumeBackupCode('user-2', 'the-code');

    // Assert
    expect(ok).toBe(true);
    expect(fakeUser.update).toHaveBeenCalledTimes(1);
    const updated = fakeUser.update.mock.calls[0][0];
    expect(Array.isArray(updated.backupCodes)).toBe(true);
    // one item removed -> length 2
    expect(updated.backupCodes.length).toBe(2);
    // ensure H2 removed
    expect(updated.backupCodes).not.toContain('H2');
  });

  test('consumeBackupCode: returns false when no hashed matches', async () => {
    const fakeUser = {
      id: 'user-3',
      email: 'z@y.com',
      backupCodes: ['A', 'B'],
      update: jest.fn(),
    };
    models.User.findByPk.mockResolvedValue(fakeUser);

    comparePassword.mockResolvedValue(false);

    const ok = await consumeBackupCode('user-3', 'nope');
    expect(ok).toBe(false);
    expect(fakeUser.update).not.toHaveBeenCalled();
  });
});
