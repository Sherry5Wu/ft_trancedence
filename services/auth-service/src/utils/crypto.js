/**
 * Hashing the password
 */

import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;

const hashPassword = (password) => bcrypt.hash(password, SALT_ROUNDS);
const comparePassword = (password, hash) => bcrypt.compare(password, hash);

export { hashPassword, comparePassword };
