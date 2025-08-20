/**
 * 1. Hashing the password, pin code and 2fa's backup codes
 * 2. encryption/decryption for TOTP sercret
 */
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { scryptSync, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import {
  InvalidCredentialsError,
  NotFoundError,
} from '../utils/errors.js';

const SALT_ROUNDS = 12;

const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

/**
 * AES-256-GCM encryption / decryption for TOTP secret
 * - Requires process.env.TWOFA_ENC_KEY to be set (string).
 * - The key is derived using scryptSync(TWOFA_ENC_KEY, 'ft2fa', 32)
 * - Returns a compact base64 string: base64(iv) + '.' + base64(tag) + '.' + base64(ciphertext)
 */

function getEncryptionKey() {
  const rawKey = process.env.TWOFA_ENC_KEY;
  if (!rawKey) {
    throw new Error('TWOFA_ENC_KEY is not set (required for encrypting 2FA secrets)');
  }
  // Derive a 32 byte key from rawKey
  return scryptSync(rawKey, 'ft2fa', 32);
}

function encryptSecret(plainText) {
  const key = getEncryptionKey();
  const iv = randomBytes(12); // recommended for GCM
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(Buffer.from(plainText, 'utf8')), cipher.final()]);
  const tag = cipher.getAuthTag();

  // encode parts as base64 and join
  const out = `${iv.toString('base64')}.${tag.toString('base64')}.${ciphertext.toString('base64')}`;
  return out;
}

function decryptSecret(compact) {
  const key = getEncryptionKey();
  const parts = compact.split('.');
  if (parts.length !== 3) throw new Error('Invalid encrypted secret format');

  const iv = Buffer.from(parts[0], 'base64');
  const tag = Buffer.from(parts[1], 'base64');
  const ciphertext = Buffer.from(parts[2], 'base64');

  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString('utf8');
}

export {
  hashPassword,
  comparePassword,
  encryptSecret,
  decryptSecret,
};
