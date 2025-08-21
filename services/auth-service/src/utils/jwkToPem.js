import crypto from 'crypto';

function jwkToPem(jwk) {
  if (!jwk || jwk.kty !== 'RSA') {
    throw new Error('Only RSA keys are supported');
  }

  // Use the JWK fields directly (Google provides n and e as base64url strings)
  const jwkForNode = {
    kty: 'RSA',
    n: jwk.n,
    e: jwk.e
  };

  const pubKey = crypto.createPublicKey({
    key: jwkForNode,
    format: 'jwk'
  });

  return pubKey.export({ type: 'spki', format: 'pem' });
}

export { jwkToPem };
