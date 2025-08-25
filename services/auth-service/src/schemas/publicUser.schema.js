/**
 * Public User schema (used in API responses, like /users/profile/me, users/profile/:id)
 *  — excludes sensitive fields, only responses 'id', 'username' and 'avatarUrl'
 */
const publicUserSchema = {
  $id: 'publicUser',
  type: 'object',
  // required: ['id', 'username', 'avatarUrl',  ],
  required: ['id', 'username', 'avatarUrl', 'registerFromGoogle', 'TwoFAStatus',],
  properties: {
    id: { type: 'string', format: 'uuid' },
    username: { type: 'string', pattern: '^[a-zA-Z][a-zA-Z0-9._-]{5,19}$' },
    avatarUrl: { type: 'string', format: 'url'},
    TwoFAStatus: { type: 'boolean', description: 'Whether 2FA is enabled and confirmed' },
    registerFromGoogle: { type: 'boolean', description: 'Whether register through google account or normal way' },
  },
};

export default publicUserSchema;

