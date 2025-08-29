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
  storeRefreshTokenHash,
} from '../utils/jwt.js';

import {
  TokenExpiredError,
  TokenRevokedError,
  NotFoundError,
  InvalidCredentialsError,
} from '../utils/errors.js';
import { hashToken, compareToken } from '../utils/crypto.js';

const { User, RefreshToken } = models;

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

  const tokenHash = hashToken(refreshToken);

  // persist refresh token in DB
  await RefreshToken.create({
    tokenHash,
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
  // verify signature (JWT check)
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') throw new TokenExpiredError();
    throw error;
  }

  // hash incoming token before lookup
  const tokenHash = hashToken(token);
  const stored = await RefreshToken.findOne({ where: { tokenHash } });
  if (!stored) throw new NotFoundError('Refresh token not found');

  // revoked?
  if (stored.revokedAt) throw new TokenRevokedError();

  // expired?
  if (stored.expiresAt && stored.expiresAt < new Date()) throw new TokenExpiredError();

  // optional: timing safe compare (extra hardening, even though DB lookup is already by hash)
  if (!compareToken(token, stored.tokenHash)) {
    throw new NotFoundError('Refresh token mismatch');
  }

  return decoded;
}

/**
 * Rotate refresh token: revoke old, issue new pair, persist new refresh token into DB.
 * @param {string} token - old refresh token
 * @param {object} meta - optional metadata for new token
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: JSON }>}
 */
async function rotateTokens(token, opts = {}) {
  // ensure token it a non-empty string
  if (typeof token !== 'string' || !token.trim()) throw new InvalidCredentialsError('The request must contain: token');

  token = token.trim();

  // const { ip = null, userAgent = null } = opts;
    // Accept either { ip } or { ipAddress } from callers
  const { ip = null, ipAddress = null, userAgent = null } = opts;
  const ipToStore = ip || ipAddress || null;

  // validate old
  const decoded = await validateRefreshToken(token);
    // find the user
  const existingUser = await User.findByPk(decoded.id);
  if (!existingUser) throw new NotFoundError('User not found');

  //generate the payloads
  const accessTokenPayload = {
    id: existingUser.id,
    email: existingUser.email,
    username: existingUser.username,
    // is2FAEnabled: !!existingUser.twoFASecret,
  };
  const refreshTokenPayload = { id: existingUser.id };

  // generate new tokens
  const accessToken = generateAccessToken(accessTokenPayload);
  const newRefreshToken = generateRefreshToken(refreshTokenPayload);

  const oldHash = hashToken(token);
  const newHash = hashToken(newRefreshToken);

    // Use a transaction: revoke old and insert new atomically (Sequelize example)
  // If you don't use Sequelize or don't want a transaction, at least update replacedByToken after store
  const sequelize = RefreshToken.sequelize || User.sequelize; // adjust for your setup
  if (!sequelize) {
    // fallback: do operations sequentially but still set replacedByToken to newHash after storing
    await storeRefreshTokenHash(newRefreshToken, existingUser.id, ipToStore, userAgent);
    await RefreshToken.update(
      { revokedAt: new Date(), replacedByToken: newHash },
      { where: { tokenHash: oldHash } }
    );
  } else {
    await sequelize.transaction(async (tx) => {
      // store new token
      await storeRefreshTokenHash(newRefreshToken, existingUser.id, ipToStore, userAgent, { transaction: tx });

      // revoke old and set replacedByToken to new token hash
      await RefreshToken.update(
        { revokedAt: new Date(), replacedByToken: newHash },
        { where: { tokenHash: oldHash }, transaction: tx }
      );
    });
  }

  // store the new refreshToken into DB
  // await storeRefreshTokenHash(refreshToken, existingUser.id, ip, userAgent);

  // generate user data for return
  const publicUser = {
    id: existingUser.id,
    username: existingUser.username,
    avatarUrl: existingUser.avatarUrl || null,
    TwoFAStatus: existingUser.is2FAEnabled && existingUser.is2FAConfirmed,
    registerFromGoogle: !!existingUser.googleId,
  };

  return { accessToken, newRefreshToken, user: publicUser };
}

/**
 * Revoke a specific refresh token (logout single session).
 * @param {string} token
 * @returns {Promise<void>}
 */
async function revokeRefreshToken(token) {
  const tokenHash = hashToken(token);
  const stored = await RefreshToken.findOne({ where: { tokenHash } });
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
