import fp from 'fastify-plugin';
import { promises as fsp } from 'fs';
import path from 'path';
import { Writable } from 'stream';
import crypto from 'crypto';
import fastifyStatic from '@fastify/static';
import { fileTypeFromBuffer } from 'file-type';

import { getUserById, getUserByUsername, updatePassword, updatePinCode, updateAvatar } from '../services/auth.service.js';
import { ValidationError } from '../utils/errors.js';
import { comparePassword } from '../utils/crypto.js';
import { NotFoundError } from '../utils/errors.js';
import defineUser from '../db/models/user.js';
import { sequelize } from '../db/index.js';

export default fp(async (fastify) => {
  // --- Configure upload directory and static service ---
  // Treat env as uploads root (default ./uploads). Avatars are stored in uploads/avatars.
  const avatarUploadPathEnv = process.env.AVATAR_UPLOAD_PATH || './uploads/avatars';
  // cwd: current work directory
  // path.reslove(): resolves a series of paths into an absolute path.
  // path.resolve('/app', './uploads/avatars') // => '/app/uploads/avatars'
  const uploadsRoot = path.resolve(process.cwd(), avatarUploadPathEnv); // e.g. /app/uploads/avatars

  // Public prefix used by fastify-static and returned avatar URLs
  const uploadsPrefix = '/uploads/avatars';

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
   * @desc    Get current user profile:id, username, is2FAEnabled, avatarUrl.
   */
  fastify.get('/users/profile/me', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['User'],
      summary: 'Get current user profile',
      description: "Returns the authenticated user's profile information.",
      response: {
        200: {
          description: 'User profile retrieved successfully',
          required: ['data'],
          properties: {
            data: { $ref: 'publicUser#' },
          }
        },
        401: {
          description: 'Unauthorized - invalid or missing token',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        404: {
          description: 'User not found',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
        500: {
          description: 'Internal server error',
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' }
          }
        },
      }
    }
  }, async (req, reply) => {
    try {
      const user = await getUserById(req.user.id);
      if (!user) {
        return reply.status(404).send({
          error: 'User not found',
          message: `User with id $(req.user.id) does not exist`,
        });
      }
      const publicUser = {
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        TwoFAStatus: user.is2FAEnabled && user.is2FAConfirmed,
        registerFromGoogle: !!user.googleId,
      };
      return reply.code(200).send({ data: publicUser }); // return user id, username, avatarUrl and is2FAEnabled
    } catch (err) {
      return reply.status(500). send({
        error: 'Internal Server Error',
        message: err.message
      });
    }
  });

  /**
   * Get other user's profile (id, username and avatarUrl) by username
   * @route   GET /users/profile/:username
   * @desc    Get other user's profile by ID: userId, username and avatarUrl
   */
  fastify.get('/users/profile/:username', {
  schema: {
    tags: ['User'],
    summary: 'Get another user profile by username',
    description: 'Returns public information of a user specified by username.',
    params: {
      type: 'object',
      required: ['username'],
      properties: {
        username: { type: 'string', description: 'username' }
      }
    },
    response: {
      200: {
        description: 'user profile retrieved successfully',
        type: 'object',
        additionalProperties: false,
        required: ['success', 'code', 'data'],
        properties: {
          success: { type: 'boolean' },
          code: { type: 'string' },
          data: {
            type: 'object',
            additionalProperties: false,
            required: ['id', 'username'],
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              avatarUrl: { type: ['string', 'null'], format: 'uri' }
            }
          }
        }
      },
      404: { description: 'User not found', $ref: 'errorResponse#'},
    }
  }
  }, async (req, reply) => {
    try {
      const user = await getUserByUsername(req.params.username);

      if (!user) {
        // use your sendError helper (status, title, message)
        return sendError(
          reply,
          404,
          'User not found',
          `User with username ${req.params.username} does not exist`
        );
      }

      // return shape that matches the 200 schema
      return reply.send({
        success: true,
        code: 'USER_PROFILE_RETRIEVED',
        data: {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl || null
        }
      });
    } catch (err) {
      // If sendError also handles logging/formatting for 500, use it:
      return sendError(reply, 500, 'Internal Server Error', err.message || 'Unexpected error');
    }
  });

  /**
   * @route   PATCH /users/me/password
   * @desc    Update current user password
   */
  fastify.patch('/users/me/update-password', {
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
            success: { type: 'boolean' },
            code: { type: 'string' },
            message: { type: 'string' }
          }
        },
        401: {
          description: 'Unauthorized - invalid or missing token',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            code: { type: 'string' },
            message: { type: 'string' }
          }
        },
        404: {
          description: 'User not found',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            code: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (req, reply) => {
    try {
      const { oldPassword, newPassword } = req.body;

      const userRecord = await fastify.models.User.scope('withSecrets').findByPk(req.user.id);
      if (!userRecord) {
        return reply.code(404).send({
          success: false,
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }

      const isMatch = await comparePassword(oldPassword, userRecord.passwordHash);
      if (!isMatch) {
        return reply.code(400).send({
          success: false,
          code: 'INVALID_OLD_PASSWORD',
          message: 'Incorrect current password'
        });
      }

      await updatePassword(req.user.id, newPassword);
      return reply.code(200).send({ success: true, code: 'PASSWORD_UPDATED', message: 'The user password has been updated' });
    } catch (err) {
      return reply.code(500).send({
        success: false,
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      });
    }
  });

  fastify.patch('/users/me/update-pincode', {
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
          description: 'Bad Request - validation failed or incorrect old pin code',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            code: { type: 'string' },
            message: { type: 'string' }
          }
        },
        404: {
          description: 'User was not found',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            code: { type: 'string' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (req, reply) => {
    try {
      const { oldPinCode, newPinCode } = req.body;
      const userRecord = await fastify.models.User.scope('withSecrets').findByPk(req.user.id);

      if (!userRecord) {
        return reply.code(404).send({
          success: false,
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }

      const isMatch = await comparePassword(oldPinCode, userRecord.pinCodeHash);
      if (!isMatch) {
        return reply.code(400).send({
          success: false,
          code: 'OLD_PIN_NOT-MATCH',
          message: 'Incorrect old pin code'
        });
      }

      await updatePinCode(req.user.id, newPinCode);
      return reply.code(200).send({ success: true, code: 'PIN_CODE_UPDATED', message: 'The user PIN code has been updated' });
    } catch (err) {
      return reply.code(500).send({
        success: false,
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      });
    }
  });


  /**
   * @route   POST /users/verify-pincode
   * @desc    Verify player's PIN code
   */
  fastify.post('/users/verify-pincode', {
    schema: {
      tages: ['Auth'],
      summary: 'Verify user pinCode',
      body: {
        type: 'object',
        required: ['username', 'pinCode'], // Ask frontend want to send username or userId??
        properties: {
          username: { type: 'string'},
          pinCode: { type: 'string'},
        }
      },
      response: {
        200: {
          description: 'pinCode matches or failed due to incorrect PIN',
          type: 'object',
          required: ['success', 'code', 'message'],
          properties: {
            success: { type: 'boolean', description: 'Whether the verification succeeded' },
            code: { type: 'string', enum: ['PIN_MATCHES', 'PIN_NOT_MATCH'],
                    description: 'Business code indicating the reuslt of the operation' },
            message: { type: 'string', description: 'Human-readable message' },
            data: {
              type: 'object',
              nullable: true,
              properties: { userId: { type: 'string', description: 'ID of the user whose PIN code was verified' } }
            }
          }
        },
        404: {
          description: "User not found",
          type: 'object',
          required: ['success', 'code', 'message'],
          properties: {
            success: { type: 'boolean', example: false },
            code: { type: 'string', enum: ['USER_NOT_FOUND'] },
            message: { type: 'string', example: 'User not found' }
          }
        },
        429: {
          description: 'Too many attempts, PIN temporarily locked',
          type: 'object',
          required: ['success', 'code', 'message'],
          properties: {
            success: { type: 'boolean', example: false },
            code: { type: 'string', enum: ['TOO_MANY_ATTEMPTS'] },
            message: { type: 'string', example: 'Too many attempts, try later' }
          }
        }
      }
    }, async handler(req, reply) {
      const { username, pinCode } = req.body;

      const existingUser = await getUserByUsername(username);
      if (!existingUser) {
        return reply.code(404).send({
          success: false,
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        });
      }
      const isMatch = await comparePassword(pinCode, existingUser.pinCodeHash);
      if (!isMatch) {
        return reply.code(200).send({
          success: false,
          code: 'PIN_NOT_MATCH',
          message: 'Pin code is incorrect',
        });
      }
      return reply.code(200).send({
        success: true,
        code: 'PIN_MATCHES',
        message: 'Pin code matches',
        data: { userId: existingUser.id },
      });
    }
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
        properties: { avatarUrl: { type: 'string' } }
      },
      400: { description: 'Bad Request' },
      401: { description: 'Unauthorized' }
    }
  }
}, async (req, reply) => {
  const file = await req.file();
  if (!file) throw new ValidationError('No file uploaded');

  // Read buffer (5MB limit configured earlier)
  let buffer;
  try {
    buffer = await file.toBuffer();
  } catch (err) {
    fastify.log.warn({ err }, 'Failed to read uploaded file');
    throw new ValidationError('Failed to process uploaded file');
  }

  // Validate using magic bytes
  const ft = await fileTypeFromBuffer(buffer);
  const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
  if (!ft || !allowedMimeTypes.has(ft.mime)) {
    throw new ValidationError('Unsupported image format');
  }

  // Normalize extension
  const extMap = { jpeg: 'jpg' };
  const ext = '.' + (extMap[ft.ext] || ft.ext);

  // Ensure user
  if (!req.user) throw new NotFoundError('User not found');
  const userId = req.user.id;

  // Filenames & path
  const filename = `${userId}-${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
  const filepath = path.join(uploadsRoot, filename);
  const resolved = path.resolve(filepath);

  // Resolve uploads root once
  const uploadsRootResolved = path.resolve(uploadsRoot);

  // Safety: ensure we don't escape uploads root
  if (!resolved.startsWith(uploadsRootResolved + path.sep) && resolved !== uploadsRootResolved) {
    throw new ValidationError('Invalid filename / path resolution');
  }

  // Write file to disk
  try {
    await fsp.writeFile(resolved, buffer);
  } catch (err) {
    fastify.log.error({ err }, 'Failed to save uploaded avatar');
    throw new ValidationError('Failed to save uploaded file');
  }

  // Normalize uploadsPrefix: ensure leading slash, no trailing slash, single slashes
  const normalizedUploadsPrefix = ('/' + (uploadsPrefix || '/uploads')).replace(/\/+/g, '/').replace(/\/$/, '');

  // Build origin: prefer WEBSITE_ADDRESS, then fastify.config.publicOrigin, else derive from headers
  const configuredOrigin = process.env.WEBSITE_ADDRESS || fastify.config?.publicOrigin || null;
  let originToUse = null;

  if (configuredOrigin) {
    originToUse = configuredOrigin.replace(/\/*$/, ''); // strip trailing slash
  } else {
    // Derive from headers (fallback; not recommended for production)
    const host = (req.headers['x-forwarded-host'] || req.headers.host || 'localhost').split(',')[0].trim();
    const protoHeader = (req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
    const proto = protoHeader || (req.raw && req.raw.connection && req.raw.connection.encrypted ? 'https' : 'http');
    originToUse = `${proto}://${host}`;
  }

  // Ensure HTTPS (updateAvatar enforces it)
  if (!originToUse.startsWith('https://')) {
    fastify.log.warn({ originToUse }, 'Configured WEBSITE_ADDRESS / public origin is not https; forcing https for avatar URL to satisfy updateAvatar in this environment');
    originToUse = originToUse.replace(/^http:\/\//i, 'https://');
    if (!originToUse.startsWith('https://')) {
      originToUse = `https://${originToUse.replace(/^\/+/, '')}`;
    }
  }

  // Build final absolute avatar URL and dedupe slashes
  const avatarUrl = `${originToUse}${normalizedUploadsPrefix}/${filename}`.replace(/([^:])\/\/+/g, '$1/');

  //  for testing only  Log computed URL for debugging
  // fastify.log.info({ avatarUrl, configuredOrigin: process.env.WEBSITE_ADDRESS, normalizedUploadsPrefix, filename }, 'Computed avatarUrl to persist');

  // Fetch previous avatar (non-fatal)
  let previousAvatar = null;
  try {
    const userRecord = await fastify.models.User.findByPk(userId);
    previousAvatar = userRecord?.avatarUrl || null;
  } catch (err) {
    fastify.log.warn({ err }, 'Failed to read existing user avatar (non-fatal)');
    previousAvatar = null;
  }

  // Update DB via service and cleanup on DB failure
  try {
    fastify.log.info({ userId, avatarUrl }, 'Updating DB avatar for user');
    await updateAvatar(userId, avatarUrl);
  } catch (err) {
    fastify.log.error({ err, avatarUrl, userId }, 'updateAvatar failed; removing uploaded file');
    // Remove newly uploaded file to avoid orphaning
    await fsp.unlink(resolved).catch((cleanupErr) => {
      fastify.log.error({ cleanupErr }, 'Failed to remove new avatar after DB failure');
    });
    if (err instanceof NotFoundError) throw err;
    throw new ValidationError(err.message || 'Failed to update avatar in DB');
  }

  // Best-effort: delete previous avatar file if inside uploadsRoot and not the same file
  if (previousAvatar) {
    try {
      let prevPathFromPrefix = null;

      // Try parse absolute URL
      try {
        if (/^https?:\/\//i.test(previousAvatar)) {
          const u = new URL(previousAvatar);
          prevPathFromPrefix = u.pathname.replace(/^\/+/, '');
        }
      } catch (e) {
        prevPathFromPrefix = null;
      }

      if (!prevPathFromPrefix) {
        if (previousAvatar.startsWith(normalizedUploadsPrefix)) {
          prevPathFromPrefix = previousAvatar.slice(normalizedUploadsPrefix.length).replace(/^\/+/, '');
        } else {
          prevPathFromPrefix = previousAvatar.replace(/^\/+/, '');
        }
      }

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

  return reply.code(200).send({ avatarUrl });
});

  /**
   * @route   get /users/all
   * @desc    Get all the users from user table, only return username and avatarUrl. Design for searching
   */
  fastify.get('/users/all', {
    preHandler: [fastify.authenticate],
    schema: {
      tags: ['User'],
      summary: 'Get all users (username and avatarUrl)',
      response: {
        200: {
          description: 'All users retrieved successfully',
          type: 'object',
          required: ['total', 'users'],
          properties: {
            total: { type: 'integer', description: 'Number of users returned' },
            users: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  avatarUrl: { type: ['string', 'null'], format: 'url', description: 'Url to avatar or null' },
                }
              },
            },
          }
        },
        401: {
        description: 'Unauthorized',
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' }
        }
      },
      500: {
        description: 'Internal server error',
        type: 'object',
        properties: {
          error: { type: 'string' },
          message: { type: 'string' }
        }
      }
    }
  },
  }, async (req, reply) => {
    let User;
    try {
      User = defineUser(sequelize);
      // Only select the fields the frontend needs
      const users = await User.findAll({
        attributes: ['username', 'avatarUrl'],
        order: [['username', 'ASC']],
      });

      // set header of convenience and return minimal payload
      reply.header('X-Total-Count', users.length);
      return reply.code(200).send({
        total: users.length,
        users: users.map(u => ({
          username: u.username,
          avatarUrl: u.avatarUrl ?? null
        }))
      });
    } catch (err) {
      req.log?.error?.(err);
      return reply.code(500).send({
        error: 'Failed to fetch users',
        message: err.message || 'Internal server error'
      });
    }
  });
});

