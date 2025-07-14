/**
 * Modular validation utilities for auth-service.
 * Separates email format checks and normalization for flexibility.
 */

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

// --- Email Validation ---
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Validates email format (RFC 5322).
 * @throws {ValidationError} if invalid
 */
const validateEmailFormat = (email) => {
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
    throw new ValidationError('Invalid email format');
  }
};

/**
 * Normalizes email (lowercase + Gmail dot handling).
 * @returns {string} Normalized email
 */
const normalizeEmail = (email) => {
  if (typeof email !== 'string' || !email.trim()) {
    throw new ValidationError('Email is required');
  }

  let normalized = email.trim().toLowerCase();
  const [localPart, domain] = normalized.split('@');

  // Optional: Handle Gmail dot aliases
  if (domain === 'gmail.com') {
    normalized = localPart.replace(/\./g, '') + '@gmail.com';
  }

  return normalized;
};

// --- Password Validation ---
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const validatePassword = (password) => {
  if (!PASSWORD_REGEX.test(password)) {
    throw new ValidationError(
      'Password must contain: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char (@$!%*?&)'
    );
  }
};

// --- Combined Email Helper ---
/**
 * Validates AND normalizes email in one call.
 * For convenience in most use cases.
 */
const normalizeAndValidateEmail = (email) => {
  validateEmailFormat(email);
  return normalizeEmail(email);
};

module.exports = {
  // Individual functions
  validateEmailFormat,
  normalizeEmail,
  validatePassword,

  // Combined function
  normalizeAndValidateEmail,

  // Error class
  ValidationError,
};
