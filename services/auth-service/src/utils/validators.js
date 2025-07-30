/**
 * checking email format, passwordformat, normalize the email(set all the letters
 * t lowercases)
 */

import fp from 'fastify-plugin'

// Predefine the regular expression outside to improve performance.
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,72}$/; // lenght is between 8-72

export default fp(async (fastify) => {
  // Get ValidationError from fastify.authErrors
  const { ValidationError } = fastify.authErrors;

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

  fastify.decorate('validators', {
    validateEmailFormat,
    normalizeEmail,
    validatePassword,
    normalizeAndValidateEmail,
  });
});
