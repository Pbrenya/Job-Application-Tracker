const { randomUUID } = require('crypto');
const db = require('../db');
const logger = require('../logger');

const applicationRepository = {
    findAllByUserId: async (userId) => {
        try {
            const result = await db.query(
                'SELECT * FROM applications WHERE user_id = ? AND deleted_at IS NULL',
                [userId]
            );
            return result.recordset;
        } catch (err) {
            logger.error(err.message);
            throw err;
        }
    },

    create: async (applicationData) => {
        const { user_id, company_id, job_title, description, applied_at, stage_id, salary_min, salary_max, job_url, resume_path } = applicationData;
        try {
            const id = randomUUID();
            await db.query(
                `INSERT INTO applications (
                    id,
                    user_id,
                    company_id,
                    job_title,
                    description,
                    applied_at,
                    stage_id,
                    salary_min,
                    salary_max,
                    job_url,
                    resume_path,
                    created_at,
                    updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    id,
                    user_id,
                    company_id,
                    job_title,
                    description ?? null,
                    applied_at ?? null,
                    stage_id,
                    salary_min ?? null,
                    salary_max ?? null,
                    job_url ?? null,
                    resume_path ?? null,
                ]
            );
            const result = await db.query(
                'SELECT * FROM applications WHERE id = ? AND user_id = ?',
                [id, user_id]
            );
            return result.recordset[0];
        } catch (err) {
            logger.error(err.message);
            throw err;
        }
    },

    findById: async (id, userId) => {
        try {
            const result = await db.query(
                'SELECT * FROM applications WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
                [id, userId]
            );
            return result.recordset[0];
        } catch (err) {
            logger.error(err.message);
            throw err;
        }
    },

    update: async (id, userId, applicationData) => {
        const { company_id, job_title, description, applied_at, stage_id, salary_min, salary_max, job_url, resume_path } = applicationData;
        
        const setClauses = [];
        const values = [];

        if (company_id !== undefined) {
            setClauses.push('company_id = ?');
            values.push(company_id);
        }
        if (job_title !== undefined) {
            setClauses.push('job_title = ?');
            values.push(job_title);
        }
        if (description !== undefined) {
            setClauses.push('description = ?');
            values.push(description);
        }
        if (applied_at !== undefined) {
            setClauses.push('applied_at = ?');
            values.push(applied_at);
        }
        if (stage_id !== undefined) {
            setClauses.push('stage_id = ?');
            values.push(stage_id);
        }
        if (salary_min !== undefined) {
            setClauses.push('salary_min = ?');
            values.push(salary_min);
        }
        if (salary_max !== undefined) {
            setClauses.push('salary_max = ?');
            values.push(salary_max);
        }
        if (job_url !== undefined) {
            setClauses.push('job_url = ?');
            values.push(job_url);
        }
        if (resume_path !== undefined) {
            setClauses.push('resume_path = ?');
            values.push(resume_path);
        }

        if (setClauses.length === 0) {
            // Nothing to update
            return this.findById(id, userId);
        }

        const query = `UPDATE applications
                       SET ${setClauses.join(', ')}, updated_at = NOW()
                       WHERE id = ? AND user_id = ? AND deleted_at IS NULL`;

        try {
            await db.query(query, [...values, id, userId]);
            return this.findById(id, userId);
        } catch (err) {
            logger.error(err.message);
            throw err;
        }
    },

    softDelete: async (id, userId) => {
        try {
            const result = await db.query(
                'UPDATE applications SET deleted_at = NOW() WHERE id = ? AND user_id = ? AND deleted_at IS NULL',
                [id, userId]
            );
            return result.rowsAffected[0];
        } catch (err) {
            logger.error(err.message);
            throw err;
        }
    }
};

module.exports = applicationRepository;
