const request = require('supertest');
const app = require('../app');
const noteRepository = require('../repositories/notes.repository');
const db = require('../db');

jest.mock('../repositories/notes.repository');

describe('Notes API Endpoints', () => {
    const mockApplicationId = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
    const mockNote = {
        id: 'n1o2t3e4-e5f6-7890-1234-567890abcdef',
        application_id: mockApplicationId,
        note: 'This is a test note.',
        user_id: 'user-id-123'
    };

    afterAll(async () => {
        await db.disconnect();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/applications/:appId/notes', () => {
        it('should return all notes for an application', async () => {
            noteRepository.findAllByApplicationId.mockResolvedValue([mockNote]);
            const res = await request(app).get(`/api/applications/${mockApplicationId}/notes`);
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([mockNote]);
            expect(noteRepository.findAllByApplicationId).toHaveBeenCalledWith(mockApplicationId, expect.any(String));
        });
    });

    describe('POST /api/applications/:appId/notes', () => {
        it('should create a new note for an application', async () => {
            noteRepository.create.mockResolvedValue(mockNote);
            const res = await request(app)
                .post(`/api/applications/${mockApplicationId}/notes`)
                .send({ note: 'This is a test note.' });
            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(mockNote);
        });

        it('should return 404 if the application does not exist', async () => {
            noteRepository.create.mockResolvedValue(null);
            const res = await request(app)
                .post('/api/applications/non-existent-app-id/notes')
                .send({ note: 'A note for a ghost app.' });
            expect(res.statusCode).toBe(404);
        });

        it('should return 400 if note content is missing', async () => {
            const res = await request(app)
                .post(`/api/applications/${mockApplicationId}/notes`)
                .send({});
            expect(res.statusCode).toBe(400);
        });
    });

    describe('PATCH /api/notes/:noteId', () => {
        it('should update a note', async () => {
            const updatedNote = { ...mockNote, note: 'This is an updated note.' };
            noteRepository.update.mockResolvedValue(updatedNote);
            const res = await request(app)
                .patch(`/api/notes/${mockNote.id}`)
                .send({ note: 'This is an updated note.' });
            expect(res.statusCode).toBe(200);
            expect(res.body.note).toBe('This is an updated note.');
        });

        it('should return 404 if note to update is not found', async () => {
            noteRepository.update.mockResolvedValue(null);
            const res = await request(app)
                .patch('/api/notes/non-existent-note-id')
                .send({ note: 'Does not matter' });
            expect(res.statusCode).toBe(404);
        });
    });

    describe('DELETE /api/notes/:noteId', () => {
        it('should soft delete a note', async () => {
            noteRepository.softDelete.mockResolvedValue(1);
            const res = await request(app).delete(`/api/notes/${mockNote.id}`);
            expect(res.statusCode).toBe(200);
            expect(res.body.msg).toBe('Note deleted');
        });

        it('should return 404 if note to delete is not found', async () => {
            noteRepository.softDelete.mockResolvedValue(0);
            const res = await request(app).delete('/api/notes/non-existent-note-id');
            expect(res.statusCode).toBe(404);
        });
    });
});
