
/**
 * Custom error classes for auth-service
 * - Structured error handling compatible with Fastify
 */

import fp from 'fastify-plugin';

/**
 * Base error for authentication and application-specific errors.
 * Contains an HTTP status code and a name.
 */
class AuthError extends Error {
  constructor(message, statusCode = 400) { // set 400 as the default reponse code
    super(message); //  initializes the built-in Error properties properly (especially message and stack).
    this.name = this.constructor.name; // sets error name to 'AuthError'
    this.statusCode = statusCode; // custom HTTP status code for this error
  }
}

/**
 * 400 Bad Request
 */
class ValidationError extends AuthError {
  constructor(message = 'Validation Error') {
    super(message, 400); // HTTP 400 Bad Request
  }
}

/**
 * 401 Unauthorized
 */
class InvalidCredentialsError extends AuthError {
  constructor(message = 'Invalid email or password') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden
 */
class ForbiddenError extends AuthError {
  constructor(message = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * 404 Not Found
 */
class NotFoundError extends AuthError {
  constructor(message = 'Resource not found') {
    super(message, 404);
  }
}

/**
 * 409 Conflict
 */
class ConflictError extends AuthError {
  constructor(message = 'Resource conflict') {
    super(message, 409);
  }
}

/**
 * 401 Unauthorized - Token expired
 */
class TokenExpiredError extends AuthError {
  constructor(message = 'Token has expired') {
    super(message, 401);
  }
}

/**
 * 401 Unauthorized - Token revoked or invalidated
 */
class TokenRevokedError extends AuthError {
  constructor(message = 'Token has been revoked') {
    super(message, 401);
  }
}

// Fastify plugin to decorate errors
// fp(...):Wrapping the function in fp() tells Fastify,This is a plugin,
/**
 * Fastify plugin to decorate error classes and set a global error handler.
 */
export default fp(async (fastify) => {
  // Decorate Fastify instance with error constructors
  fastify.decorate('errors', {
    AuthError,
    ValidationError,
    InvalidCredentialsError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    TokenExpiredError,
    TokenRevokedError,
  });

  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    // Handle known application errors
    if (error instanceof AuthError) {
      return reply.status(error.statusCode).send({
        error: error.name,
        message: error.message,
      });
    }

    // Handle Fasity validation errors
    if (error.validation) {
      return reply.status(400).send({
        error: 'ValidationError',
        message: 'Invalid request data',
        details: error.validation,
      });
    }

    // Unhandled errors --> Internal Server Error
    request.log.error(error);
    reply.status(500).send({
      error: 'InternalServerError',
      message: 'Something went wrong',
    });
  });
});

