import Fasity from 'fastify';
import errorsPlugin from '../../src/utils/errors.js';
import validatorsPlugin from '../../src/utils/validators.js'

describe('Inegration Test: Validators with Fastiy and Errors', () => {
	let fastify;

	beforeAll(async () => {
		fastify = Fasity();
		await fastify.register(errorsPlugin);
		await fastify.register(validatorsPlugin);
		await fastify.ready();
	});

	afterAll(async () => {
		await fastify.close();
	});

	describe('validateEmailFormat', () => {
		test('Test1: throws validationError for invalid email', async () => {
			expect(() => fastify.validators.validateEmailFormat('invalid-email'))
			.toThrow(fastify.authErrors.ValidationError);
			expect(() => fastify.validators.validateEmailFormat('invalid-email@.com'))
			.toThrow(fastify.authErrors.ValidationError);
			expect(() => fastify.validators.validateEmailFormat('invalid-email@g.m'))
			.toThrow(fastify.authErrors.ValidationError);
		});

		test('Test2: throws ValidationError for non-string input', async () => {
			expect(() => fastify.validators.validateEmailFormat(null))
			.toThrow('Invalid email format');
			expect(() => fastify.validators.validateEmailFormat(2344))
			.toThrow('Invalid email format');
		});

		test('Test3: Passes for valid email', async () => {
			expect(() => fastify.validators.validateEmailFormat('valid@email.com'))
			.not.toThrow();
		});

		test('Test4: trims whitespace before validating', () => {
			expect(() => fastify.validators.validateEmailFormat(' 	example@google.com 	'))
			.not.toThrow();
		});
	});

	describe('normalizeEmail', () => {
		test('Test1: throws ValidationError for empty or whitespace-only email', () => {
			expect(() => fastify.validators.normalizeEmail(''))
			.toThrow(fastify.authErrors.ValidationError);
			expect(() => fastify.validators.normalizeEmail('  		'))
			.toThrow('Email is required');
		});

		test('Test2: throws ValidationError for non-string inputs', () => {
			expect(() => fastify.validators.normalizeEmail(null))
			.toThrow('Email is required');
			expect(() => fastify.validators.normalizeEmail(5689))
			.toThrow('Email is required');
		});

		test('Test3: normalizes email to lowercase', () => {
			expect(fastify.validators.normalizeEmail('aBC3@GGo.Com'))
			.toBe('abc3@ggo.com');
		});

		test('Test4: remove dot for Gmail domain name', () => {
			expect(fastify.validators.normalizeEmail('test.dot.remove@Gmail.com'))
			.toBe('testdotremove@gmail.com');
			expect(fastify.validators.normalizeEmail('lowercase.gmail@gmail.com'))
			.toBe('lowercasegmail@gmail.com');
		});

		test('Test5: does not alter non-Gmail emails with dots', () => {
			expect(fastify.validators.normalizeEmail('do.not.remove@google.com'))
			.toBe('do.not.remove@google.com');
			expect(fastify.validators.normalizeEmail('gmail.in.name@QQ.com'))
			.toBe('gmail.in.name@qq.com');
		});
	});

	describe('validatePassword', () => {
		test('Test1: throws ValidationError for empty or whitespace-only password', () => {
			expect(() => fastify.validators.validatePassword(''))
			.toThrow(fastify.authErrors.ValidationError);
			expect(() => fastify.validators.validatePassword('	  	'))
			.toThrow('Password is required and must be a string');
		});

		test('Test2: throws ValidationError for non-string input', () => {
			expect(() => fastify.validators.validatePassword(null))
			.toThrow('Password is required and must be a string');
			expect(() => fastify.validators.validatePassword(233))
			.toThrow('Password is required and must be a string');
		});

		test('Test3: throws ValidationError for password without uppercase', () => {
			expect(() => fastify.validators.validatePassword('nouppercase1@'))
			.toThrow('Password format is wrong');
		});

		test('Test4: throws ValidationError for password without lowercase', () => {
			expect(() => fastify.validators.validatePassword('NOLOWERCASE1@'))
			.toThrow('Password format is wrong');
		});

		test('Test5: throws ValidationError for password without numbers', () => {
			expect(() => fastify.validators.validatePassword('NoNumbers@'))
			.toThrow('Password format is wrong');
		});

		test('Test6: throws ValidationError for password without special characers(@$!%*?&)', () => {
			expect(() => fastify.validators.validatePassword('NoSpecial1('))
			.toThrow('Password format is wrong');
		});

		test('Test7: throws ValidationError for short password (< 8 characters)', () => {
			expect(() => fastify.validators.validatePassword('Short1@'))
			.toThrow('Password format is wrong');
		});

		test('Test8: throws ValidationError for short password (< 8 characters)', () => {
			const longPassword = 'A@1' + 'a'.repeat(70);
			expect(() => fastify.validators.validatePassword(longPassword))
			.toThrow('Password format is wrong');
		});

		test('Test9: passes for a valid password', () => {
			expect(() => fastify.validators.validatePassword('Valid@1P'))
			.not.toThrow();
		});
	});

	describe('normalizeAndValidateEmail', () => {
		test('Test1: throws ValidationError for invalid email', () => {
			expect(() => fastify.validators.normalizeAndValidateEmail('invalid-email'))
			.toThrow('Invalid email format');
		});

		test('Test2: validate and normalizes email correctly', () => {
			const result = fastify.validators.normalizeAndValidateEmail('Valid.email@Gmail.com');
			expect(result).toBe('validemail@gmail.com');
		});
	});
});

