
/**
 * Normalizes and validates an email address by:
 * 1. Trimming whitespace.
 * 2. Converting to lowercase.
 * 3. Validating the format (basic RegExp check).
 *
 * @param {string} email - The email address to normalize.
 * @returns {string} The normalized email (trimmed + lowercase).
 * @throws {TypeError} If the input is not a string.
 * @throws {Error} If the email format is invalid after normalization.
 * @example
 * normalizeEmail('  User@Example.COM '); // Returns 'user@example.com'
 * normalizeEmail(null); // Throws TypeError
 * normalizeEmail('invalid'); // Throws Error (invalid format)
 */
export function normalizeEmail(email) {
  if (!email || typeof email !== 'string') throw new TypeError('Email must be a string.');
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error('Invalid email format.');
  }
  return normalized;
}
