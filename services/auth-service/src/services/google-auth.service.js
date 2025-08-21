/**
 * Example from a decoded Google ID token:
 * {
  "sub": "103948230498230498",
  "name": "Jane Doe",
  "given_name": "Jane",
  "family_name": "Doe",
  "picture": "https://lh3.googleusercontent.com/a/AAcHTte...s96-c",
  "email": "janedoe@gmail.com",
  "email_verified": true,
  ...
  }
 */

import axios from 'axios';
import jwt from 'jsonwebtoken';
import { Op, UniqueConstraintError } from 'sequelize';

import defineUser from '../db/models/user.js';
import defineRefreshToken from '../db/models/refreshToken.js'; // <-- new import
import { hashPassword } from '../utils/crypto.js';
import { jwkToPem } from '../utils/jwkToPem.js';
import { ConflictError, InvalidCredentialsError, ValidationError } from '../utils/errors.js';
import { validateUsername, validatePincode } from '../utils/validators.js';
import { sequelize } from '../db/index.js';
import { generateAccessToken, generateRefreshToken, decodeToken } from '../utils/jwt.js';

const GOOGLE_CERTS_URL = process.env.GOOGLE_CERTS_URL || 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const User = defineUser(sequelize);
const RefreshToken = defineRefreshToken(sequelize); // instantiate model

// simple in-memory cache for certs
let certsCache = {
  keys: null,
  fetchedAt: 0,
  maxAgeSec: 60 * 60 // default 1 hour
};

async function fetchGoogleCerts() {
  const now = Date.now();
  if (certsCache.keys && (now - certsCache.fetchedAt) / 1000 < certsCache.maxAgeSec) {
    return certsCache.keys;
  }

  let resp;
  try {
    resp = await axios.get(GOOGLE_CERTS_URL, { timeout: 5000 });
  } catch (err) {
    throw new InvalidCredentialsError(`Failed to fetch Google certs: ${err.message}`);
  }

  const keys = resp.data && resp.data.keys;
  if (!keys || !Array.isArray(keys) || keys.length === 0) {
    throw new InvalidCredentialsError('No Google certs found');
  }

  // parse Cache-Control header for max-age if present
  const cacheControl = (resp.headers && resp.headers['cache-control']) || '';
  const m = cacheControl.match(/max-age=(\d+)/);
  if (m) {
    certsCache.maxAgeSec = parseInt(m[1], 10);
  } else {
    certsCache.maxAgeSec = 60 * 60;
  }

  certsCache.keys = keys;
  certsCache.fetchedAt = Date.now();
  return keys;
}

/**
 * Persist a refresh token in the RefreshToken table (store hashed token)
 * @param {string} token - raw refresh token (will be hashed before saving)
 * @param {string} userId
 * @param {string|null} ip
 * @param {string|null} userAgent
 */
async function persistRefreshToken(token, userId, ip = null, userAgent = null) {
  // decode token to get exp
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) {
    // fallback: set expiry based on env default (7 days)
    const fallbackMs = 7 * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + fallbackMs);
    const tokenHash = await hashPassword(token);
    await RefreshToken.create({
      token: tokenHash,
      userId,
      expiresAt,
      ipAddress: ip,
      userAgent
    });
    return;
  }

  const expiresAt = new Date(decoded.exp * 1000);
  const tokenHash = await hashPassword(token);

  await RefreshToken.create({
    token: tokenHash,
    userId,
    expiresAt,
    ipAddress: ip,
    userAgent
  });
}

/**
 * Verify Google ID token and return payload.
 * Throws InvalidCredentialsError on any verification failure.
 */
async function verifyGoogleIdToken(idToken) {
  if (!idToken) throw new InvalidCredentialsError('Missing idToken');

  const keys = await fetchGoogleCerts();

  const decodedHeader = jwt.decode(idToken, { complete: true });
  if (!decodedHeader || !decodedHeader.header || !decodedHeader.header.kid) {
    throw new InvalidCredentialsError('Invalid idToken');
  }

  const kid = decodedHeader.header.kid;
  let jwk = keys.find(k => k.kid === kid);

  // If kid not found, try one more fresh fetch (covers a recent key rotation)
  if (!jwk) {
    const freshKeys = await fetchGoogleCerts();
    jwk = freshKeys.find(k => k.kid === kid);
    if (!jwk) {
      throw new InvalidCredentialsError('No matching Google key found for token');
    }
  }

  const pubKey = jwkToPem(jwk);

  let payload;
  try {
    payload = jwt.verify(idToken, pubKey, {
      algorithms: ['RS256'],
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: GOOGLE_CLIENT_ID
    });
  } catch (err) {
    throw new InvalidCredentialsError(`Invalid idToken: ${err.message}`);
  }

  if (!payload || !payload.sub) throw new InvalidCredentialsError('idToken missing subject (sub)');
  if (!payload.email) throw new InvalidCredentialsError('idToken missing email');

  return payload;
}

