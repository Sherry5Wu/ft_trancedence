const userSchema = {
  $id: 'User',
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' },
    isVerified: { type: 'boolean' }
  },
  required: ['id', 'email', 'isVerified']
};

export default userSchema;
