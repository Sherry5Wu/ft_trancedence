import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  fastify.decorate('jwtSign', (payload) => {
    return fastify.jwt.sign(payload);
  });

  fastify.decorate('jwtVerify', (token) => {
    return fastify.jwt.verify(token);
  });
});

