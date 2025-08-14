const db = require('../../src/db');

module.exports = {
  setup: async () => {
    await db.sequelize.sync({ force: true });
    return db;
  },
  teardown: async () => {
    await db.sequelize.drop();
    await db.sequelize.close();
  },
  createTestUser: async (attributes = {}) => {
    return db.User.create({
      email: 'test@example.com',
      passwordHash: 'test_hash',
      ...attributes
    });
  }
};
