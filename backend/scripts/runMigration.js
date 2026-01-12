const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function runMigration() {
  console.log('🚀 Starting database migration...\n');

  const connection = await mysql.createConnection({
    host: process.env.CLOUD_SQL_HOST,
    user: process.env.CLOUD_SQL_USER,
    password: process.env.CLOUD_SQL_PASSWORD,
    database: process.env.CLOUD_SQL_DATABASE,
    port: process.env.CLOUD_SQL_PORT || 3306,
    multipleStatements: true
  });

  console.log('✓ Connected to Cloud SQL\n');

  // Read migration file
  const migrationPath = path.join(__dirname, '../database/migration-add-review-system.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  console.log('📄 Running migration: migration-add-review-system.sql\n');

  try {
    // Execute migration
    await connection.query(migrationSql);
    
    console.log('✅ Migration completed successfully!\n');

    // Verify tables created
    const [tables] = await connection.query('SHOW TABLES');
    console.log('📊 Total tables in database:', tables.length);
    console.log('\nTables:');
    tables.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log(`  - ${tableName}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

runMigration().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
