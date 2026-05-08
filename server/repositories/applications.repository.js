const { poolPromise, sql } = require('../db');
const logger = require('../logger');

const applicationRepository = {
    findAllByUserId: async (userId) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.UniqueIdentifier, userId)
                .query('SELECT * FROM applications WHERE user_id = @user_id AND deleted_at IS NULL');
            return result.recordset;
        } catch (err) {
            logger.error(err.message);
            throw err;
        }
    },

    create: async (applicationData) => {
        const { user_id, company_id, job_title, description, applied_at, stage_id, salary_min, salary_max, job_url } = applicationData;
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('user_id', sql.UniqueIdentifier, user_id)
                .input('company_id', sql.UniqueIdentifier, company_id)
                .input('job_title', sql.NVarChar, job_title)
                .input('description', sql.NVarChar, description)
                .input('applied_at', sql.Date, applied_at)
                .input('stage_id', sql.Int, stage_id)
                .input('salary_min', sql.Int, salary_min)
                .input('salary_max', sql.Int, salary_max)
                .input('job_url', sql.NVarChar, job_url)
                .query(`INSERT INTO applications (user_id, company_id, job_title, description, applied_at, stage_id, salary_min, salary_max, job_url) 
                        OUTPUT INSERTED.*
                        VALUES (@user_id, @company_id, @job_title, @description, @applied_at, @stage_id, @salary_min, @salary_max, @job_url)`);
            return result.recordset[0];
        } catch (err) {
            logger.error(err.message);
            throw err;
        }
    },

    findById: async (id, userId) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('id', sql.UniqueIdentifier, id)
                .input('user_id', sql.UniqueIdentifier, userId)
                .query('SELECT * FROM applications WHERE id = @id AND user_id = @user_id AND deleted_at IS NULL');
            return result.recordset[0];
        } catch (err) {
            logger.error(err.message);
            throw err;
        }
    },

    update: async (id, userId, applicationData) => {
        const { company_id, job_title, description, applied_at, stage_id, salary_min, salary_max, job_url } = applicationData;
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('id', sql.UniqueIdentifier, id)
                .input('user_id', sql.UniqueIdentifier, userId)
                .input('company_id', sql.UniqueIdentifier, company_id)
                .input('job_title', sql.NVarChar, job_title)
                .input('description', sql.NVarChar, description)
                .input('applied_at', sql.Date, applied_at)
                .input('stage_id', sql.Int, stage_id)
                .input('salary_min', sql.Int, salary_min)
                .input('salary_max', sql.Int, salary_max)
                .input('job_url', sql.NVarChar, job_url)
                .query(`UPDATE applications 
                        SET company_id = @company_id, job_title = @job_title, description = @description, applied_at = @applied_at, stage_id = @stage_id, salary_min = @salary_min, salary_max = @salary_max, job_url = @job_url
                        OUTPUT INSERTED.*
                        WHERE id = @id AND user_id = @user_id AND deleted_at IS NULL`);
            return result.recordset[0];
        } catch (err) {
            logger.error(err.message);
            throw err;
        }
    },

    softDelete: async (id, userId) => {
        try {
            const pool = await poolPromise;
            const result = await pool.request()
                .input('id', sql.UniqueIdentifier, id)
                .input('user_id', sql.UniqueIdentifier, userId)
                .query('UPDATE applications SET deleted_at = GETDATE() WHERE id = @id AND user_id = @user_id');
            return result.rowsAffected[0];
        } catch (err) {
            logger.error(err.message);
            throw err;
        }
    }
};

module.exports = applicationRepository;
