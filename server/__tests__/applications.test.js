const request = require('supertest');
const app = require('../app');
const applicationRepository = require('../repositories/applications.repository');
const db = require('../db'); // Import db to disconnect

// Mock the repository to prevent actual database calls
jest.mock('../repositories/applications.repository');

const mockApplication = { 
  id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', 
  job_title: 'Software Engineer',
  company_id: 'c1d2e3f4-g5h6-7890-1234-567890abcdef'
};

describe('Application API Endpoints', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Disconnect from the database after all tests have run
  afterAll(async () => {
    await db.disconnect();
  });

  // --- GET /api/applications ---
  describe('GET /api/applications', () => {
    it('should return all applications for a user', async () => {
      applicationRepository.findAllByUserId.mockResolvedValue([mockApplication]);
      const response = await request(app).get('/api/applications');
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual([mockApplication]);
    });

    it('should return a 500 error if the database fails', async () => {
      applicationRepository.findAllByUserId.mockRejectedValue(new Error('Database connection lost'));
      const response = await request(app).get('/api/applications');
      expect(response.statusCode).toBe(500);
      expect(response.body.error).toContain('Database connection lost');
    });
  });

  // --- POST /api/applications ---
  describe('POST /api/applications', () => {
    it('should create a new application and return it with status 201', async () => {
      applicationRepository.create.mockResolvedValue(mockApplication);
      const newAppData = { company_id: 'c1d2e3f4-g5h6-7890-1234-567890abcdef', job_title: 'Software Engineer', stage_id: 1 };
      const response = await request(app).post('/api/applications').send(newAppData);
      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual(mockApplication);
    });

    it('should return a 400 error if required fields are missing', async () => {
      const response = await request(app).post('/api/applications').send({ job_title: 'Incomplete' });
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    it('should return a 400 error if salary_min is not a number', async () => {
        const newAppData = { company_id: 'c1d2e3f4-g5h6-7890-1234-567890abcdef', job_title: 'Software Engineer', stage_id: 1, salary_min: 'not-a-number' };
        const response = await request(app).post('/api/applications').send(newAppData);
        
        if (response.statusCode !== 400) {
            console.log('Unexpected response body:', response.body);
        }

        expect(response.statusCode).toBe(400);
        const salaryError = response.body.errors.find(e => e.param === 'salary_min' || (e.path && e.path === 'salary_min'));
        expect(salaryError).toBeDefined();
        expect(salaryError.msg).toBe('Salary must be a number');
    });
  });

  // --- GET /api/applications/:id ---
  describe('GET /api/applications/:id', () => {
    it('should return a single application if found', async () => {
      applicationRepository.findById.mockResolvedValue(mockApplication);
      const response = await request(app).get(`/api/applications/${mockApplication.id}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockApplication);
    });

    it('should return a 404 error if the application is not found for the user', async () => {
      applicationRepository.findById.mockResolvedValue(null);
      const response = await request(app).get('/api/applications/not-a-real-id');
      expect(response.statusCode).toBe(404);
      expect(response.body.msg).toBe('Application not found');
    });
  });

  // --- PATCH /api/applications/:id ---
  describe('PATCH /api/applications/:id', () => {
    it('should update an application and return the updated record', async () => {
      applicationRepository.update.mockResolvedValue({ ...mockApplication, job_title: 'Senior Engineer' });
      const updateData = { job_title: 'Senior Engineer' };
      const response = await request(app).patch(`/api/applications/${mockApplication.id}`).send(updateData);
      expect(response.statusCode).toBe(200);
      expect(response.body.job_title).toBe('Senior Engineer');
    });

    it('should return a 404 error if the application to update is not found', async () => {
      applicationRepository.update.mockResolvedValue(null);
      const response = await request(app).patch('/api/applications/not-a-real-id').send({ job_title: 'Does not matter' });
      expect(response.statusCode).toBe(404);
    });
  });

  // --- DELETE /api/applications/:id ---
  describe('DELETE /api/applications/:id', () => {
    it('should soft delete an application and return a success message', async () => {
      applicationRepository.softDelete.mockResolvedValue(1);
      const response = await request(app).delete(`/api/applications/${mockApplication.id}`);
      expect(response.statusCode).toBe(200);
      expect(response.body.msg).toBe('Application deleted');
    });

    it('should return a 404 error if the application to delete is not found', async () => {
      applicationRepository.softDelete.mockResolvedValue(0);
      const response = await request(app).delete('/api/applications/not-a-real-id');
      expect(response.statusCode).toBe(404);
    });
  });
});
