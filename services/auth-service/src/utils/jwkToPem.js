import crypto from 'crypto';

/**
 * Convert JWK (from Google) to PEM
 * @param {object} jwk - JSON Web Key object
 * @returns {string} PEM formatted public key
 */
function jwkToPem(jwk) {
  if (jwk.kty !== 'RSA') {
    throw new Error('Only RSA keys are supported');
  }

  const exponent = Buffer.from(jwk.e, 'base64');
  const modulus = Buffer.from(jwk.n, 'base64');

  const pubKey = crypto.createPublicKey({
    key: {
      n: modulus,
      e: exponent,
    },
    format: 'jwk',
  });

  return pubKey.export({ type: 'spki', format: 'pem' });
}

export { jwkToPem };
