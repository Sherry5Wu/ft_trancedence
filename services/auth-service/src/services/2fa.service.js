import speakeasy from 'speakeasy';
import db from '../db/index.js';

/**
 * Two-Factor Authentication Service
 * - Uses TOTP (Time-Based One-Time Password) via `speakeasy`.
 * - Secrets are stored in the DB alongside user records.
 */
export const twoFAService = {
  /**
   * Generate a new 2FA secret for a user
   * @param {string} userId - User ID from JWT
   * @returns {Object} { secret, otpauthUrl }
   */
  generate2FASecret(userId) {
    const secret = speakeasy.generateSecret({
      name: `ft_transcendence (${userId})`, // App name + user ID
      length: 20,
    });

    // Save secret to DB (in a real app, encrypt this!)
    db.User.update({ twoFASecret: secret.base32 }, { where: { id: userId } });

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url, // For QR code generation
    };
  },

  /**
   * Verify a 2FA token
   * @param {string} userId - User ID from JWT
   * @param {string} token - 6-digit TOTP code
   * @returns {boolean} True if valid
   */
  async verify2FAToken(userId, token) {
    const user = await db.User.findByPk(userId);
    if (!user || !user.twoFASecret) throw new Error('2FA not set up');

    return speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: 'base32',
      token,
      window: 1, // Allow 1-step time drift
    });
  }
};

