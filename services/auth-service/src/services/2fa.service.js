/**
 * Build TOTP 2FA logic after base authentication works.
 */

import speakeasy from 'speakeasy';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { models } from '../db/index.js';
import {
  NotFoundError,
  ValidationError,
} from '../utils/errors.js';

const { user } = models;

/**
 * Generate a TOTP secret and backup codes for a user, store in DB.
 * @param {string} userId - UUID of the user
 * @returns {Promise<{ secret: string, otpauthUrl: string, backupCodes: string[] }>}
 */
async function generateTwoFASetup(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('user not found');

  // Generate TOTP secret
  const secret = speakeasy.generateSecret({ name: 'ft_transcendence (${user.email})' });
  const otpauthUrl = secret.otpauth_url;
  const base32Secret = secret.base32;

  // Generate backup codes: 10 randomized 8-character codes
  const backupCodes = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex'));

  // Persist secret and backup codes
  await user.update({ twoFASecret: base32Secret, backupCodes });

  return { secret: base32Secret, otpauthUrl, backupCodes };
}

/**
 * Verify a TOTP token for a user
 * @param {string} userId
 * @param {string} token - 6-digit TOTP code
 * @returns {Promise<boolean>}
 */
async function veriifyTwoFAToken(userId, token){
  const user =  await User.scope('withSecrets').findByPk(userId);
  if (!user) throw new NotFoundError('User not found');
  if (!user.twoFASecret) throw new ValidationError('2FA not enabled for this user');

  const verified = speakeasy.totp.verify({
    secret: user.twoFASecret,
    encoding: 'base32',
    token,
    window: 1, // allow 1 step before/after
  });

  return verified;
}

/**
 * Generate a QR code data URL for the user's TOTP secret
 * @param {string} otpauthUrl
 * @returns {Promise<string>} - data URL of QR code image
 */
async function generateTwoFAQrCode(otpauthUrl) {
  if (!otpauthUrl) throw new ValidationError('Missing otpauth URL');
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
  return qrCodeDataUrl;
}

/**
 * Consume a backup code for 2FA recovery
 * @param {string} userId
 * @param {string} code
 * @returns {Promise<boolean>} - true if valid and consumed
 */
async function consumeBackupCode(userId, code){
  const user =  await User.scope('withSecrets').findByPk(userId);
  if (!user) throw new NotFoundError('User not found');
  if (!Array.isArray(user.backupCodes) || user.backupCodes.length === 0) {
    throw new ValidationError('No backup codes available');
  }

  const index = user.backupCodes.indexOf(code);
  if (index === -1) return false;

  // Remove used code and update
  user.backupCodes.splice(index, 1);
  await user.update({ backupCodes: user.backupCodes });
  return true;
}

/**
 * Disable TOTP 2FA for a user
 * @param {string} userId
 * @returns {Promise<void>}
 */
async function disableTwoFA(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('User not found');
  await User.update({ twoFASecret: null, backupCodes: null });
}

export {
  generateTwoFAQrCode,
  veriifyTwoFAToken,
  generateTwoFAQrCode,
  consumeBackupCode,
  disableTwoFA,
}
