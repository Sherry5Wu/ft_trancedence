import {
  normalizeAndValidateEmail,
  normalizeEmail,
  validatePassword,
  ValidationError
} from '../utils/validators.js';
import { loginUser, registerUser } from '../services/auth.service.js';

export default async function jwtRoutes(fastify) {
  // Register new user
  fastify.post('/auth/register', async (req, reply) => {
    try {
      const { email, password } = req.body;

      // Validate and normalize email + validate password
      const normalizedEmail = normalizeAndValidateEmail(email);
      validatePassword(password);

      // Proceed with registration
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

      // Normalize email (assumes email was validated during registration)
      const normalizedEmail = normalizeEmail(email);
      const token = await loginUser(normalizedEmail, password);
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
