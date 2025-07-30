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

import { User } from '../db/index.js';
import { hashPassword, comparePassword } from '../utils/crypto.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

/**
 * Register a new user.
 * @param {string} email - User email
 * @param {string} password - plaintext password
 * @return {Promise<object>} Created user (without sensitive fields)
 */
async function registerUser(email, password) {
    // Normalize and validate email using fastify.validators in route handler
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser){
      throw new Error('Email already registered');
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      email,
      passwordHash,
    });

    // Remove sensitive fields from returned user
    const userData = user.toJSON();
    delete userData.passwordHash;

    return userData;
}

/**
 * Authenticate user with email and password.
 * @param {string} email - User email
 * @param {string} password - Plaintext password
 * @returns {Promise<{ accessToken: string, refreshToken: string, user: object }>}
 */
async function authenticateUser(email, password) {
  // Find user with secrets
  const user = await User.scope('withSecrets').findOne({ where: { email }});

  if (!user){
    throw new Error('Invalid credentials');
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch){
    throw new Error('Incorrect password');
  }

  // Generate JWT tokens
  const payload = { id: user.id, email: user.email };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Return safe user data
  const userData = user.toJSON();
  delete userData.passwordHash;
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
    throw new Error('User not found');
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
    throw new Error('User not found');
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
    throw new Error('User not found');
  }

  const newHash = await hashPassword(newPassword);
  await user.update({ passwordHash: newHash });
}

export {
  registerUser,
  authenticateUser,
  getUserById,
  enableTwoFA,
  disableTwoFA,
  validateBackupCode,
  updatePassword,
};
