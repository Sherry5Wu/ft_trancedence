import fp from 'fastify-plugin';
import { promises as fsp } from 'fs';
import path from 'path';
import { Writable } from 'stream';
import crypto from 'crypto';
import fastifyStatic from '@fastify/static';
import { fileTypeFromBuffer } from 'file-type';

import { getUserById, updatePassword, updatePinCode, updateAvatar } from '../services/auth.service.js';
import { ValidationError } from '../utils/errors.js';
import { comparePassword } from '../utils/crypto.js';
import { NotFoundError } from '../utils/errors.js';

export default fp(async (fastify) => {
  // --- Configure upload directory and static service ---
  // Treat env as uploads root (default ./uploads). Avatars are stored in uploads/avatars.
  const avatarUploadPathEnv = process.env.AVATAR_UPLOAD_PATH || './uploads/avatars';
  // cwd: current work directory
  // path.reslove(): resolves a series of paths into an absolute path.
  // path.resolve('/app', './uploads/avatars') // => '/app/uploads/avatars'
  const uploadsRoot = path.resolve(process.cwd(), avatarUploadPathEnv); // e.g. /app/uploads/avatars

  // Public prefix used by fastify-static and returned avatar URLs
  const uploadsPrefix = '/uploads';

  // Ensure the directory exists (use promise API)
  try {
    // The recursive: true option prevents an error if the directory already exists.
    await fsp.mkdir(uploadsRoot, { recursive: true });
  } catch (err) {
    fastify.log.error({ err }, 'Failed to ensure upload directory exists');
    throw err;
  }

  // Register fastify-static to provide static file access at /uploads/...
  await fastify.register(fastifyStatic, {
    root: uploadsRoot, // directory for storing the avatars on local: /app/uploads/avatars
    prefix: `${uploadsPrefix}/`, // Client accesses URL prefix. e.g. request to /uploads/avatars/xxx.jpg will serve file uploadsRoot/avatars/xxx.jpg
    decorateReply: false // Disable automatic handling
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
    fastify.log.info('upload-avatar: handler start');
    const file = await req.file();
    fastify.log.info('upload-avatar: file', file);
    if (!file) throw new ValidationError('No file uploaded (field name must be "avatar")');
    let buffer;
    try {
      buffer = await file.toBuffer();
      fastify.log.info('upload-avatar: buffer length', buffer.length);
    } catch (err) {
      fastify.log.warn({ err }, 'Failed to read uploaded file');
      throw new ValidationError('Failed to process uploaded file');
    }

    const ft = await fileTypeFromBuffer(buffer);
    fastify.log.info('upload-avatar: fileType', ft);
    const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
    if (!ft || !allowedMimeTypes.has(ft.mime)) {
      fastify.log.warn('upload-avatar: unsupported image format', ft);
      throw new ValidationError('Unsupported image format');
    }

    const extMap = { jpeg: 'jpg' };
    const ext = '.' + (extMap[ft.ext] || ft.ext);

    if (!req.user) {
      fastify.log.warn('upload-avatar: req.user missing');
      throw new NotFoundError('User not found');
    }
    const userId = req.user.id;

    const filename = `${userId}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    const filepath = path.join(uploadsRoot, filename);
    const resolved = path.resolve(filepath);
    fastify.log.info('upload-avatar: resolved path', resolved);

    if (!resolved.startsWith(uploadsRoot + path.sep) && resolved !== uploadsRoot) {
      fastify.log.warn('upload-avatar: invalid filename/path', resolved);
      throw new ValidationError('Invalid filename / path resolution');
    }

    try {
      await fsp.writeFile(resolved, buffer);
      fastify.log.info('upload-avatar: file saved');
    } catch (err) {
      fastify.log.error({ err }, 'Failed to save uploaded avatar');
      throw new ValidationError('Failed to save uploaded file');
    }

    const avatarUrl = `${uploadsPrefix}/${filename}`;

    let previousAvatar = null;
    try {
      const userRecord = await fastify.models.User.findByPk(userId);
      previousAvatar = userRecord?.avatarUrl || null;
    } catch (err) {
      fastify.log.warn({ err }, 'Failed to read existing user avatar (non-fatal)');
      previousAvatar = null;
    }

    try {
      await updateAvatar(userId, avatarUrl);
    } catch (err) {
      try {
        await fsp.unlink(resolved);
      } catch (cleanupErr) {
        fastify.log.error({ cleanupErr }, 'Failed to remove new avatar after DB failure');
      }
      throw err;
    }

    if (previousAvatar) {
      try {
        let prevPathFromPrefix = null;
        try {
          if (/^https?:\/\//i.test(previousAvatar)) {
            const u = new URL(previousAvatar);
            prevPathFromPrefix = u.pathname.replace(/^\/+/, '');
          }
        } catch (e) {
          prevPathFromPrefix = null;
        }
        if (!prevPathFromPrefix) {
          if (previousAvatar.startsWith(uploadsPrefix)) {
            prevPathFromPrefix = previousAvatar.slice(uploadsPrefix.length).replace(/^\/+/, '');
          } else {
            prevPathFromPrefix = previousAvatar.replace(/^\/+/, '');
          }
        }
        const uploadsRootResolved = path.resolve(uploadsRoot);
        const prevResolved = path.resolve(uploadsRoot, prevPathFromPrefix);
        if ((prevResolved.startsWith(uploadsRootResolved + path.sep) || prevResolved === uploadsRootResolved) && prevResolved !== resolved) {
          await fsp.unlink(prevResolved).catch((e) => {
            fastify.log.warn({ e, prevResolved }, 'Failed to delete previous avatar (non-fatal)');
          });
        } else {
          fastify.log.warn({ prevResolved }, 'Previous avatar outside uploads root or same as new file - skipping delete');
        }
      } catch (err) {
        fastify.log.warn({ err }, 'Failed to clean up previous avatar (non-fatal)');
      }
    }

    fastify.log.info('upload-avatar: done');
    return reply.code(200).send({ avatarUrl });
  });

  // Julkinen reitti: hae avatarUrl usernamen perusteella
  fastify.get('/users/avatar/:username', {
    schema: {
      tags: ['User'],
      summary: 'Get avatar URL by username',
      params: {
        type: 'object',
        properties: {
          username: { type: 'string' }
        },
        required: ['username']
      },
      response: {
        200: {
          description: 'Avatar URL found',
          type: 'object',
          properties: {
            avatarUrl: { type: 'string' }
          }
        },
        404: {
          description: 'User not found',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (req, reply) => {
    const { username } = req.params;
    const user = await fastify.models.User.findOne({ where: { username } });
    if (!user) {
      return reply.code(404).send({ error: 'NotFound', message: 'User not found' });
    }
    return { avatarUrl: user.avatarUrl };
  });

});

