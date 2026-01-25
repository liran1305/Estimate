/**
 * Centralized Database Configuration with SSL Support
 * 
 * All database connections should use this shared configuration
 * to ensure consistent SSL settings across the application.
 */

const mysql = require('mysql2/promise');

// SSL configuration for Google Cloud SQL
const sslConfig = {
  // Google Cloud SQL requires SSL but doesn't need client certificates
  // when "Allow only SSL connections" is enabled (not "Require trusted client certificates")
  rejectUnauthorized: false // Set to true if using client certificates
};

// Shared database configuration
const dbConfig = {
  host: process.env.CLOUD_SQL_HOST,
  user: process.env.CLOUD_SQL_USER,
  password: process.env.CLOUD_SQL_PASSWORD,
  database: process.env.CLOUD_SQL_DATABASE,
  port: process.env.CLOUD_SQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: sslConfig
};

let sharedPool = null;

/**
 * Get the shared database connection pool
 * Uses singleton pattern to reuse connections
 */
function getPool() {
  if (!sharedPool) {
    sharedPool = mysql.createPool(dbConfig);
    console.log('[DB] Created connection pool with SSL enabled');
  }
  return sharedPool;
}

/**
 * Create a single database connection
 * Use for one-off queries or scripts
 */
async function createConnection() {
  const connection = await mysql.createConnection({
    ...dbConfig,
    // Remove pool-specific options for single connection
    waitForConnections: undefined,
    connectionLimit: undefined
  });
  return connection;
}

/**
 * Get the database configuration object
 * For use in files that create their own pools
 */
function getDbConfig() {
  return { ...dbConfig };
}

module.exports = {
  getPool,
  createConnection,
  getDbConfig,
  dbConfig
};
