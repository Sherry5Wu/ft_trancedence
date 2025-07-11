const {
  normalizeEmail,
  validatePassword,
  ValidationError
} = require('../utils/validators');
const { hashPassword, comparePassword } = require('../utils/crypto');
const db = require('../db');

module.exports = {
  /**
   * Register a new user
   * @throws {ValidationError} if email/password invalid
   * @throws {Error} if email exists
   */
  registerUser: async (email, password) => {
    // Double-check password (defensive programming)
    validatePassword(password);

    // Check for existing user (using normalized email)
    const exists = await db.User.findOne({
      where: { email } // email already normalized by route
    });
    if (exists) throw new Error('Email already registered');

    // Create user
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
  loginUser: async (normalizedEmail, password) => {
    const user = await db.User.findOne({
      where: { email: normalizedEmail }
    });

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      throw new InvalidCredentialsError();
    }
    return signToken(user.id);
  }
};
