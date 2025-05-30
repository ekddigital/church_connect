const mysql = require('mysql2/promise');

// Database connection pool for better performance
let pool = null;

function createPool() {
    if (!pool) {
        pool = mysql.createPool({
            uri: process.env.DATABASE_URL,
            connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10'),
            ssl: process.env.DATABASE_URL.includes('ssl=true') ? {
                rejectUnauthorized: false
            } : false,
            reconnect: true,
            idleTimeout: 300000,
            dateStrings: true
        });
    }
    return pool;
}

// Get database connection
async function getConnection() {
    const pool = createPool();
    return await pool.getConnection();
}

// Execute query with automatic connection management
async function query(sql, params = []) {
    const connection = await getConnection();
    try {
        const [rows] = await connection.execute(sql, params);
        return rows;
    } finally {
        connection.release();
    }
}

// Execute transaction
async function transaction(callback) {
    const connection = await getConnection();
    try {
        await connection.beginTransaction();
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}

// Close pool (for cleanup)
async function closePool() {
    if (pool) {
        await pool.end();
        pool = null;
    }
}

module.exports = {
    query,
    transaction,
    getConnection,
    closePool
};
