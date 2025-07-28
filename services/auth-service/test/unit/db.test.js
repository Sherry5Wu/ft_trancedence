// Using jtest test suite
import { UniqueConstraintError } from "sequelize";
import { sequelize, User, initDB } from "../../src/db/index.js";

// 'describe' groups related tests into a test suite
describe('Database Initialization and User Model', () => {
  // beforeAll() will only run once before all tests in this suite
  beforeAll(async () => {
    process.env.DB_PATH = ':memory:'; // Using an in-memory database(not a physical file)
    await initDB();
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Test 1: Database should connect successfully', async () => {
    const status = await sequelize.authenticate();
    expect(status).toBeUndefined();
  });

  test('Test2: User table should be created', async () => {
    const tables = await sequelize.getQueryInterface().showAllSchemas();
    const tableNames = tables.map(t => Object.values(t)[0]);
    expect(tableNames).toContain('Users');
  });

  test('Test3: Should create and fetch a user', async () => {
    const user = await User.create({
      email: 'test@google.com',
      passwordHash: 'hashedpassword',
    });

    expect(user.email).toBe('test@google.com');
    expect(user.is2FAEnabled).toBe(false);
  });

  test('Test4: Should apply default scope (exclude sensitive fields)', async () => {
    const user = await User.create({
      email: 'example@google.com',
      passwordHash: 'secretpassword',
      twoFASecret: 'totp-secret',
    });

    const found = await User.findByPk(user.id);
    expect(found.passwordHash).toBeUndefined();
    expect(found.twoFASecret).toBeUndefined();
  });

  test('Test5: Should apply withSecrets scope', async () => {
    const user = await User.create({
      email: 'secret@googleAuth.com',
      passwordHash: 'hasshhhhedpassword',
      twoFASecret: 'totp-secret',
    });

    const found = await User.scope('withSecrets').findByPk(user.id);
    expect(found.twoFASecret).toBe('totp-secret');
  });

  // Tests for email validations and constraints
  test('Test6: should fail when email is invalid', async () => {
    await expect(
      User.create({
        email: 'invalid-email',
        passwordHash: 'hassheddpassword',
      })
    ).rejects.toThrow(/Validation error/);
  });

  test('Test7: Should failed when required fields are missing', async () => {
    await expect(
      User.create({email: 'missingpassword@google.com'})
    ).rejects.toThrow(/notNull Violation/);
  });

  test('Test8: Should fail when duplicate email is used', async () => {
    await User.create({
      email: 'unique@google.com',
      passwordHash: 'password',
    });

    await expect(
      User.create({
        email: 'unique@google.com',
        passwordHash: 'kokopassword',
      })
    ).rejects.toThrow(UniqueConstraintError);
  });

  test('Test9: Should store and retrieve backupCodes as an array', async () => {
    const codes = ['code1', 'code2', 'code3'];

    const user = await User.create({
      email: 'backupcodes@example.com',
      passwordHash: 'hashedpassword',
      backupCodes: codes,
    });

    const found = await User.scope('withSecrets').findByPk(user.id);
    expect(Array.isArray(found.backupCodes)).toBe(true);
    expect(found.backupCodes).toEqual(codes);
  });
});
