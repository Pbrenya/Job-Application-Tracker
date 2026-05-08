const request = require('supertest');
const app = require('../app');
const analyticsRepository = require('../repositories/analytics.repository');

jest.mock('../repositories/analytics.repository');

describe('GET /api/analytics', () => {
    it('should return analytics data for the user', async () => {
        const userId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
        const mockStats = {
            totalApplications: 10,
            applicationsByStage: [
                { name: 'Applied', count: 5 },
                { name: 'Interview', count: 3 },
                { name: 'Offer', count: 2 }
            ],
            applicationsByCompany: [
                { name: 'Google', count: 2 },
                { name: 'Facebook', count: 1 }
            ],
            applicationsOverTime: [
                { month: '2023-01', count: 4 },
                { month: '2023-02', count: 6 }
            ]
        };

        analyticsRepository.getStats.mockResolvedValue(mockStats);

        const res = await request(app)
            .get('/api/analytics')
            .set('Authorization', `Bearer some-token`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual(mockStats);
        expect(analyticsRepository.getStats).toHaveBeenCalledWith(userId);
    });

    it('should return 500 if there is a server error', async () => {
        analyticsRepository.getStats.mockRejectedValue(new Error('Database error'));

        const res = await request(app)
            .get('/api/analytics')
            .set('Authorization', `Bearer some-token`);

        expect(res.statusCode).toEqual(500);
        expect(res.body).toHaveProperty('error', 'Database error');
    });
});
