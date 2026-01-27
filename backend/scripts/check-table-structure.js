const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkStructure() {
  const connection = await mysql.createConnection({
    host: process.env.CLOUD_SQL_HOST,
    user: process.env.CLOUD_SQL_USER,
    password: process.env.CLOUD_SQL_PASSWORD,
    database: process.env.CLOUD_SQL_DATABASE,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const [columns] = await connection.query('DESCRIBE anonymous_reviews');
    console.log('\n=== anonymous_reviews table structure ===\n');
    columns.forEach(col => {
      console.log(`${col.Field.padEnd(30)} ${col.Type.padEnd(30)} ${col.Null} ${col.Key} ${col.Default || ''}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await connection.end();
  }
}

checkStructure();
