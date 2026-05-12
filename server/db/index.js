const mysql = require('mysql2/promise');
const logger = require('../logger');

const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

const config = {
    host: process.env.DB_SERVER || 'localhost',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
};

let pool = null;

const connect = async () => {
    if (pool) {
        return pool;
    }
    try {
        if (!config.host || !config.user || !config.database) {
            throw new Error('Database configuration is incomplete. Make sure DB_SERVER, DB_USER, and DB_DATABASE are set.');
        }
        pool = mysql.createPool(config);
        logger.info('Database connection pool created.');
        return pool;
    } catch (err) {
        logger.error(`Database Connection Failed: ${err.message}`);
        throw err;
    }
};

const query = async (text, params = []) => {
    if (!pool) {
        await connect();
    }
    const [rows] = await pool.query(text, params);
    const rowsAffected = Array.isArray(rows) ? 0 : rows?.affectedRows ?? 0;
    return {
        recordset: Array.isArray(rows) ? rows : [],
        rowsAffected: [rowsAffected],
    };
};

module.exports = {
    query,
    connect,
    disconnect: async () => {
        if (pool) {
            await pool.end();
            pool = null;
        }
    },
};
