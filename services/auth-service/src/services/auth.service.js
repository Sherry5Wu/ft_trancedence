const { hashPassword, comparePassword } = require('../utils/crypto');
const { signToken } = require('./jwt.service');
const db = require('../db');

module.exports = {
  googleAuth: async (code) => {
    // In a real app, exchange `code` for Google profile here
    const user = await db.User.findOrCreate({ where: { googleId: code } });
    return signToken(user.id);
  },

  loginUser: async (email, password) => {
    const user = await db.User.findOne({ where: { email } });
    if (!user || !comparePassword(password, user.passwordHash)) {
      throw new Error('Invalid credentials');
    }
    return signToken(user.id);
  },
};
