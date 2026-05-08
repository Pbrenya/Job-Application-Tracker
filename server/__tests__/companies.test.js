const request = require('supertest');
const app = require('../app');
const companyRepository = require('../repositories/companies.repository');
const db = require('../db');

jest.mock('../repositories/companies.repository');

describe('Company API Endpoints', () => {
    const mockCompany = {
        id: 'c1d2e3f4-g5h6-7890-1234-567890abcdef',
        name: 'Tech Solutions Inc.',
        location: 'San Francisco, CA',
        website: 'https://techsolutions.example.com',
        user_id: 'user-id-123'
    };

    afterAll(async () => {
        await db.disconnect();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/companies', () => {
        it('should return all companies for a user', async () => {
            companyRepository.findAllByUserId.mockResolvedValue([mockCompany]);
            const res = await request(app).get('/api/companies');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([mockCompany]);
        });
    });

    describe('POST /api/companies', () => {
        it('should create a new company', async () => {
            companyRepository.create.mockResolvedValue(mockCompany);
            const newCompanyData = { name: 'NewCo', location: 'New York' };
            const res = await request(app).post('/api/companies').send(newCompanyData);
            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(mockCompany);
        });

        it('should return 400 if name is missing', async () => {
            const res = await request(app).post('/api/companies').send({ location: 'Someplace' });
            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/companies/:id', () => {
        it('should return a single company', async () => {
            companyRepository.findById.mockResolvedValue(mockCompany);
            const res = await request(app).get(`/api/companies/${mockCompany.id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockCompany);
        });

        it('should return 404 if company not found', async () => {
            companyRepository.findById.mockResolvedValue(null);
            const res = await request(app).get('/api/companies/non-existent-id');
            expect(res.statusCode).toBe(404);
        });
    });

    describe('PATCH /api/companies/:id', () => {
        it('should update a company', async () => {
            const updatedCompany = { ...mockCompany, name: 'Updated Tech Solutions' };
            companyRepository.update.mockResolvedValue(updatedCompany);
            const res = await request(app).patch(`/api/companies/${mockCompany.id}`).send({ name: 'Updated Tech Solutions' });
            expect(res.statusCode).toBe(200);
            expect(res.body.name).toBe('Updated Tech Solutions');
        });

        it('should return 404 if company to update is not found', async () => {
            companyRepository.update.mockResolvedValue(null);
            const res = await request(app).patch('/api/companies/non-existent-id').send({ name: 'Does not matter' });
            expect(res.statusCode).toBe(404);
        });
    });

    describe('DELETE /api/companies/:id', () => {
        it('should soft delete a company', async () => {
            companyRepository.softDelete.mockResolvedValue(1);
            const res = await request(app).delete(`/api/companies/${mockCompany.id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.msg).toBe('Company deleted');
        });

        it('should return 404 if company to delete is not found', async () => {
            companyRepository.softDelete.mockResolvedValue(0);
            const res = await request(app).delete('/api/companies/non-existent-id');
            expect(res.statusCode).toBe(404);
        });
    });
});
