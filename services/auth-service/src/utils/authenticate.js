import fp from 'fastify-plugin';
import { verifyAccessToken } from './jwt.js';
import { sendError } from './sendError.js';

// /**
//  * Middleware for verifying JWTs on protected routes using HttpOnly cookies.
//  * @param {*} fastify
//  */
// async function authenticate(fastify, options) {
//   fastify.decorate('authenticate', async function (req, reply) {
//     try {
//       // Read token directly from cookies
//       const token = req.cookies?.accessToken;
//       if (!token) {
//         return sendError(reply, 401, 'Unauthorized', 'Missing access token cookie');
//       }

//       //  Verify token
//       const decoded = verifyAccessToken(token);

//       //  Attach decoded user data to request object
//       req.user = decoded;
//     } catch (err) {
//       return sendError(reply, 401, 'Unauthorized', err.message);
//     }
//   });
// }

/**
 * Middleware for verifying JWTs on protected routes using Authorization header.
 * @param {*} fastify
 */
async function authenticate(fastify, options) {
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      // Expect header: Authorization: Bearer <token>
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(reply, 401, 'Unauthorized', 'Missing or invalid Authorization header');
      }

      const tokenMatch = authHeader.match(/^Bearer (.+)$/);
      if (!tokenMatch) {
        return sendError(reply, 401, 'Unauthorized', 'Invalid Authorization format');
      }

      const token = tokenMatch[1];

      // Verify token
      const decoded = verifyAccessToken(token);

      // Attach decoded user to request
      request.user = decoded;
    } catch (err) {
      // Token invalid or expired
      return sendError(reply, 401, 'Unauthorized', err.message);
    }
  });
}


export default fp(authenticate);

