const request = require('supertest');
const app = require('../app');
const userRepository = require('../repositories/users.repository');
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../repositories/users.repository');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth API Endpoints', () => {
    
    afterAll(async () => {
        await db.disconnect();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/auth/register', () => {
        it('should register a new user and return a token', async () => {
            userRepository.findByEmail.mockResolvedValue(null);
            bcrypt.genSalt.mockResolvedValue('a-salt-string');
            bcrypt.hash.mockResolvedValue('a-hashed-password');
            userRepository.create.mockResolvedValue({ id: 'new-user-id', email: 'test@example.com' });
            jwt.sign.mockImplementation((payload, secret, options, callback) => {
                callback(null, 'a-jwt-token');
            });

            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('token', 'a-jwt-token');
            expect(userRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
            expect(userRepository.create).toHaveBeenCalledWith('test@example.com', 'a-hashed-password');
        });

        it('should return 400 if user already exists', async () => {
            userRepository.findByEmail.mockResolvedValue({ id: 'existing-user-id', email: 'test@example.com' });

            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('msg', 'User already exists');
        });

        it('should return 400 on validation error', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({ email: 'not-an-email', password: '123' });
            
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('errors');
        });
    });

    describe('POST /api/auth/login', () => {
        const mockUser = {
            id: 'user-id-123',
            email: 'test@example.com',
            password_hash: 'hashed-password-from-db'
        };

        it('should login a user and return a token', async () => {
            userRepository.findByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockImplementation((payload, secret, options, callback) => {
                callback(null, 'a-jwt-token');
            });

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'password123' });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('token', 'a-jwt-token');
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password_hash);
        });

        it('should return 400 for non-existent user', async () => {
            userRepository.findByEmail.mockResolvedValue(null);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'nouser@example.com', password: 'password123' });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('msg', 'Invalid Credentials');
        });

        it('should return 400 for wrong password', async () => {
            userRepository.findByEmail.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'test@example.com', password: 'wrongpassword' });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('msg', 'Invalid Credentials');
        });
    });
});
