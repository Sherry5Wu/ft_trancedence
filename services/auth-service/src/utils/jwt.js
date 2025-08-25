/**
 * Generate JWT tokens during login/registration
 * Verify tokens when users access protected routes
 * Possibly decode tokens for user identification
 */

import jwt from 'jsonwebtoken';

import { models } from '../db/index.js';
import { InvalidCredentialsError } from './errors.js'
import { hashToken } from './crypto.js';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '15m';
const REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';
const { RefreshToken } = models;

/**
 * Generate Access JWT token(short-lived).
 * @param {object} payload - Data to encode in the token(e.g., { id: userId }).
 * @returns {string} access token.
 */

function generateAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRATION });
}

/**
 * Generate Refresh JWT token(long-lived).
 * @param {object} payload - Usually only { id: userId }.
 * @returns {string} refresh token.
 */

function generateRefreshToken(payload) {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRATION });
}

/**
 * Verify an Access JWT token and return the decoded payload.
 * @param {string} token - The JWT token to verify.
 * @returns {object} Decoded payload.
 * @throws {Error} If the token is invalid or expired, it throws an error
 * (e.g., JsonWebTokenError, TokenExpiredError).
 */

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

/**
 * Verify a Refresh JWT token and return the decoded payload.
 * @param {string} token - The JWT token to verify.
 * @returns {object} Decoded payload.
 * @throws {Error} If the token is invalid or expired.
 */
function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

/**
 * Decode a JWT (either Access or Refresh) token without verifying its signature.
 * Use only when you need to read the payload without enforcing security. Usually use
 * it for testing.
 * NOTE: Do not use for authentication or authorization.
 * @param {string} token - The JWT token.
 * @returns {object|null} Decoded payload or null if invalid.
 */
// complete: false  --> only return the payload;
// complete: true   --> return an object with three parts: header, payload and signature
function decodeToken(token) {
  return jwt.decode(token, { complete: false });
}

/**
 * Store a refresh token (hashed) in DB.
 * @param {string} token - raw refresh token (JWT)
 * @param {string} userId
 * @param {string|null} ip
 * @param {string|null} userAgent
 * @returns {Promise<Object>} created RefreshToken row
 */
async function storeRefreshTokenHash(rawRefreshToken, userId, ip = null, userAgent = null) {
  if (!rawRefreshToken || !userId) {
    throw new InvalidCredentialsError('Token and userId are required');
  }

  // derive expiry from token when possible
  let expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // fallback 7d
  try {
    const decoded = decodeToken(rawRefreshToken);
    if (decoded && decoded.exp) {
      expiresAt = new Date(decoded.exp * 1000);
    }
  } catch (err) {
    // decode may fail; fallback used
  }

  const tokenHash = hashToken(rawRefreshToken);

  // store hashed token, not raw token
  const created = await RefreshToken.create({
    tokenHash,
    userId,
    expiresAt,
    ipAddress: ip,
    userAgent
  });

  return created;
}

/* --- validate refresh token: verify signature + DB presence & status --- */
async function validateRefreshToken(rawRefreshToken) {
  // 1) verify signature/expiry of JWT
  let decoded;
  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch (err) {
    // will throw TokenExpiredError or JsonWebTokenError
    throw err;
  }

  // 2) check DB for hashed token record
  const tokenHash = hashToken(rawRefreshToken);
  const tokenRow = await RefreshToken.findOne({ where: { tokenHash } });

  if (!tokenRow) throw new Error('Refresh token not found');            // invalid
  if (tokenRow.revokedAt) throw new Error('Refresh token revoked');     // revoked
  if (tokenRow.replacedByToken) throw new Error('Refresh token rotated'); // rotated/replaced
  if (tokenRow.expiresAt && new Date() > tokenRow.expiresAt) throw new Error('Refresh token expired');

  // return both decoded payload and DB row for further processing
  return { decoded, tokenRow };
}

/* --- createTokens: produce raw tokens and store hashed refresh token --- */
async function createTokens(payload, meta = {}) {
  // payload
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload); // raw JWT refresh token

  // store hash in DB
  await storeRefreshTokenHash(refreshToken, payload.id, meta.ipAddress || null, meta.userAgent || null);

  return { accessToken, refreshToken };
}

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  storeRefreshTokenHash,
  validateRefreshToken,
  createTokens,
};
