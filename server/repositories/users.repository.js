const { randomUUID } = require('crypto');
const db = require('../db');
const logger = require('../logger');

/**
 * Finds a user by their email address.
 * @param {string} email - The email of the user to find.
 * @returns {Promise<object|null>} The user object if found, otherwise null.
 */
const findByEmail = async (email) => {
    try {
        const result = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        return result.recordset[0];
    } catch (error) {
        logger.error(`Error finding user by email: ${error.message}`);
        throw error;
    }
};

/**
 * Creates a new user.
 * @param {string} email - The user's email.
 * @param {string} password_hash - The user's hashed password.
 * @returns {Promise<object>} The newly created user object.
 */
const create = async (email, password_hash) => {
    try {
        const id = randomUUID();
        await db.query(
            `INSERT INTO users (id, email, password_hash, created_at, updated_at)
             VALUES (?, ?, ?, NOW(), NOW())`,
            [id, email, password_hash]
        );
        const result = await db.query(
            'SELECT id, email, created_at, updated_at FROM users WHERE id = ?',
            [id]
        );
        return result.recordset[0];
    } catch (error) {
        logger.error(`Error creating user: ${error.message}`);
        throw error;
    }
};

module.exports = {
    findByEmail,
    create,
};
