/**
 * Custom Errors for Auth Service
 * - Structured error handling for Fastify (compatible with @fastify/sensible).
 */

class AuthError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
  }
}

// Specific error types
class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid email or password', 401);
  }
}

class TwoFANotEnabledError extends AuthError {
  constructor() {
    super('2FA not enabled for this account', 403);
  }
}

class TwoFAInvalidTokenError extends AuthError {
  constructor() {
    super('Invalid 2FA token', 401);
  }
}

// Fastify error handler plugin
module.exports = fp(async (fastify) => {
  fastify.decorate('authErrors', {
    InvalidCredentialsError,
    TwoFANotEnabledError,
    TwoFAInvalidTokenError,
  });

  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof AuthError) {
      reply.status(error.statusCode).send({ error: error.message });
    } else {
      fastify.log.error(error);
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
});
