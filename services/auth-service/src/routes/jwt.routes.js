import { authenticateUser, registerUser } from '../services/auth.service.js';

// Simple ValidationError class for this route
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

// Simple email validation
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default async function jwtRoutes(fastify) {
  // Register new user
  fastify.post('/auth/register', async (req, reply) => {
    try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }
      
      if (!validateEmail(email)) {
        throw new ValidationError('Invalid email format');
      }

      // Proceed with registration  
      const normalizedEmail = email.toLowerCase().trim();
      const token = await registerUser(normalizedEmail, password);
      reply.send({ token });

    } catch (error) {
      if (error instanceof ValidationError) {
        reply.code(400).send({ error: error.message });
      } else {
        throw error; // Let Fastify handle other errors
      }
    }
  });

  // Login existing user
  fastify.post('/auth/login', async (req, reply) => {
    try {
      const { email, password } = req.body;

      // Basic validation
      if (!email || !password) {
        throw new ValidationError('Email and password are required');
      }

      // Normalize email (assumes email was validated during registration)
      const normalizedEmail = email.toLowerCase().trim();
      const token = await authenticateUser(normalizedEmail, password);
      reply.send({ token });

    } catch (error) {
      if (error.name === 'InvalidCredentialsError') {
        reply.code(401).send({ error: error.message });
      } else {
        throw error;
      }
    }
  });
}
