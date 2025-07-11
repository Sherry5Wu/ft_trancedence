const bcrypt = require('bcrypt');
const SALT_ROUNDS = 10;

module.exports = {
  hashPassword: (password) => bcrypt.hash(password, SALT_ROUNDS),
  comparePassword: (password, hash) => bcrypt.compare(password, hash),
};
