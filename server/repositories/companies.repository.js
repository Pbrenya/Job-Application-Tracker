const db = require('../db');
const logger = require('../logger');

/**
 * Finds all companies associated with a user.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array>} A list of company objects.
 */
const findAllByUserId = async (userId) => {
    try {
        const result = await db.query('SELECT * FROM companies WHERE user_id = @userId AND is_deleted = 0', { userId });
        return result.recordset;
    } catch (error) {
        logger.error(`Error finding companies by user ID: ${error.message}`);
        throw error;
    }
};

/**
 * Finds a single company by its ID and user ID.
 * @param {string} id - The ID of the company.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object|null>} The company object if found, otherwise null.
 */
const findById = async (id, userId) => {
    try {
        const result = await db.query('SELECT * FROM companies WHERE id = @id AND user_id = @userId AND is_deleted = 0', { id, userId });
        return result.recordset[0];
    } catch (error) {
        logger.error(`Error finding company by ID: ${error.message}`);
        throw error;
    }
};

/**
 * Creates a new company.
 * @param {object} companyData - The data for the new company.
 * @returns {Promise<object>} The newly created company object.
 */
const create = async (companyData) => {
    const { name, user_id, location, website } = companyData;
    try {
        const result = await db.query(
            'INSERT INTO companies (name, user_id, location, website) OUTPUT INSERTED.* VALUES (@name, @user_id, @location, @website)',
            { name, user_id, location, website }
        );
        return result.recordset[0];
    } catch (error) {
        logger.error(`Error creating company: ${error.message}`);
        throw error;
    }
};

/**
 * Updates an existing company.
 * @param {string} id - The ID of the company to update.
 * @param {string} userId - The ID of the user.
 * @param {object} companyData - The new data for the company.
 * @returns {Promise<object|null>} The updated company object, or null if not found.
 */
const update = async (id, userId, companyData) => {
    const { name, location, website } = companyData;
    // Build the set clause dynamically
    const setClauses = [];
    const params = { id, userId };
    if (name !== undefined) {
        setClauses.push('name = @name');
        params.name = name;
    }
    if (location !== undefined) {
        setClauses.push('location = @location');
        params.location = location;
    }
    if (website !== undefined) {
        setClauses.push('website = @website');
        params.website = website;
    }

    if (setClauses.length === 0) {
        return findById(id, userId); // No fields to update, return current state
    }

    const queryText = `
        UPDATE companies 
        SET ${setClauses.join(', ')}, updated_at = GETDATE() 
        OUTPUT INSERTED.* 
        WHERE id = @id AND user_id = @userId AND is_deleted = 0`;

    try {
        const result = await db.query(queryText, params);
        return result.recordset[0];
    } catch (error) {
        logger.error(`Error updating company: ${error.message}`);
        throw error;
    }
};

/**
 * Soft deletes a company.
 * @param {string} id - The ID of the company to delete.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<number>} The number of rows affected.
 */
const softDelete = async (id, userId) => {
    try {
        const result = await db.query('UPDATE companies SET is_deleted = 1, updated_at = GETDATE() WHERE id = @id AND user_id = @userId AND is_deleted = 0', { id, userId });
        return result.rowsAffected[0];
    } catch (error) {
        logger.error(`Error soft deleting company: ${error.message}`);
        throw error;
    }
};


module.exports = {
    findAllByUserId,
    findById,
    create,
    update,
    softDelete,
};
