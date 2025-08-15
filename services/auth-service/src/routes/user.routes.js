import fp from 'fastify-plugin';
import {
  getUserById,
  updatePassword
} from '../services/auth.service.js';
import { ValidationError } from '../utils/errors.js';
import { comparePassword } from '../utils/crypto.js';

export default fp(async (fastify) => {
  /**
   * @route   GET /users/me
   * @desc    Get current user profile
   */
  fastify.get('/users/me', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['User'],
      summary: 'Get current user profile',
      description: 'Returns the authenticated user\'s profile information.',
      response: {
        200: {
          description: 'User profile retrieved successfully',
          $ref: 'publicUser#'
        },
        401: {
          description: 'Unauthorized - invalid or missing token',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (req, reply) => {
    const user = await getUserById(req.user.id);
    return user;
  });

  /**
   * @route   PATCH /users/me/password
   * @desc    Update current user password
   */
  fastify.patch('/users/me/password', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['User'],
      summary: 'Update user password',
      description: 'Allows the authenticated user to update their password.',
      body: {
        type: 'object',
        required: ['oldPassword', 'newPassword'],
        properties: {
          oldPassword: { type: 'string', minLength: 8, maxLength: 32, description: 'Current password' },
          newPassword: { type: 'string', minLength: 8, maxLength: 32, description: 'New password (at least 8 characters)' }
        }
      },
      response: {
        204: { description: 'Password updated successfully', type: 'null' },
        400: {
          description: 'Bad Request - validation failed or incorrect old password',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        401: {
          description: 'Unauthorized - invalid or missing token',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { oldPassword, newPassword } = req.body;
    // Validate old password first
    const userRecord = await fastify.models.User.scope('withSecrets').findByPk(req.user.id);
    if (!userRecord) {
      throw new ValidationError('User not found');
    }
    const isMatch = await comparePassword(oldPassword, userRecord.passwordHash);
    if (!isMatch) {
      throw new ValidationError('Incorrect current password');
    }
    // Update to new password
    await updatePassword(req.user.id, newPassword);
    return reply.code(204).send();
  });
});
