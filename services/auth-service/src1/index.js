import Fastify from 'fastify';
import fastifyJWT from 'fastify-jwt';
import fastifyCors from 'fastify-cors';
import dotenv from 'dotenv';
import authRoutes from './auth.routes.js';
import { initDb } from './db.js';

dotenv.config();

const fastify = Fastify({ logger: true });

fastify.register(fastifyJWT, { secret: process.env.JWT_SECRET });
await initDb(); // create table if needed
authRoutes(fastify);

fastify.register(fastifyCors, {
	origin: true,// or specify: origin: "http://localhost:3001"
	credentials: true
});

/** add middleware */
fastify.decorate("authenticate", async function (request, reply) {
  try {
    request.user = await fastify.jwt.verify(request.headers.authorization?.split(" ")[1]);
  } catch (err) {
    reply.send(err);
  }
});

fastify.get('/health', async () => ({ status: 'ok' }));

fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
