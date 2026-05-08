const request = require('supertest');
const app = require('../app');
const applicationRepository = require('../repositories/applications.repository');

jest.mock('../repositories/applications.repository');

describe('GET /api/applications', () => {
  it('should return all applications for a user', async () => {
    const mockApplications = [{ id: 1, job_title: 'Software Engineer' }];
    applicationRepository.findAllByUserId.mockResolvedValue(mockApplications);

    const response = await request(app)
      .get('/api/applications')
      .set('Authorization', 'Bearer your_test_token'); // Replace with a valid test token

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(mockApplications);
  });
});
