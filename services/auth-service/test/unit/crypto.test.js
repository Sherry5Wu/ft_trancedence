import { hashPassword, comparePassword } from "../../src/utils/crypto";

describe('Password hashing and comparison', () => {
	const plainPassword = 'Myseceret680pass!';

	test('Test1: hashPassword should return a hashed string different from the original password', async () => {
		const hash = await hashPassword(plainPassword);

		expect(typeof hash).toBe('string');
		expect(hash).not.toBe(plainPassword);
		expect(hash.length).toBeGreaterThan(0);
	});

	test('Test2: comparePassword should return true for correct password and hash', async () => {
		const hash = await hashPassword(plainPassword);
		const isMatch = await comparePassword(plainPassword, hash);

		expect(isMatch).toBe(true);
	});

	test('Test3: comparePassword should return false for incorrect password', async () => {
		const hash = await hashPassword(plainPassword);
		const isMatch = await comparePassword('incorrectpasswordP1', hash);

		expect(isMatch).toBe(false);
	});
});
