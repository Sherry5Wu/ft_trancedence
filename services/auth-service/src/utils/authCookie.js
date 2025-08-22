function setAuthCookie(reply, token, isAccessToken = true) {
  // use __Host- prefix (host-only, most secure)
  const name = isAccessToken ? '__Host-accessToken' : '__Host-refreshToken';
  const COOKIE_SECURE = process.env.NODE_ENV === 'production';

  reply.setCookie(name, token, {
    httpOnly: true, // frontend JS cannot read token.
    secure: COOKIE_SECURE, // ensures HTTPS, environment-aware mode
    sameSite: 'Lax', // prevents CSRF, Lax is common compromise
    path: '/',
    maxAge: isAccessToken ? 60 * 15 : 60 * 60 * 24 * 7 // 15 mins(accessToken) or 7 days (refreshToken)
  });
}

function clearAuthCookie(reply, isAccessToken = true) {
  const name = isAccessToken ? '__Host-accessToken' : '__Host-refreshToken';

  reply.clearCookie(name, { path: '/' });
}

export { setAuthCookie, clearAuthCookie };
