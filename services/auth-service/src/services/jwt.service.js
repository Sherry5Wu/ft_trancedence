const fp = require('fastify-plugin');

module.exports = fp(async (fastify) => {
  fastify.decorate('jwtSign', (payload) => {
    return fastify.jwt.sign(payload);
  });

  fastify.decorate('jwtVerify', (token) => {
    return fastify.jwt.verify(token);
  });
});
