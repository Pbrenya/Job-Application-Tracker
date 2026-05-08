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
        const { user_id, company_id, job_title, description, applied_at, stage_id, salary_min, salary_max, job_url, resume_path } = applicationData;
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
                .input('resume_path', sql.NVarChar, resume_path)
                .query(`INSERT INTO applications (user_id, company_id, job_title, description, applied_at, stage_id, salary_min, salary_max, job_url, resume_path) 
                        OUTPUT INSERTED.*
                        VALUES (@user_id, @company_id, @job_title, @description, @applied_at, @stage_id, @salary_min, @salary_max, @job_url, @resume_path)`);
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
        const { company_id, job_title, description, applied_at, stage_id, salary_min, salary_max, job_url, resume_path } = applicationData;
        
        const setClauses = [];
        const request = new sql.Request();

        request.input('id', sql.UniqueIdentifier, id);
        request.input('user_id', sql.UniqueIdentifier, userId);

        if (company_id !== undefined) {
            setClauses.push('company_id = @company_id');
            request.input('company_id', sql.UniqueIdentifier, company_id);
        }
        if (job_title !== undefined) {
            setClauses.push('job_title = @job_title');
            request.input('job_title', sql.NVarChar, job_title);
        }
        if (description !== undefined) {
            setClauses.push('description = @description');
            request.input('description', sql.NVarChar, description);
        }
        if (applied_at !== undefined) {
            setClauses.push('applied_at = @applied_at');
            request.input('applied_at', sql.Date, applied_at);
        }
        if (stage_id !== undefined) {
            setClauses.push('stage_id = @stage_id');
            request.input('stage_id', sql.Int, stage_id);
        }
        if (salary_min !== undefined) {
            setClauses.push('salary_min = @salary_min');
            request.input('salary_min', sql.Int, salary_min);
        }
        if (salary_max !== undefined) {
            setClauses.push('salary_max = @salary_max');
            request.input('salary_max', sql.Int, salary_max);
        }
        if (job_url !== undefined) {
            setClauses.push('job_url = @job_url');
            request.input('job_url', sql.NVarChar, job_url);
        }
        if (resume_path !== undefined) {
            setClauses.push('resume_path = @resume_path');
            request.input('resume_path', sql.NVarChar, resume_path);
        }

        if (setClauses.length === 0) {
            // Nothing to update
            return this.findById(id, userId);
        }

        const query = `UPDATE applications 
                       SET ${setClauses.join(', ')}
                       OUTPUT INSERTED.*
                       WHERE id = @id AND user_id = @user_id AND deleted_at IS NULL`;

        try {
            const pool = await poolPromise;
            const result = await request.query(query);
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
