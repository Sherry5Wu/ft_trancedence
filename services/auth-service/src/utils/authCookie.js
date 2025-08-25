function setRefreshTokenCookie(reply, token) {
  // use __Host- prefix (host-only, most secure)
  const name = '__Host-refreshToken';
  const COOKIE_SECURE = process.env.NODE_ENV === 'production';

  reply.setCookie(name, token, {
    httpOnly: true, // frontend JS cannot read token.
    secure: COOKIE_SECURE, // ensures HTTPS, environment-aware mode
    sameSite: 'Lax', // prevents CSRF, Lax is common compromise
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
}

function clearRefreshTokenCookie(reply) {
  const name = '__Host-refreshToken';

  reply.clearCookie(name, { path: '/' });
}

export { setRefreshTokenCookie, clearRefreshTokenCookie };
