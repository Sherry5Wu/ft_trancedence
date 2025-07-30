
/**
 * Custom error classes for auth-service
 * - Structured error handling compatible with Fastify
 */

import fp from 'fastify-plugin';

class AuthError extends Error {
  constructor(message, statusCode = 400) { // set 400 as the default reponse code
    super(message); //  initializes the built-in Error properties properly (especially message and stack).
    this.name = this.constructor.name; // sets error name to 'AuthError'
    this.statusCode = statusCode; // custom HTTP status code for this error
  }
}

// Specific error types
class ValidationError extends AuthError {
  constructor(message) {
    super(message, 400); // HTTP 400 Bad Request
  }
}

// Specific error types
class InvalidCredentialsError extends AuthError {
  constructor() {
    super('Invalid email or password', 401);
  }
}

// Fastify plugin to decorate errors
// fp(...):Wrapping the function in fp() tells Fastify,This is a plugin,
// not just a random function.
export default fp(async (fastify) => {
  // The value of authErrors is an object that contains two custom error classes
  fastify.decorate('authErrors', { //  add 'authErrors' as a property on the instance
    ValidationError,
    InvalidCredentialsError,
  });
});

// Anywhere in the Fasity app, you can use:
// fastify.authErrors.ValidationError
// fastify.authErrors.InvalidCredentialsError
