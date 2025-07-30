/**
 * Generate JWT tokens during login/registration--> signToken()
 * Verify tokens when users access protected routes --> verifyToken()
 * Possibly decode tokens for user identification --> decodeToken()
 */

import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ACCESS_EXPIRATION = process.env.JWT_ACCESS_EXPIRATION || '15m';
const REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';

/**
 * Generate Access JWT token(short-lived).
 * @param {object} payload - Data to encode in the token(e.g., { id: userId }).
 * @returns {string} access token.
 */

function generateAccessToken(payload) {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRATION });
}

/**
 * Generate Refresh JWT token(long-lived).
 * @param {object} payload - Usually only { id: userId }.
 * @returns {string} refresh token.
 */

function generateRefreshToken(payload) {
	return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: REFRESH_EXPIRATION });
}

/**
 * Verify an Access JWT token and return the decoded payload.
 * @param {string} token - The JWT token to verify.
 * @returns {object} Decoded payload.
 * @throws {Error} If the token is invalid or expired, it throws an error
 * (e.g., JsonWebTokenError, TokenExpiredError).
 */

function verifyAccessToken(token) {
	return jwt.verify(token, JWT_SECRET);
}

/**
 * Verify a Refresh JWT token and return the decoded payload.
 * @param {string} token - The JWT token to verify.
 * @returns {object} Decoded payload.
 * @throws {Error} If the token is invalid or expired.
 */
function verifyRefreshToken(token) {
	return jwt.verify(token, JWT_REFRESH_SECRET);
}

/**
 * Decode a JWT (either Access or Refresh) token without verifying its signature.
 * Use only when you need to read the payload without enforcing security. Usually use
 * it for testing.
 * NOTE: Do not use for authentication or authorization.
 * @param {string} token - The JWT token.
 * @returns {object|null} Decoded payload or null if invalid.
 */
// complete: false  --> only return the payload;
// complete: true   --> return an object with three parts: header, payload and signature
function decodeToken(token) {
	return jwt.decode(token, { complete: false });
}

export {
	generateAccessToken,
	generateRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
	decodeToken,
};
