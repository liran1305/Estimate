require('dotenv').config({ path: '../.env' });
const mysql = require('mysql2/promise');

async function checkAlexData() {
  const connection = await mysql.createConnection({
    host: process.env.CLOUD_SQL_HOST,
    user: process.env.CLOUD_SQL_USER,
    password: process.env.CLOUD_SQL_PASSWORD,
    database: process.env.CLOUD_SQL_DATABASE,
    port: process.env.CLOUD_SQL_PORT || 3306,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Find Alex
    const [profiles] = await connection.query(
      "SELECT id, name FROM linkedin_profiles WHERE name LIKE '%Alex%Tykhonovych%' LIMIT 1"
    );
    
    if (profiles.length === 0) {
      console.log('❌ Alex Tykhonovych not found');
      return;
    }
    
    const alex = profiles[0];
    console.log('\n=== ALEX PROFILE ===');
    console.log('ID:', alex.id);
    console.log('Name:', alex.name);
    
    // Check his company connections with location
    console.log('\n=== ALEX WORK HISTORY (with locations) ===');
    const [companies] = await connection.query(`
      SELECT company_name, location, worked_from, worked_to, is_current 
      FROM company_connections 
      WHERE profile_id = ?
      ORDER BY is_current DESC, worked_to DESC
    `, [alex.id]);
    
    if (companies.length === 0) {
      console.log('No work history found');
    } else {
      companies.forEach(c => {
        console.log(`📍 ${c.company_name}`);
        console.log(`   Location: ${c.location || '❌ NULL'}`);
        console.log(`   Period: ${c.worked_from} - ${c.worked_to || 'Present'}`);
        console.log('');
      });
    }
    
    // Check Bank Discount colleagues with locations
    const bankDiscountCompany = companies.find(c => c.company_name.includes('Discount'));
    if (bankDiscountCompany) {
      console.log('=== BANK DISCOUNT COLLEAGUES (with locations) ===');
      const [colleagues] = await connection.query(`
        SELECT lp.name, cc.location, cc.worked_from, cc.worked_to, cc.is_current
        FROM linkedin_profiles lp
        JOIN company_connections cc ON cc.profile_id = lp.id
        WHERE cc.company_name = ?
        AND lp.id != ?
        ORDER BY cc.is_current DESC, cc.location
        LIMIT 15
      `, [bankDiscountCompany.company_name, alex.id]);
      
      if (colleagues.length === 0) {
        console.log('No colleagues found at Bank Discount');
      } else {
        console.log(`Found ${colleagues.length} colleagues:\n`);
        colleagues.forEach(c => {
          const sameLocation = c.location === bankDiscountCompany.location;
          const icon = sameLocation ? '✅' : (c.location ? '📍' : '❓');
          console.log(`${icon} ${c.name}`);
          console.log(`   Location: ${c.location || 'NULL'} ${sameLocation ? '(SAME AS ALEX!)' : ''}`);
          console.log(`   Period: ${c.worked_from} - ${c.worked_to || 'Present'}`);
          console.log('');
        });
      }
    }
    
    // Check Shufersal colleagues if exists
    const shufersalCompany = companies.find(c => c.company_name.includes('Shufersal'));
    if (shufersalCompany) {
      console.log('=== SHUFERSAL COLLEAGUES (with locations) ===');
      const [colleagues] = await connection.query(`
        SELECT lp.name, cc.location, cc.worked_from, cc.worked_to
        FROM linkedin_profiles lp
        JOIN company_connections cc ON cc.profile_id = lp.id
        WHERE cc.company_name = ?
        AND lp.id != ?
        ORDER BY cc.location
        LIMIT 15
      `, [shufersalCompany.company_name, alex.id]);
      
      console.log(`Found ${colleagues.length} colleagues:\n`);
      colleagues.forEach(c => {
        const sameLocation = c.location === shufersalCompany.location;
        const icon = sameLocation ? '✅' : (c.location ? '📍' : '❓');
        console.log(`${icon} ${c.name} | Location: ${c.location || 'NULL'} ${sameLocation ? '(SAME!)' : ''}`);
      });
    }
    
  } finally {
    await connection.end();
  }
}

checkAlexData().catch(console.error);
