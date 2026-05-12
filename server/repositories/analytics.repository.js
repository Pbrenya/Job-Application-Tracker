const db = require('../db');
const logger = require('../logger');

const analyticsRepository = {
    getStats: async (userId) => {
        try {
            const totalApplicationsResult = await db.query(
                'SELECT COUNT(*) as total FROM applications WHERE user_id = ? AND deleted_at IS NULL',
                [userId]
            );

            const applicationsByStageResult = await db.query(
                `
                SELECT s.name, COUNT(a.id) as count
                FROM stages s
                LEFT JOIN applications a ON s.id = a.stage_id AND a.user_id = ? AND a.deleted_at IS NULL
                GROUP BY s.id, s.name
                ORDER BY s.id
            `,
                [userId]
            );

            const applicationsByCompanyResult = await db.query(
                `
                SELECT c.name, COUNT(a.id) as count
                FROM companies c
                JOIN applications a ON c.id = a.company_id
                WHERE a.user_id = ? AND a.deleted_at IS NULL AND c.is_deleted = 0
                GROUP BY c.id, c.name
                ORDER BY count DESC
            `,
                [userId]
            );

            const applicationsOverTimeResult = await db.query(
                `
                SELECT DATE_FORMAT(applied_at, '%Y-%m') as month, COUNT(id) as count
                FROM applications
                WHERE user_id = ? AND deleted_at IS NULL AND applied_at IS NOT NULL
                GROUP BY DATE_FORMAT(applied_at, '%Y-%m')
                ORDER BY month
            `,
                [userId]
            );

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
