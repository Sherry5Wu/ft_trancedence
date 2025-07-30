import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import {
	generateAccessToken,
	generateRefreshToken,
	verifyAccessToken,
	verifyRefreshToken,
	decodeToken,
 } from '../../src/utils/jwt.js';

// Load environment variables
dotenv.config();

decribe('JWT Service Functions', () => {
	const payload = {
		id: 'dfs1444211',
		email: 'example@yahoo.com',
	};

	test('Test1: generateAccessToken should create a valid access token', () => {
		const token = generateAccessToken(payload);
		expect(typeof token).toBe('string');

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		expect(decoded.id).toBe(payload.id);
		expect(decoded.email).toBe(payload.email);
	});

	test('Test2: generateRefreshToken should create a valid refresh token', () => {
		const token = generateRefreshToken(payload);
		expect(typeof token).toBe('string');

		const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
		expect(decoded.id).toBe(payload.id);
		expect(decoded.email).toBe(payload.email);
	});

	test('Test3: verifyAccessToken should return payload for valid  access token', () => {
		const token = generateAccessToken(payload);
		const decoded = verifyAccessToken(token);

		expect(decoded.id).toBe(payload.id);
		expect(decoded.email).toBe(payload.email);
	});

	test('Test4: verifyAccessToken should throw an error for invalid token', () => {
		expect(() => verifyAccessToken('invalid-token')).toThrow();
	});

	test('Test5: verifyRefreshToken should return payload for valid Refresh token', () => {
		const token = generateRefreshToken(payload);
		const decoded = verifyRefreshToken(token);

		expect(decoded.id).toBe(payload.id);
		expect(decoded.email).toBe(payload.email);
	});

	test('Test6: verifyRefreshToken should throw an error for invalid token', () => {
		expect(() => verifyRefreshToken('invalid-token')).toThrow();
	});

	test('Test7: decodeToken should decode valid token without verifying', () => {
		const token = generateAccessToken(payload);
		const decoded = decodeToken(token);

		expect(decoded.id).toBe(payload.id);
		expect(decoded.email).toBe(payload.email);
	});

	test('Test8: decodeToken should return null for invalid token', () => {
		const decoded = decodeToken('Invalid-token');
		expect(decoded).toBeNull();
	});
});