/**
 * googleUserLogin(idToken)
 * - If googleId already registered -> login (issue tokens and persist refresh token)
 * - If not registered -> ensure email not taken -> return { profile_complete: false, ... }
 *
 * Note: this function does NOT create a DB row when profile incomplete (Q2 = B).
 */
async function googleUserLogin(user) {
  // minimal payloads
  const accessPayload = {
    id: user.id,
    email: user.email,
    username: user.username,
    is2FAEnabled: !!user.twoFASecret, // True if 2FA is enabled
  };
  const refreshPayload = { id: user.id };

  const accessToken = generateAccessToken(accessPayload);
  const refreshToken = generateRefreshToken(refreshPayload);

  // Build public user object (do not include sensitive fields)
  const publicUser = {
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl || null, // include only if you support it
    is2FAEnabled: !!user.twoFASecret, // True if 2FA is enabled
    is2FAConfirmed: user.is2FAConfirmed,
  };

  return { accessToken, refreshToken, user: publicUser };
}

/**
 * googleCompleteRegistration(idToken, username, pinCode, ip, userAgent)
 * - frontend resends idToken + supplies username + pinCode
 * - backend verifies idToken again, validates username/pin, creates user, persists refresh token, and returns tokens
 */
async function googleCompleteRegistration(idToken, username, pinCode, ip = null, userAgent = null) {
  let payload;
  try {
    payload = await verifyGoogleIdToken(idToken);
  } catch (err) {
    if (err instanceof InvalidCredentialsError) throw err;
    throw new InvalidCredentialsError(`Error verifying Google idToken: ${err.message}`);
  }

  if (!payload.email_verified) throw new ValidationError('Google email is not verified');

  const googleId = payload.sub;
  const email = (payload.email || '').toLowerCase().trim();

  // validate username & pinCode format
  try {
    validateUsername(username);
    validatePincode(pinCode);
  } catch (err) {
    throw err;
  }

  // create the user — use transaction to reduce race conditions
  const transaction = await sequelize.transaction();
  try {
    // check uniqueness within transaction
    const conflictUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username },
          { googleId }
        ]
      },
      transaction
    });

    if (conflictUser) {
      if (conflictUser.email === email && !conflictUser.googleId) {
        throw new ConflictError('Email is already registered with a non-Google account');
      }
      if (conflictUser.googleId === googleId) {
        throw new ConflictError('User already registered with Google');
      }
      if (conflictUser.username === username) {
        throw new ConflictError('Username already taken');
      }
      throw new ConflictError('Conflict with existing user');
    }

    const pinCodeHash = await hashPassword(pinCode);

    const newUser = await User.create({
      email,
      googleId,
      username,
      pinCodeHash,
      avatarUrl: payload.picture || null,
      isVerified: true
    }, { transaction });

    // generate tokens
    const accessToken = generateAccessToken({ id: newUser.id });
    const refreshToken = generateRefreshToken({ id: newUser.id });

    // persist refresh token (outside transaction is fine, but we do inside here)
    try {
      await persistRefreshToken(refreshToken, newUser.id, ip, userAgent);
    } catch (err) {
      // non-fatal, but log
      /* eslint-disable no-console */
      console.warn('Failed to persist refresh token for new user:', err.message);
      /* eslint-enable no-console */
    }

    await transaction.commit();

    return {
      userId: newUser.id,
      accessToken,
      refreshToken
    };
  } catch (err) {
    await transaction.rollback();
    if (err instanceof UniqueConstraintError) {
      throw new ConflictError('Conflict while creating user (unique constraint). Please try again.');
    }
    throw err;
  }
}

export {
  verifyGoogleIdToken,
  googleUserLogin,
  googleCompleteRegistration,
}
