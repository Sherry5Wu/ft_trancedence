/**
 * Checking the formats of email, username and password;
 * normalize the email(set all the letters to lowercases)
 */

import fp from 'fastify-plugin'
import { ValidationError } from './errors.js';

// Predefine the regular expression outside to improve performance.
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,72}$/; // lenght is between 8-72
const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9._-]{5,19}$/;
const PINCODE_REGEX = /^\d{4}$/;

const validateEmailFormat = (email) => {
  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())){
    throw new ValidationError('Invalid email format');
  }
};


const normalizeEmail = (email) => {
  // string.trim(): removes the whitespaces from both ends, not in the middle
  if (typeof email !== 'string' || !email.trim()){
    throw new ValidationError('Email is required');
  }

  let normalizedEmail = email.trim().toLowerCase();

  // handle Gmail dot rule. In Gmail, it doesn't save the dot before the @.
  // for example: sherry.wu@gmail.com, will be saved as "sherrywu@gmail.com"
  const [localPart, domain] = normalizedEmail.split('@');
  if (domain === 'gmail.com'){
    normalizedEmail = localPart.replace(/\./g, '') + '@gmail.com'; // remove all the dot in the localPart
  }
  return normalizedEmail;
};

const validatePassword = (password) => {
  if (typeof password !== 'string' || !password.trim()){
    throw new ValidationError ('Password is required and must be a string');
  }

  if (!PASSWORD_REGEX.test(password.trim())){
    throw new ValidationError ('Password format is wrong');
  }
};

const normalizeAndValidateEmail = (email) => {
  validateEmailFormat(email);
  return normalizeEmail(email);
};

const validateUsername = (username) => {
  if (typeof username !== 'string' || !USERNAME_REGEX.test(username.trim())){
    throw new ValidationError('Invalid username format');
  }
};

const validatePincode = (pinCode) => {
  if ( typeof pinCode !== 'string' || !PINCODE_REGEX.test(pinCode)){
    throw new ValidationError('Invalid Pin code format');
  }
};

export {
    validateEmailFormat,
    normalizeEmail,
    validatePassword,
    normalizeAndValidateEmail,
    validateUsername,
    validatePincode
};

export default fp(async (fastify) => {
  fastify.decorate('validators', {
    validateEmailFormat,
    normalizeEmail,
    validatePassword,
    normalizeAndValidateEmail,
    validateUsername,
    validatePincode
  });
});
