const { poolPromise, sql } = require('../db');
const logger = require('../logger');

const analyticsRepository = {
    getStats: async (userId) => {
        try {
            const pool = await poolPromise;
            const request = pool.request().input('user_id', sql.UniqueIdentifier, userId);

            const totalApplicationsResult = await request.query('SELECT COUNT(*) as total FROM applications WHERE user_id = @user_id AND deleted_at IS NULL');
            
            const applicationsByStageResult = await request.query(`
                SELECT s.name, COUNT(a.id) as count
                FROM stages s
                LEFT JOIN applications a ON s.id = a.stage_id AND a.user_id = @user_id AND a.deleted_at IS NULL
                GROUP BY s.name
                ORDER BY s.id
            `);

            const applicationsByCompanyResult = await request.query(`
                SELECT c.name, COUNT(a.id) as count
                FROM companies c
                JOIN applications a ON c.id = a.company_id
                WHERE a.user_id = @user_id AND a.deleted_at IS NULL
                GROUP BY c.name
                ORDER BY count DESC
            `);

            const applicationsOverTimeResult = await request.query(`
                SELECT FORMAT(applied_at, 'yyyy-MM') as month, COUNT(id) as count
                FROM applications
                WHERE user_id = @user_id AND deleted_at IS NULL AND applied_at IS NOT NULL
                GROUP BY FORMAT(applied_at, 'yyyy-MM')
                ORDER BY month
            `);

            return {
                totalApplications: totalApplicationsResult.recordset[0].total,
                applicationsByStage: applicationsByStageResult.recordset,
                applicationsByCompany: applicationsByCompanyResult.recordset,
                applicationsOverTime: applicationsOverTimeResult.recordset
            };
        } catch (err) {
            logger.error(err.message);
            throw err;
        }
    }
};

module.exports = analyticsRepository;
