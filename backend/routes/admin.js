const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

let pool;

async function initializePool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.CLOUD_SQL_HOST,
      user: process.env.CLOUD_SQL_USER,
      password: process.env.CLOUD_SQL_PASSWORD,
      database: process.env.CLOUD_SQL_DATABASE,
      port: process.env.CLOUD_SQL_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      multipleStatements: true
    });
  }
  return pool;
}

// Run database migration
router.post('/migrate', async (req, res) => {
  try {
    const pool = await initializePool();
    const connection = await pool.getConnection();

    // Read migration file
    const migrationPath = path.join(__dirname, '../database/migration-add-review-system.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    await connection.query(migrationSql);
    
    // Verify tables
    const [tables] = await connection.query('SHOW TABLES');
    
    connection.release();

    res.json({
      success: true,
      message: 'Migration completed successfully',
      tablesCount: tables.length,
      tables: tables.map(row => Object.values(row)[0])
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Migration failed',
      message: error.message
    });
  }
});

// List all tables
router.get('/tables', async (req, res) => {
  try {
    const pool = await initializePool();
    const connection = await pool.getConnection();
    
    const [tables] = await connection.query('SHOW TABLES');
    
    connection.release();

    res.json({
      success: true,
      count: tables.length,
      tables: tables.map(row => Object.values(row)[0])
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to list tables',
      message: error.message
    });
  }
});

// Fix profile_match_method ENUM
router.post('/fix-enum', async (req, res) => {
  try {
    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      await connection.query(`
        ALTER TABLE users 
        MODIFY COLUMN profile_match_method ENUM(
          'linkedin_id',
          'linkedin_num_id',
          'image',
          'image_multiple',
          'name',
          'email',
          'not_found'
        ) DEFAULT NULL
      `);

      connection.release();
      res.json({ success: true, message: 'ENUM updated successfully' });
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Fix ENUM error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
