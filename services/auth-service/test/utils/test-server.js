const fastify = require('fastify');
const app = require('../../src/app');

module.exports = async () => {
  const server = fastify();
  server.register(app);
  await server.ready();
  return server;
};
