import Fastify from 'fastify';
import dotenv from 'dotenv';
import { initDB, db } from './db/init.js';
import scoreHistoryRoutes from './routes/scoreHistory.js';
import matchHistoryRoutes from './routes/matchHistory.js';
import rivalsRoutes from './routes/rivals.js';
import userMatchDataRoutes from './routes/userMatchData.js';

dotenv.config();

const fastify = Fastify({logger: true});

// Init the database
initDB(fastify);

fastify.register(scoreHistoryRoutes, { prefix: '/score_history'});
fastify.register(matchHistoryRoutes, { prefix: '/match_history'});
fastify.register(rivalsRoutes, { prefix: '/rivals'});
fastify.register(userMatchDataRoutes, { prefix: '/user_match_data'})



const start = async () => {
    try
    {
        const port = process.env.PORT || 3001;

        await fastify.ready();
        console.log(fastify.printRoutes());

        await fastify.listen({ port, host: '0.0.0.0' });
        console.log("✅ Server is running!");
    }
    catch (err)
    {
        fastify.log.error(err);
        console.error("❌ Server failed to start:", err);
        process.exit(1);
    }
};

start();

const gracefullShutdown = async (signal) => {
    fastify.log.info(`Received ${signal}, shutting down gracefully...`);
    try {
      await fastify.close();
      db.close();
      fastify.log.info('Server and database closed successfully');
    } catch (err) {
      fastify.log.error('Error during shutdown:', err);
      process.exit(1);
    }
    process.exit(0);
  };
  
  process.on('SIGINT', gracefullShutdown);
  process.on('SIGTERM', gracefullShutdown);
