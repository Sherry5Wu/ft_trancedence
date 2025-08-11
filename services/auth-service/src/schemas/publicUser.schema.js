/**
 * Public User schema (used in API responses) — excludes sensitive fields.
 */
const publicUserSchema = {
  $id: 'publicUser',
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' },
    username: { type: 'string', pattern: '^[a-zA-Z][a-zA-Z0-9._-]{5,19}$' },
    role: { type: 'string', enum: ['user', 'admin'] },
    is2FAEnabled: { type: 'boolean' },
    isVerified: { type: 'boolean' },
  },
  required: ['id', 'email', 'username', 'role', 'isVerified']
};

export default publicUserSchema;

