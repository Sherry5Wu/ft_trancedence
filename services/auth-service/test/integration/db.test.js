const db = require('../../src/db');
const { User } = db;

describe('Database', () => {
  beforeAll(async () => {
    await db.sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await db.sequelize.close();
  });

  test('User model creates records', async () => {
    const user = await User.create({
      email: 'test@example.com',
      passwordHash: 'test_hash'
    });
    expect(user.id).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });

  test('User model rejects duplicate emails', async () => {
    await User.create({ email: 'dupe@example.com', passwordHash: 'hash1' });
    await expect(
      User.create({ email: 'dupe@example.com', passwordHash: 'hash2' })
    ).rejects.toThrow('Validation error');
  });
});
