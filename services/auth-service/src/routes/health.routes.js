import fp from 'fastify-plugin';

export default fp(async (fastify) => {
  /**
   * @route   GET /health
   * @desc    Service health check
   */
  fastify.get('/health', {
    schema: {
      tags: ['Health'],
      summary: 'Health check endpoint',
      description: 'Returns service health status.',
      response: {
        200: {
          description: 'Service is healthy',
          type: 'object',
          properties: {
            status: { type: 'string', example: 'ok' }
          }
        }
      }
    }
  }, async (req, reply) => {
    return { status: 'ok' };
  });
});
