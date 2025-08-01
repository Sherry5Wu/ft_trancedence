/**
 * jwt.service.js in auth-service acts as the business logic layer that utils/jwt.js
 * helper functions and provides a clear interface for higher-level operations like:
 *  - Generating access & refresh tokens after user login or OAuth login.
 *  - Verifying access token for protected routes.
 *  - Rotating refresh tokens securely.
 *  - Decoding tokens for internal checks or logging.
 */

import { models } from '../db/index.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
} from '../utils/jwt.js';

import {
  TokenExpiredError,
  TokenRevokedError,
  NotFoundError,
} from '../utils/errors.js';

const { RefreshToken } = models;

/**
 * Create and return new access & refresh tokens, and persist refresh token.
 * @param {object} payload - JWT payload (id, email, role, is2FAEnabled)
 * @param {object} options - Optional metadata for refresh token
 * @param {string} [options.ipAddress]
 * @param {string} [options.userAgent]
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
async function createTokens(payload, { ipAddress = null, userAgent = null } = {}) {
  // generate token
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  //calculate expiresAt by decoding refresh token expiration claim
  const decoded = decodeToken(refreshToken);
  const expiresAt = decoded && decoded.exp ? new Date(decoded.exp * 1000) : null;

  // persist refresh token in DB
  await RefreshToken.create({
    token: refreshToken,
    userId: payload.id,
    expiresAt,
    ipAddress,
    userAgent,
  });

  return { accessToken, refreshToken };
}

/**
 * Verify access token and return decoded payload.
 * @param {string} token
 * @returns {object} payload
 * @throws {TokenExpiredError|AuthError}
 */
function validateAccessToken(token) {
  try {
    return verifyAccessToken(token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') throw new TokenExpiredError();
    throw error;
  }
}

/**
 * Verify refresh token against signature and DB record.
 * @param {string} token
 * @returns {Promise<object>} decoded payload
 * @throws {TokenExpiredError|TokenRevokedError|NotFoundError}
 */
async function validateRefreshToken(token) {
  // verify signature
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') throw new TokenExpiredError();
    throw error;
  }

  // find stored token
  const stored = await RefreshToken.findOne({ where: { token } });
  if (!stored) throw new NotFoundError('Refresh token not found');

  // check revoked
  if (stored.revokedAt) throw new TokenRevokedError();

  // check expiration
  if (stored.expiresAt && stored.expiresAt < new Date()) throw new TokenExpiredError();

  return decoded;
}

/**
 * Rotate refresh token: revoke old, issue new pair, persist new.
 * @param {string} token - old refresh token
 * @param {object} meta - optional metadata for new token
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
async function rotateTokens(token, meta = {}) {
  // validate old token
  const decoded = await validateRefreshToken(token);

  // revoke old token
  await RefreshToken.update(
    { revokedAt: new Date(), replacedByToken: 'rotating' },
    { where: { token } },
  );

  // create new tokens
  const payload = {
    id: decoded.id,
    email: decoded.email,
    role: decoded.role,
    is2FAEnabled: decoded.is2FAEnabled,
  };

  const { accessToken, refreshToken } = await createTokens(payload, meta);

  // update replacedBytoken reference
  await RefreshToken.update(
    { replacedByToken: refreshToken },
    { where: { token } }
  );
  return { accessToken, refreshToken };
}

/**
 * Revoke a specific refresh token (logout single session).
 * @param {string} token
 * @returns {Promise<void>}
 */
async function revokeRefreshToken(token) {
  const stored = await RefreshToken.findOne({ where: { token } });
  if (!stored) return;
  await stored.update({ revokedAt: new Date() });
}

/**
 * Decode JWT without verifying signature.
 * @param {string} token
 * @returns {object|null}
 */
function decodeJwt(token) {
  return decodeToken(token);
}

export {
  createTokens,
  validateAccessToken,
  validateRefreshToken,
  rotateTokens,
  revokeRefreshToken,
  decodeJwt,
}
