const sql = require('mssql');
const logger = require('../logger');

const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 1433;

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || 'localhost', // Provide a default for testing
    database: process.env.DB_DATABASE,
    port,
    options: {
        encrypt: process.env.NODE_ENV === 'production',
        trustServerCertificate: true // Use true for local development
    }
};

let pool = null;

const connect = async () => {
    if (pool) {
        return pool;
    }
    try {
        // Check if required config values are present
        if (!config.server || !config.user || !config.database) {
            throw new Error('Database configuration is incomplete. Make sure DB_SERVER, DB_USER, and DB_DATABASE are set.');
        }
        pool = await new sql.ConnectionPool(config).connect();
        logger.info('Database connection successful!');
        return pool;
    } catch (err) {
        logger.error('Database Connection Failed! Bad Config: ', err.message);
        // Don't exit the process, let the app handle the error
        throw err;
    }
};

const query = async (text, params) => {
    if (!pool) {
        await connect();
    }
    return pool.query(text, params);
};

module.exports = {
    query,
    connect,
    // Add a disconnect function for graceful shutdown in tests
    disconnect: async () => {
        if (pool) {
            await pool.close();
            pool = null;
        }
    }
};
