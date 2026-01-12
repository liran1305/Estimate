const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

const BATCH_SIZE = 1000;

async function createConnection() {
  return await mysql.createConnection({
    host: process.env.CLOUD_SQL_HOST,
    user: process.env.CLOUD_SQL_USER,
    password: process.env.CLOUD_SQL_PASSWORD,
    database: process.env.CLOUD_SQL_DATABASE,
    port: process.env.CLOUD_SQL_PORT || 3306,
  });
}

async function importProfiles(connection, profiles) {
  console.log(`Importing ${profiles.length} profiles...`);
  
  const profileValues = [];
  const experienceValues = [];
  const educationValues = [];
  const certificationValues = [];
  const companyConnectionValues = [];

  for (const profile of profiles) {
    if (!profile.id || !profile.name) continue;

    profileValues.push([
      profile.id,
      profile.linkedin_id || null,
      profile.linkedin_num_id || null,
      profile.name,
      profile.first_name || null,
      profile.last_name || null,
      profile.email || null,
      profile.position || null,
      profile.about || null,
      profile.city || null,
      profile.country_code || null,
      profile.location || null,
      profile.avatar || null,
      profile.banner_image || null,
      profile.current_company_id || null,
      profile.current_company_name || null,
      profile.followers || 0,
      profile.connections || 0,
      profile.default_avatar || false,
      profile.memorialized_account || false
    ]);

    if (profile.experience && Array.isArray(profile.experience)) {
      for (const exp of profile.experience) {
        if (exp.company) {
          const isCurrent = exp.end_date === 'Present' || !exp.end_date;
          
          experienceValues.push([
            profile.id,
            exp.company,
            exp.company_id || null,
            exp.title || null,
            exp.description || null,
            exp.start_date || null,
            exp.end_date || null,
            exp.location || null,
            exp.duration || null,
            isCurrent
          ]);

          companyConnectionValues.push([
            profile.id,
            exp.company,
            exp.company_id || null,
            exp.start_date || null,
            exp.end_date || null,
            isCurrent
          ]);
        }

        if (exp.positions && Array.isArray(exp.positions)) {
          for (const pos of exp.positions) {
            const isCurrent = pos.end_date === 'Present' || !pos.end_date;
            
            experienceValues.push([
              profile.id,
              exp.company,
              exp.company_id || null,
              pos.title || null,
              pos.description || null,
              pos.start_date || null,
              pos.end_date || null,
              pos.location || null,
              pos.meta || null,
              isCurrent
            ]);
          }
        }
      }
    }

    if (profile.education && Array.isArray(profile.education)) {
      for (const edu of profile.education) {
        if (edu.title) {
          educationValues.push([
            profile.id,
            edu.title,
            edu.degree || null,
            edu.field || null,
            edu.start_year || null,
            edu.end_year || null,
            edu.description || null
          ]);
        }
      }
    }

    if (profile.certifications && Array.isArray(profile.certifications)) {
      for (const cert of profile.certifications) {
        if (cert.title) {
          certificationValues.push([
            profile.id,
            cert.title,
            cert.subtitle || null,
            cert.credential_id || null,
            cert.credential_url || null
          ]);
        }
      }
    }
  }

  if (profileValues.length > 0) {
    const profileSql = `
      INSERT INTO linkedin_profiles 
      (id, linkedin_id, linkedin_num_id, name, first_name, last_name, email, position, about, 
       city, country_code, location, avatar, banner_image, current_company_id, current_company_name, 
       followers, connections, default_avatar, memorialized_account)
      VALUES ?
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        position = VALUES(position),
        current_company_name = VALUES(current_company_name),
        updated_at = CURRENT_TIMESTAMP
    `;
    await connection.query(profileSql, [profileValues]);
    console.log(`✓ Inserted ${profileValues.length} profiles`);
  }

  if (experienceValues.length > 0) {
    const expSql = `
      INSERT IGNORE INTO work_experience 
      (profile_id, company, company_id, title, description, start_date, end_date, location, duration, is_current)
      VALUES ?
    `;
    await connection.query(expSql, [experienceValues]);
    console.log(`✓ Inserted ${experienceValues.length} work experiences`);
  }

  if (educationValues.length > 0) {
    const eduSql = `
      INSERT IGNORE INTO education 
      (profile_id, title, degree, field, start_year, end_year, description)
      VALUES ?
    `;
    await connection.query(eduSql, [educationValues]);
    console.log(`✓ Inserted ${educationValues.length} education records`);
  }

  if (certificationValues.length > 0) {
    const certSql = `
      INSERT IGNORE INTO certifications 
      (profile_id, title, subtitle, credential_id, credential_url)
      VALUES ?
    `;
    await connection.query(certSql, [certificationValues]);
    console.log(`✓ Inserted ${certificationValues.length} certifications`);
  }

  if (companyConnectionValues.length > 0) {
    const companySql = `
      INSERT IGNORE INTO company_connections 
      (profile_id, company_name, company_id, worked_from, worked_to, is_current)
      VALUES ?
    `;
    await connection.query(companySql, [companyConnectionValues]);
    console.log(`✓ Inserted ${companyConnectionValues.length} company connections`);
  }
}

async function main() {
  const jsonFilePath = process.argv[2] || '/Users/lirannaim/Downloads/LinkedIn people profiles (1).json';
  
  console.log('🚀 Starting LinkedIn data import...');
  console.log(`📁 Reading file: ${jsonFilePath}`);

  const fileContent = await fs.readFile(jsonFilePath, 'utf8');
  const profiles = JSON.parse(fileContent);
  
  console.log(`📊 Found ${profiles.length} profiles to import`);

  const connection = await createConnection();
  console.log('✓ Connected to Cloud SQL');

  const schemaPath = path.join(__dirname, '../database/schema.sql');
  const schemaSql = await fs.readFile(schemaPath, 'utf8');
  const statements = schemaSql.split(';').filter(stmt => stmt.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      await connection.query(statement);
    }
  }
  console.log('✓ Database schema created');

  for (let i = 0; i < profiles.length; i += BATCH_SIZE) {
    const batch = profiles.slice(i, i + BATCH_SIZE);
    console.log(`\n📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(profiles.length / BATCH_SIZE)}`);
    await importProfiles(connection, batch);
  }

  await connection.end();
  console.log('\n✅ Import completed successfully!');
}

main().catch(error => {
  console.error('❌ Import failed:', error);
  process.exit(1);
});
