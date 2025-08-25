/**
 * Auth service: Handles registration, login, and token generation.
 *
 * ✔ Register user with normalized email and password validation.
 * ✔ Login with email/password and return access + refresh tokens.
 * ✔ Google OAuth placeholder (for remote authentication module).
 * ✔ Security:
 *   - Password hashing using bcrypt.
 *   - Email normalization.
 *      ✔ Uses JWT system .
 *      ✔ Custom error handling using ValidationError and InvalidCredentialsError
 */
import { Op } from 'sequelize';

import { models } from '../db/index.js';
import { hashPassword, comparePassword } from '../utils/crypto.js';
import { generateAccessToken, generateRefreshToken , storeRefreshTokenHash} from '../utils/jwt.js';
import { ConflictError, InvalidCredentialsError, NotFoundError, ValidationError } from '../utils/errors.js';
import { normalizeAndValidateEmail, normalizeEmail, validatePassword, validateUsername, validatePincode } from '../utils/validators.js';

const { User, RefreshToken } = models;

/**
 * Register a new user.Email and username must be unique
 * @param {string} email - User email
 * @param {string} password - plaintext password
 * @param {string} username - username
 * @param {string} pinCode - plaintext pin code
 * @return {Promise<object>} Created user (without sensitive fields)
 */
async function registerUser(email, username, password, pinCode) {
  // ?.trim() ensures you don’t get an error if the value is null or undefined
  if (!email?.trim() || !username.trim() || !password.trim() || !pinCode.trim()) {
    throw new InvalidCredentialsError('The request must contain: email, usename, password and pinCode');
  }

  let normalizedEmail;
  try {
      normalizedEmail = normalizeAndValidateEmail(email);
      validateUsername(username);
      validatePassword(password);
      validatePincode(pinCode);
    } catch (err) {
      throw err;
    }

    // Normalize and validate email using fastify.validators in route handler
    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: normalizedEmail }, { username }]
      }
    });

    if (existingUser){
      if (existingUser.email === normalizedEmail) throw new ConflictError('Email already registered');
      if (existingUser.username === username) throw new ConflictError('Username already registered');
    }

    const passwordHash = await hashPassword(password);
    const pinCodeHash = await hashPassword(pinCode);

    const user = await User.create({ email: normalizedEmail, username, passwordHash, pinCodeHash, isVerified: true });

    // Remove sensitive fields from returned user
    const userData = user.toJSON();
    delete userData.passwordHash;
    delete userData.pinCodeHash;

    return userData;
}

/**
 * Authenticate user with email/username and password.
 * @param {string} identifier - User email or username
 * @param {string} password - Plaintext password
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: object }>}
 */
async function authenticateUser(identifier, password, opts= {}) {
   if (!identifier?.trim() || !password.trim()) {
    throw new InvalidCredentialsError('The request must contain: email and password');
  }

  const { ip = null, userAgent = null } = opts;

  // Find user by email or username, including secrets
  const user = await User.scope('withSecrets').findOne({
    where: {
      [Op.or]: [ // Sequelize's [Op.or] condition lets you check both fields.
        { email: normalizeEmail(identifier) },
        { username: identifier }
      ]
    }
  });

  if (!user) {
  throw new NotFoundError('User not found.');
  }

  // if (!user.isVerified) {
  // throw new InvalidCredentialsError('Please verify your email address before logging in.');
  // }

  const isMatch = await comparePassword(password, user.passwordHash);
  console.log('isMatch:', isMatch); // for testing only
  if (!isMatch){
    console.log('Error message: password does not match'); // for testing only
    throw new InvalidCredentialsError('Incorrect password');
  }

  // Generate JWT tokens
  const accessTokenPayload = {
    id: user.id,
    email: user.email,
    username: user.username,
    is2FAEnabled: !!user.twoFASecret, // True if 2FA is enabled
  };
  // keep the refreshTokenPayload be minimal
  const refreshTokenPayload = { id: user.id };

  const accessToken = generateAccessToken(accessTokenPayload);
  const refreshToken = generateRefreshToken(refreshTokenPayload);

  await storeRefreshTokenHash(refreshToken, user.id, ip, userAgent);

  // return the only asked data
  const publicUser = {
    id: user.id,
    username: user.username,
    avatarUrl: user.avatarUrl || null, // include only if you support it
    TwoFAStatus: user.is2FAEnabled && user.is2FAConfirmed,
    registerFromGoogle: !!user.googleId,
  };

  return { accessToken, refreshToken, user: publicUser };
}

