import fp from 'fastify-plugin';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { Writable } from 'stream';
import crypto from 'crypto';
import multipart from '@fastify/multipart';
import fastifyStatic from 'fastify-static';

import { getUserById, updatePassword, updatePinCode, updateAvatar } from '../services/auth.service.js';
import { ValidationError } from '../utils/errors.js';
import { comparePassword } from '../utils/crypto.js';

export default fp(async (fastify) => {
  // --- Configure upload directory and static service ---
  const avatarUploadPathEnv = process.env.AVATAR_UPLOAD_PATH || './uploads/avatars';
  // Resolve to an absolute path (based on the current working directory of the process)
  const uploadDir = path.resolve(process.cwd(), avatarUploadPathEnv);
  const uploadsRoot = path.dirname(uploadDir); // e.g. /proj/uploads

  // avatarsRelativePath must be a posix-like path suitable for URLs.
  // If the resolved relative path goes "up" (starts with '..'), fallback to the basename
  let avatarsRelativePath = path.relative(uploadsRoot, uploadDir).split(path.sep).join('/');
  if (!avatarsRelativePath || avatarsRelativePath.startsWith('..')) {
    avatarsRelativePath = path.basename(uploadDir);
  }

  // Set a static access prefix (the prefix for front-end URL access)
  const uploadsPrefix = '/uploads';

  // Ensure the directory exists
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (err) {
    // If we can't create the upload dir, fail fast — the server shouldn't continue
    fastify.log.error({ err }, 'Failed to ensure upload directory exists');
    throw err;
  }

  // Register fastify-multipart (to handle file uploads) and limit single file size
  await fastify.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 1,
    }
  });

  // Register fastify-static to provide static file access at /uploads/...
  await fastify.register(fastifyStatic, {
    root: uploadsRoot,
    prefix: `${uploadsPrefix}/`, // e.g. request to /uploads/avatars/xxx.jpg will serve file uploadsRoot/avatars/xxx.jpg
  });

  // Cross-platform "black hole" writable stream to consume and discard readable streams safely
  const devNull = new Writable({
    write(chunk, encoding, callback) { callback(); }
  });

  /**
   * @route   GET /users/me
   * @desc    Get current user profile
   */
  fastify.get('/users/me', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['User'],
      summary: 'Get current user profile',
      description: "Returns the authenticated user's profile information.",
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

  fastify.patch('/users/me/pincode', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['User'],
      summary: 'Update user pin code',
      body: {
        type: 'object',
        required: ['oldPinCode', 'newPinCode'],
        properties: {
          oldPinCode: {
            type: 'string',
            minLength: 4,
            maxLength: 4,
            pattern: '^[0-9]{4}$',
          },
          newPinCode: {
            type: 'string',
            minLength: 4,
            maxLength: 4,
            pattern: '^[0-9]{4}$',
          },
        }
      },
      response: {
        204: { description: 'Pin code updated successfully', type: 'null' },
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
    const { oldPinCode, newPinCode } = req.body;
    const userRecord = await fastify.models.User.scope('withSecrets').findByPk(req.user.id);
    if (!userRecord) {
      throw new ValidationError('User not found');
    }
    const isMatch = await comparePassword(oldPinCode, userRecord.pinCodeHash);
    if (!isMatch) {
      throw new ValidationError('Incorrect pin code');
    }
    await updatePinCode(req.user.id, newPinCode);
    return reply.code(204).send();
  });

  /**
   * @route   POST /users/me/upload-avatar
   * @desc    Upload avatar image and update user's avatar URL in DB
   * Accepts multipart/form-data with field name `avatar` (single file)
   */
  fastify.post('/users/me/upload-avatar', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['User'],
      summary: 'Upload user avatar',
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        properties: {
          avatar: { type: 'string', format: 'binary' }
        }
      },
      response: {
        200: {
          description: 'Avatar uploaded successfully',
          type: 'object',
          properties: {
            avatarUrl: { type: 'string' }
          }
        },
        400: { description: 'Bad Request' },
        401: { description: 'Unauthorized' }
      }
    }
  }, async (req, reply) => {
    // req.file() will parse the first file in the multipart form
    const file = await req.file(); // fastify-multipart

    if (!file) {
      throw new ValidationError('No file uploaded (field name must be "avatar")');
    }

    // Basic mime-type check
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      // consume stream to avoid resource leak
      try {
        await pipeline(file.file, devNull);
      } catch (e) {
        fastify.log.warn({ err: e }, 'Failed to discard invalid upload stream');
      }
      throw new ValidationError('Uploaded file is not an image');
    }

    // Allowed extensions and mimetype map
    const allowedExt = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
    const mimeToExt = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif'
    };

    // Determine extension: prefer the filename extension, otherwise map from mimetype
    let ext = path.extname(file.filename || '').toLowerCase();
    if (!allowedExt.has(ext)) {
      ext = mimeToExt[file.mimetype];
      if (!ext || !allowedExt.has(ext)) {
        await pipeline(file.file, devNull);
        throw new ValidationError('Unsupported image format');
      }
    }

    // If extension exists but is not allowed -> reject
    if (ext && !allowedExt.has(ext)) {
      try { await pipeline(file.file, devNull); } catch (e) { /* ignore */ }
      throw new ValidationError('Unsupported image extension. Allowed: .jpg, .jpeg, .png, .webp, .gif');
    }

    const safeExt = ext || mappedExt;

    // Generate a safe, unique filename
    // Note: crypto.randomUUID() is available in Node 14.17+ / 16+. Adjust if using older runtimes.
    const filename = `${req.user.id}-${Date.now()}-${crypto.randomUUID()}${safeExt}`;
    const filepath = path.join(uploadDir, filename);

    // Write stream to disk
    try {
      const writeStream = fs.createWriteStream(filepath, { flags: 'wx' }); // fail if exists
      await pipeline(file.file, writeStream);
    } catch (err) {
      // remove any partially written file
      try { if (fs.existsSync(filepath)) fs.unlinkSync(filepath); } catch (e) { /* ignore */ }
      // surface a friendly validation error for the API consumer
      fastify.log.error({ err }, 'Failed to save uploaded avatar');
      throw new ValidationError('Failed to save uploaded file');
    }

    // Build the public URL relative to static prefix
    // Example: /uploads/avatars/<filename>
    const avatarUrl = `${uploadsPrefix}/${path.posix.join(avatarsRelativePath, filename)}`;

    // Update DB, but if DB update fails, remove the written file to avoid junk
    try {
      await updateAvatar(req.user.id, avatarUrl);
    } catch (err) {
      // cleanup file
      try { fs.unlinkSync(filepath); } catch (e) { /* ignore unlink error */ }
      // rethrow the original error (service layer should throw ValidationError or similar)
      throw err;
    }
    return reply.code(200).send({ avatarUrl });
  });
});
