const db = require('../db');
const logger = require('../logger');

/**
 * Finds all notes for a given application, ensuring user ownership.
 * @param {string} applicationId - The ID of the application.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array>} A list of note objects.
 */
const findAllByApplicationId = async (applicationId, userId) => {
    try {
        const result = await db.query(`
            SELECT n.* FROM notes n
            JOIN applications a ON n.application_id = a.id
            WHERE n.application_id = @applicationId AND a.user_id = @userId AND n.is_deleted = 0
        `, { applicationId, userId });
        return result.recordset;
    } catch (error) {
        logger.error(`Error finding notes by application ID: ${error.message}`);
        throw error;
    }
};

/**
 * Creates a new note for an application.
 * @param {string} applicationId - The ID of the application.
 * @param {string} userId - The ID of the user making the request.
 * @param {string} noteText - The content of the note.
 * @returns {Promise<object|null>} The newly created note object, or null if the application is not found for the user.
 */
const create = async (applicationId, userId, noteText) => {
    try {
        // First, verify the application belongs to the user to prevent unauthorized notes
        const appResult = await db.query('SELECT id FROM applications WHERE id = @applicationId AND user_id = @userId AND is_deleted = 0', { applicationId, userId });
        if (appResult.recordset.length === 0) {
            return null; // Application not found or doesn't belong to user
        }

        const result = await db.query(
            'INSERT INTO notes (application_id, note) OUTPUT INSERTED.* VALUES (@applicationId, @noteText)',
            { applicationId, noteText }
        );
        return result.recordset[0];
    } catch (error) {
        logger.error(`Error creating note: ${error.message}`);
        throw error;
    }
};

/**
 * Updates an existing note.
 * @param {string} noteId - The ID of the note to update.
 * @param {string} userId - The ID of the user.
 * @param {string} noteText - The new content for the note.
 * @returns {Promise<object|null>} The updated note object, or null if not found.
 */
const update = async (noteId, userId, noteText) => {
    try {
        const result = await db.query(`
            UPDATE notes 
            SET note = @noteText, updated_at = GETDATE()
            OUTPUT INSERTED.*
            FROM notes n
            JOIN applications a ON n.application_id = a.id
            WHERE n.id = @noteId AND a.user_id = @userId AND n.is_deleted = 0
        `, { noteId, userId, noteText });
        return result.recordset[0];
    } catch (error) {
        logger.error(`Error updating note: ${error.message}`);
        throw error;
    }
};

/**
 * Soft deletes a note.
 * @param {string} noteId - The ID of the note to delete.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<number>} The number of rows affected.
 */
const softDelete = async (noteId, userId) => {
    try {
        const result = await db.query(`
            UPDATE notes 
            SET is_deleted = 1, updated_at = GETDATE()
            FROM notes n
            JOIN applications a ON n.application_id = a.id
            WHERE n.id = @noteId AND a.user_id = @userId AND n.is_deleted = 0
        `, { noteId, userId });
        return result.rowsAffected[0];
    } catch (error) {
        logger.error(`Error soft deleting note: ${error.message}`);
        throw error;
    }
};

module.exports = {
    findAllByApplicationId,
    create,
    update,
    softDelete,
};
