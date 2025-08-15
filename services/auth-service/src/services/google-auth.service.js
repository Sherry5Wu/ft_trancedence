import axios from 'axios';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';

import { User } from '../db/models/user.js';
import { hashPassword} from '../utils/crypto.js';
import { jwkToPem } from '../utils/jwkToPem.js';
import { ConflictError, InvalidCredentialsError, ValidationError } from '../utils/errors.js';
import { validateUsername, validatePincode } from '../utils/validators';

const GOOGLE_CERTS_URL = process.env.GOOGLE_CERTS_URL || 'https://www.googleapis.com/oauth2/v3/certs';

/**
 * Example from a decoded Google ID token:
 * {
  "sub": "103948230498230498",
  "name": "Jane Doe",
  "given_name": "Jane",
  "family_name": "Doe",
  "picture": "https://lh3.googleusercontent.com/a/AAcHTte...s96-c",
  "email": "janedoe@gmail.com",
  "email_verified": true,
  ...
  }
 */

/**
 *
 * @param {idToken} google idToken
 * @returns payload
 */

async function verifyGoogleIdToken(idToken) {
  // Fetch Google public keys
  const { data } = await axios.get(GOOGLE_CERTS_URL);
  const keys = data.keys;

  // Decode header to find the correct key
  const decodedHeader = jwt.decode(idToken, { complete: true });
  if (!decodedHeader) throw new InvalidCredentialsError('Invalid token');

  const key = keys.find(k => k.kid === decodedHeader.header.kid);
  if (!key) throw new InvalidCredentialsError('No matchng Google key found');

  const pubKey = jwkToPem(key);

  const payload = jwt.verify(idToken, pubKey, {
    algorithms: ['RS256'],
    issuer: ['https://accounts.google.com', 'accounts.google.com'],
  });

  return payload;
}

// google idToken contains the user’s email, name, picture, and the sub (Google ID)
async function registerGoogleUser(idToken, username, pinCode) {
  // Verify the google idToken
  let payload;
  try {
    payload = await verifyGoogleIdToken(idToken);
  } catch (err) {
    throw new InvalidCredentialsError('Error: ${err.message}');
  }

  // Check if google email is verifed
  if (!payload.email_verified) {
    throw new ValidationError('Google email is not verified');
  }

  // Checking if the email, googleId and username is already registered/taken
  const existingUser = await User.findOne({
    [Op.or]: [{ email: payload.email }, { googleId: payload.sub }, { username }]
  });
  if (existingUser) {
    if (existingUser.email === payload.email) throw new ConflictError('Email is already registered');
    if (existingUser.googleId === payload.sub) throw new ConflictError('User already registered with Google');
    if (existingUser.username === username) throw new ConflictError('Username already taken');
  }

  // Verify username, pinCode,
  let normalizedEmail;
  try {
      normalizedEmail = normalizeAndValidateEmail(payload.email);
      validateUsername(username);
      validatePincode(pinCode);
  } catch (err) {
      throw err;
  }

  // Hash the pin code
  const pinCodeHash = await hashPassword(pinCode);
  const newUser = await User.create({
    email: normalizedEmail,
    googleId: payload.sub,
    username,
    pinCodeHash,
    avatarUrl: payload.picture,
    isVerified: true
  });
  return newUser;
}

export { registerGoogleUser };
