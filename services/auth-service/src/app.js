require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const db = require('./db');

// Register plugins and routes
fastify.register(require('@fastify/jwt'), { secret: process.env.JWT_SECRET });
fastify.register(require('./routes/google-auth'));
fastify.register(require('./routes/jwt'));
fastify.register(require('./routes/2fa'));

// Initialize DB and start server
db.sequelize.sync().then(() => {
  fastify.listen({ port: 3000, host: '0.0.0.0' }, (err) => {
    if (err) throw err;
    console.log('Auth service running on port 3000');
  });
});
