const { normalizeAndValidateEmail, validatePassword } = require('../../src/utils/validators');

describe('Email Validation', () => {
  test('Accepts valid emails', () => {
    expect(normalizeAndValidateEmail('user@example.com')).toBe('user@example.com');
  });

  test('Normalizes emails', () => {
    expect(normalizeAndValidateEmail('User@Example.com')).toBe('user@example.com');
    expect(normalizeAndValidateEmail('u.ser@gmail.com')).toBe('user@gmail.com');
  });

  test('Rejects invalid emails', () => {
    expect(() => normalizeAndValidateEmail('invalid')).toThrow('Invalid email format');
  });
});

describe('Password Validation', () => {
  test('Accepts valid passwords', () => {
    expect(() => validatePassword('SecurePass123!')).not.toThrow();
  });

  test('Rejects weak passwords', () => {
    expect(() => validatePassword('weak')).toThrow(/8 characters/);
  });
});
