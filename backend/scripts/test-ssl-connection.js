/**
 * Test SSL Database Connection
 * Run: node backend/scripts/test-ssl-connection.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('Testing SSL connection to Google Cloud SQL...\n');
  
  const config = {
    host: process.env.CLOUD_SQL_HOST,
    user: process.env.CLOUD_SQL_USER,
    password: process.env.CLOUD_SQL_PASSWORD,
    database: process.env.CLOUD_SQL_DATABASE,
    port: process.env.CLOUD_SQL_PORT || 3306,
    ssl: { rejectUnauthorized: false }
  };

  console.log('Connection config:');
  console.log('  Host:', config.host);
  console.log('  User:', config.user);
  console.log('  Database:', config.database);
  console.log('  Port:', config.port);
  console.log('  SSL:', 'enabled');
  console.log('');

  try {
    const connection = await mysql.createConnection(config);
    console.log('✅ Connection successful!\n');

    // Test a simple query
    const [rows] = await connection.query('SELECT COUNT(*) as count FROM users');
    console.log('✅ Query test passed - Users count:', rows[0].count);

    // Check SSL status
    const [sslStatus] = await connection.query("SHOW STATUS LIKE 'Ssl_cipher'");
    console.log('✅ SSL cipher:', sslStatus[0]?.Value || 'N/A');

    const [sslVersion] = await connection.query("SHOW STATUS LIKE 'Ssl_version'");
    console.log('✅ SSL version:', sslVersion[0]?.Value || 'N/A');

    await connection.end();
    console.log('\n✅ All tests passed! SSL connection is working.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

testConnection();