/**
 * Find user by ID (safe data by default)
 * @param {string} id - User UUID
 * @param {boolean} includeSecrets - Include sensitive fields if true
 * @returns {Promise<object|null>}
 */
async function getUserById(id, includeSecrets = false) {
  const user = await User.scope(includeSecrets ? 'withSecrets' : null).findByPk(id);
  return user ? user.toJSON() : null;
}

/**
 * Find user by username (safe data by default)
 * @param {string} username - User's username
 * @param {boolean} includeSecrets - Include sensitive fields if true
 * @returns {Promise<object|null>}
 */
async function getUserByUsername(username, includeSecrets = false) {
  const user = await User.scope(includeSecrets ? 'withSecrets' : null).findOne({ where: { username } });
  return user ? user.toJSON() : null;
}

async function getUserByIdentifier(identifier, includeSecrets = false) {
  const user = await User.scope(includeSecrets ? 'withSecrets' : null).findOne({
    where: {
      [Op.or]: [
        { email: normalizeEmail(identifier) },
        { username: identifier },
      ]
    }
  });
  return user ? user.toJSON() : null;
}

/**
 * Enable 2FA for user (store TOTP secret and backup codes)
 * @param {string} userId
 * @param {string} secret - TOTP secret
 * @param {string[]} backupCodes
 * @returns {Promise<void>}
 */
async function enableTwoFA(userId, secret, backupCodes) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  await user.update({ twoFASecret: secret, backupCodes });
}

/**
 * Disable 2FA for user
 * @param {string} userId
 * @returns {Promise<void>}
 */
async function disableTwoFA(userId) {
  const user = await User.findByPk(userId);
  if (!user){
    throw new NotFoundError('User not found');
  }
  await user.update({ twoFASecret: null, backupCodes: null });
}

/**
 * Validate backup code for 2FA recovery
 * Each code just can be used once, so need to remove it after using.
 * @param {string} userId
 * @param {string} code
 * @returns {Promise<boolean>}
 */
async function validateBackupCode(userId, code) {
  const user = await User.scope('withSecrets').findByPk(userId);
    if (!user || !user.backupCodes){
    return false;
  }

  // get the index of code in the backupCodes array
  const matchIndex = user.backupCodes.indexOf(code);
  if (matchIndex === -1) return false;

  // remove used code
  user.backupCodes.splice(matchIndex, 1); // Remove the code from the array at position matchIndex.
  await user.update({ backupCodes: user.backupCodes });
  return true;
}

/**
 * Update password
 * @param {string} userId
 * @param {string} newPassword
 * @returns {Promise<void>}
 */
async function updatePassword(userId, newPassword) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const newHash = await hashPassword(newPassword);
  await user.update({ passwordHash: newHash });
}

async function updatePinCode(userId, newPinCode) {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const newHash = await hashPassword(newPinCode);
  await user.update({ pinCodeHash: newHash });
}

async function updateAvatar(userId, newAvatarUrl) {
  // 1. Check if user exists
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  // 2. Validate avatar URL format
  try {
    new URL(newAvatarUrl);
  } catch (err) {
    throw new ValidationError('Invalid avatar URL');
  }
  // 3. enforce HTTPS only
 if (!newAvatarUrl.startsWith('https://')) {
   throw new ValidationError('Avatar URL must use HTTPS');
 }

 console.log(newAvatarUrl); // for testing only
  // 4. Save to DB
  await user.update({ avatarUrl: newAvatarUrl });
}

export {
  registerUser,
  authenticateUser,
  getUserById,
  getUserByUsername,
  getUserByIdentifier,
  enableTwoFA,
  disableTwoFA,
  validateBackupCode,
  updatePassword,
  updatePinCode,
  updateAvatar,
};
