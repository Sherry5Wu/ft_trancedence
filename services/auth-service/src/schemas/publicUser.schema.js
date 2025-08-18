/**
 * Public User schema (used in API responses, like /users/profile/me, users/profile/:id)
 *  — excludes sensitive fields, only responses 'id', 'username' and 'avatarUrl'
 */
const publicUserSchema = {
  $id: 'publicUser',
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    username: { type: 'string', pattern: '^[a-zA-Z][a-zA-Z0-9._-]{5,19}$' },
    avatarUrl: { type: 'string', format: 'url'},
  },
  required: ['id', 'username']
};

export default publicUserSchema;

