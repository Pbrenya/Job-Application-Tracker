const request = require('supertest');
const app = require('../app');
const applicationRepository = require('../repositories/applications.repository');
const path = require('path');
const fs = require('fs');

jest.mock('../repositories/applications.repository');

describe('POST /api/applications/:id/resume', () => {
    const testUploadsDir = path.join(__dirname, 'test_uploads');

    beforeAll(() => {
        if (!fs.existsSync(testUploadsDir)) {
            fs.mkdirSync(testUploadsDir);
        }
    });

    afterAll(() => {
        fs.rmSync(testUploadsDir, { recursive: true, force: true });
        // Also clean up the main uploads directory if tests create files there
        const mainUploadsDir = path.join(__dirname, '..', 'uploads');
        fs.readdir(mainUploadsDir, (err, files) => {
            if (err) return;
            for (const file of files) {
                // Add a condition to avoid deleting .gitkeep or other important files
                if (file.startsWith('resume-')) {
                    fs.unlink(path.join(mainUploadsDir, file), err => {});
                }
            }
        });
    });

    it('should upload a resume and update the application', async () => {
        const applicationId = 'some-uuid';
        const userId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef'; // Corrected user ID
        const mockApplication = { id: applicationId, user_id: userId, resume_path: null };
        const updatedMockApplication = { ...mockApplication, resume_path: 'uploads/resume-mock.pdf' };

        applicationRepository.findById.mockResolvedValue(mockApplication);
        applicationRepository.update.mockResolvedValue(updatedMockApplication);

        const testFilePath = path.join(testUploadsDir, 'test-resume.pdf');
        fs.writeFileSync(testFilePath, 'This is a test resume.');

        const res = await request(app)
            .post(`/api/applications/${applicationId}/resume`)
            .set('Authorization', `Bearer some-token`) // The token is mocked in jest.setup.js
            .attach('resume', testFilePath);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('msg', 'File uploaded successfully');
        expect(res.body).toHaveProperty('file');
        expect(res.body.application.resume_path).not.toBeNull();
        expect(applicationRepository.findById).toHaveBeenCalledWith(applicationId, userId);
        expect(applicationRepository.update).toHaveBeenCalledWith(applicationId, userId, { resume_path: expect.any(String) });
    });

    it('should return 404 if application not found', async () => {
        const applicationId = 'non-existent-uuid';
        applicationRepository.findById.mockResolvedValue(null);

        const testFilePath = path.join(testUploadsDir, 'test-resume-2.pdf');
        fs.writeFileSync(testFilePath, 'Another test resume.');

        const res = await request(app)
            .post(`/api/applications/${applicationId}/resume`)
            .set('Authorization', `Bearer some-token`)
            .attach('resume', testFilePath);

        expect(res.statusCode).toEqual(404);
        expect(res.body).toHaveProperty('msg', 'Application not found');
    });

    it('should return 400 if no file is selected', async () => {
        const applicationId = 'some-uuid';
        const res = await request(app)
            .post(`/api/applications/${applicationId}/resume`)
            .set('Authorization', `Bearer some-token`);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('msg', 'Error: No File Selected!');
    });

    it('should return 400 for invalid file type', async () => {
        const applicationId = 'some-uuid';
        const testFilePath = path.join(testUploadsDir, 'test-invalid.txt');
        fs.writeFileSync(testFilePath, 'This is an invalid file type.');

        const res = await request(app)
            .post(`/api/applications/${applicationId}/resume`)
            .set('Authorization', `Bearer some-token`)
            .attach('resume', testFilePath);

        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty('msg', 'Error: PDFs, Docs, and Images Only!');
    });
});
