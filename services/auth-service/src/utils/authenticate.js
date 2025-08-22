import fp from 'fastify-plugin';
import { verifyAccessToken } from './jwt.js';
import { sendError } from './sendError.js';

/**
 * Middleware for verifying JWTs on protected routes using HttpOnly cookies.
 * @param {*} fastify
 */
async function authenticate(fastify, options) {
  fastify.decorate('authenticate', async function (req, reply) {
    try {
      // Read token directly from cookies
      const token = req.cookies?.accessToken;
      if (!token) {
        return sendError(reply, 401, 'Unauthorized', 'Missing access token cookie');
      }

      //  Verify token
      const decoded = verifyAccessToken(token);

      //  Attach decoded user data to request object
      req.user = decoded;
    } catch (err) {
      return sendError(reply, 401, 'Unauthorized', err.message);
    }
  });
}

export default fp(authenticate);




/**
 * Middleware for verifying JWTs on protected routes.
 * Supports both Authorization header and HttpOnly cookie.
 */
// async function authenticate(fastify, options) {
//   fastify.decorate('authenticate', async function (req, reply) {
//     try {
//       let token;

//       // Check Authorization header
//       const authHeader = req.headers.authorization;
//       if (authHeader) {
//         const tokenMatch = authHeader.match(/^Bearer (.+)$/);
//         if (!tokenMatch) {
//           return reply.status(401).send({ error: 'Invalid Authorization format' });
//         }
//         token = tokenMatch[1];
//       }

//       //If no header, check cookies
//       if (!token && req.cookies?.accessToken) {
//         token = req.cookies.accessToken;
//       }

//       //Still missing? Unauthorized
//       if (!token) {
//         return reply.status(401).send({ error: 'Missing token (header or cookie)' });
//       }

//       //Verify token
//       const decoded = verifyAccessToken(token);

//       //Attach decoded user to request for downstream use
//       req.user = decoded;

//     } catch (err) {
//       return reply.status(401).send({ error: 'Unauthorized: ' + err.message });
//     }
//   });
// }

// export default fp(authenticate);
