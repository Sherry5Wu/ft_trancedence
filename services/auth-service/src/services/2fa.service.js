// services/2fa.service.js
import speakeasy from 'speakeasy';
import crypto from 'crypto';
import QRCode from 'qrcode';
import { models } from '../db/index.js';
import {
  NotFoundError,
  ValidationError,
} from '../utils/errors.js';

import {
  hashPassword,
  comparePassword,
  encryptSecret,
  decryptSecret,
} from '../utils/crypto.js';

const { User } = models;

/**
 * Generate a TOTP(Time-based One-Time Password) secret and backup codes for a user,
 * store encrypted secret & hashed backup codes.
 * @param {string} userId
 * @returns {Promise<{ secret: string, otpauthUrl: string, backupCodes: string[] }>}
 */
async function generateTwoFASetup(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('User not found');
  if (user.twoFASecret) {
    throw new ValidationError('2FA already enabled for this user');
  }
  // Generate TOTP secret object
  const secretObj = speakeasy.generateSecret({ name: `ft_transcendence (${user.email})`, length: 10 });
  const otpauthUrl = secretObj.otpauth_url;
  const base32Secret = secretObj.base32; // the raw secret used for totp
  if (typeof base32Secret !== 'string' || base32Secret.length === 0) {
    throw new Error('Generated 2FA secret is invalid');
  }
  // Create backup codes (plaintext, presented once to user)
  // each backup code is 8 hex characters
  const backupCodesPlain = Array.from({ length: 10 }, () => crypto.randomBytes(4).toString('hex'));
  // Hash backup codes before persisting
  let backupCodesHashed;
  try {
    backupCodesHashed = await Promise.all(
    backupCodesPlain.map((code) => hashPassword(code))
    );
  } catch (err) {
    throw new Error('Failed to hash backup codes. Please try again.');
  }

  // Encrypt the secret and persist both encrypted secret and hashed backup codes
  const encryptedSecret = encryptSecret(base32Secret);
  await user.update({
    twoFASecret: encryptedSecret,
    backupCodes: backupCodesHashed,
  });

  // Return the plaintext secret and backup codes to the caller (frontend should display securely)
  return { secret: base32Secret, otpauthUrl, backupCodes: backupCodesPlain };
}

/**
 * Verify a TOTP token for a user (decrypts secret first)
 */
async function verifyTwoFAToken(userId, token) {
  const user = await User.scope('withSecrets').findByPk(userId);
  if (!user) throw new NotFoundError('User not found');
  if (!user.twoFASecret) throw new ValidationError('2FA not enabled for this user');

  // Decrypt secret stored in DB
  let base32Secret;
  try {
    base32Secret = decryptSecret(user.twoFASecret);
  } catch (e) {
    // treat decryption issues as server error upstream; but here we throw validation for clarity
    throw new ValidationError('Unable to read 2FA secret');
  }

  const verified = speakeasy.totp.verify({
    secret: base32Secret,
    encoding: 'base32',
    token,
    window: 1,
  });
  return verified;
}

/**
 * QR code generator (unchanged)
 */
async function generateTwoFAQrCode(otpauthUrl) {
  if (!otpauthUrl) throw new ValidationError('Missing otpauth URL');
  return QRCode.toDataURL(otpauthUrl);
}

/**
 * Consume a backup code (compares with hashed codes and removes matched one)
 */
async function consumeBackupCode(userId, code) {
  const user = await User.scope('withSecrets').findByPk(userId);
  if (!user) throw new NotFoundError('User not found');

  if (!Array.isArray(user.backupCodes) || user.backupCodes.length === 0) {
    throw new ValidationError('No backup codes available');
  }

  console.log('backupcode in the DB:', user.backupCodes);

  const hashedCodes = [...user.backupCodes];
  let matchedIndex = -1;

  // compare sequentially (max 10)
  for (let i = 0; i < hashedCodes.length; i++) {
    /* eslint-disable no-await-in-loop */
    const ok = await comparePassword(code, hashedCodes[i]);
    /* eslint-enable no-await-in-loop */
    if (ok) {
      matchedIndex = i;
      break;
    }
  }

  if (matchedIndex === -1) return false;
  console.log('BEFORE delete the backupcode:', user.backupCodes);
  // remove and persist
  hashedCodes.splice(matchedIndex, 1);
  await user.update({ backupCodes: hashedCodes });
    console.log('after delete the backupcode1:', user.backupCodes);
// await user.update({ backupCodes: [...hashedCodes] }, { fields: ['backupCodes'] });
  await user.reload();
  console.log('after delete the backupcode2:', user.backupCodes);

  return true;
}

/**
 * Disable 2FA
 */
async function disableTwoFA(userId) {
  const user = await User.findByPk(userId);
  if (!user) throw new NotFoundError('User not found');
  await user.update({ twoFASecret: null, backupCodes: null, is2FAConfirmed: false });
}

/**
 * Get user 2FA status, only when 'is2FAEnabled' and 'is2FAConfirmed' both are true, then the
 * user's 2FA is on, after they log in , they need use 2FA to verify agagin.
 * @param {userId} userId
 * @returns 2FA status: true/false
 */
async function getTwoFAStatus(userId) {
  const user = await User.findByPk(userId,
    { attributes: ['is2FAEnabled', 'is2FAConfirmed'] }
  );
  if (!user) throw new NotFoundError('User not found');

  // Only consider 2FA fully active if both enabled and confirmed
  return !!(user.is2FAEnabled && user.is2FAConfirmed);
}

export {
  generateTwoFASetup,
  verifyTwoFAToken,
  generateTwoFAQrCode,
  consumeBackupCode,
  disableTwoFA,
  getTwoFAStatus,
};
