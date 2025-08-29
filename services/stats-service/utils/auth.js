export const requireAuth = async (request, reply) => {
    try {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return reply.status(401).send({ error: 'Missing or invalid authorization header' });
        }
        console.log("Authenticating...")
        const response = await fetch('http://auth-service:3001/auth/verify-token', {
          method: 'POST',
          headers: {
            'Authorization': authHeader
          }
        });
    
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Authentication failed' }));
          return reply.status(response.status).send(errorData);
        }
    
        const userData = await response.json();
        
        request.id = userData.id;
        request.email = userData.email;
        request.username = userData.username;
        console.log("loggin userData");
        console.log(userData);
        
        console.log(`✅ Authenticated user: ${userData.username} (${userData.id})`);
        
      } catch (error) {
        console.error('🚨 Auth service connection error:', error.message);
        return reply.status(503).send({ 
          error: 'Authentication service unavailable',
          details: error.message 
        });
    }
};