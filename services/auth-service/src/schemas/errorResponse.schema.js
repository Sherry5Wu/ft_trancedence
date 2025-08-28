/**
 * Uniform the error reply: must contain status, error and message.
 */
const errorResponseSchema = {
  $id: 'errorResponse',
  type: 'object',
  required: ['error', 'message'],
  properties: {
    status: { type: 'integer', example: 400 },
    error: { type: 'string', example: 'Bad request' },
    message: { type: 'string', example: 'Missing required field "email"' },
    details: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          field: { type: 'string', example: 'email' },
          issue: { type: 'string', example: 'required' },
        }
      },
      default: []
    }
  }
};

export default errorResponseSchema;
