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
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { ConflictError, InvalidCredentialsError, NotFoundError } from '../utils/errors.js';
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
        [Op.or]: [{ normalizedEmail }, { username }]
      }
    });

    if (existingUser){
      if (existingUser.email === email) throw new ConflictError('Email already registered');
      if (existingUser.username === username) throw new ConflictError('Username already registered');
    }

    const passwordHash = await hashPassword(password);
    const pinCodeHash = await hashPassword(pinCode);

    const user = await User.create({ normalizedEmail, username, passwordHash, pinCodeHash, isVerified: true });

    // Remove sensitive fields from returned user
    const userData = user.toJSON();
    delete userData.passwordHash;
    delete userData.pinCodeHash;

    return userData;
}

/**
 * Authenticate user with email/username and password.
 * @param {string} indentifier - User email or username
 * @param {string} password - Plaintext password
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: object }>}
 */
async function authenticateUser(identifier, password) {
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
  throw new InvalidCredentialsError('User not found.');
  }
  
  if (!user.isVerified) {
  throw new InvalidCredentialsError('Please verify your email address before logging in.');
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch){
    throw new InvalidCredentialsError('Incorrect password');
  }

  // Generate JWT tokens
  const payload = {
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role || 'user', // default role if not set
    is2FAEnabled: !!user.twoFASecret, // True if 2FA is enabled
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Save refresh token in DB with assocation
  await RefreshToken.create({
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days expiration

  });

  // Return safe user data
  const userData = user.toJSON();
  delete userData.passwordHash;
  delete userData.pinCodeHash;
  delete userData.twoFASecret;
  delete userData.backupCodes;

  return { accessToken, refreshToken, user: userData };
}

/**
 * Find user by ID (safe data by default)
 * @param {string} id - User UUID
 * @param {boolean} includeSecrets - Include sensitive fields if true
 * @returns {Promise<object|null>}
 */
async function getUserById(id, includeSecrets = false) {
  const user = await User.scope(includeSecrets ? 'withSecrets' : null).findByPk(id);
  if (!user){
    return null;
  }

  const userData = user.toJSON();
  if (!includeSecrets){
    delete userData.passwordHash;
    delete userData.twoFASecret;
    delete userData.backupCodes;
  }
  return userData;
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

export {
  registerUser,
  authenticateUser,
  getUserById,
  enableTwoFA,
  disableTwoFA,
  validateBackupCode,
  updatePassword,
  updatePinCode,
};
