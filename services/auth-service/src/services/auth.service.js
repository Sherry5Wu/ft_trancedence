import { normalizeEmail, validatePassword, ValidationError } from '../utils/validators.js';
import { hashPassword, comparePassword } from '../utils/crypto.js';
import db from '../db/index.js';
import { signToken } from '../utils/jwt.js'; // Assuming you have a JWT utility

export const authService = {
  /**
   * Register a new user
   * @throws {ValidationError} if email/password invalid
   * @throws {Error} if email exists
   */
  async registerUser(email, password) {
    // Validate password
    validatePassword(password);

    // Check if email already exists
    const exists = await db.User.findOne({
      where: { email } // email should be normalized by route
    });
    if (exists) throw new Error('Email already registered');

    // Create new user
    const user = await db.User.create({
      email,
      passwordHash: await hashPassword(password),
    });

    return signToken(user.id);
  },

  /**
   * Authenticate a user
   * @throws {InvalidCredentialsError} if auth fails
   */
  async loginUser(normalizedEmail, password) {
    const user = await db.User.findOne({
      where: { email: normalizedEmail }
    });

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      throw new InvalidCredentialsError();
    }
    return signToken(user.id);
  }
};
