/**
 * Custom error classes for auth-service
 * - Structured error handling compatible with Fastify
 */

class AuthError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

// Specific error types
class ValidationError extends AuthError {
  constructor(message) {
    super(message, 400); // HTTP 400 Bad Request
  }
}

class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid email or password', 401);
  }
}

// Fastify plugin to decorate errors
module.exports = fp(async (fastify) => {
  fastify.decorate('authErrors', {
    ValidationError,
    InvalidCredentialsError,
  });
});
