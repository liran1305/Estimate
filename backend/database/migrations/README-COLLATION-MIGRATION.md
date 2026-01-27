# Database Collation Standardization Migration

## Problem
Your database has mixed collations across tables:
- Some use `utf8mb4_unicode_ci`
- Others use `utf8mb4_0900_ai_ci`

This causes **"Illegal mix of collations"** errors when:
- Joining tables with different collations
- Comparing string columns across tables
- Using WHERE clauses with mismatched collations

## Solution
Standardize **all tables and columns** to `utf8mb4_0900_ai_ci` (MySQL 8.0 default).

## Benefits
✅ **Single source of truth** - One collation across entire database  
✅ **No more collation errors** - All JOINs and comparisons work seamlessly  
✅ **Better performance** - `utf8mb4_0900_ai_ci` is faster than `utf8mb4_unicode_ci`  
✅ **Modern standard** - MySQL 8.0+ default collation  
✅ **Cleaner code** - Remove all BINARY casts and COLLATE clauses  

## Pre-Migration Checklist

### 1. Backup Database
```bash
# Connect to Google Cloud SQL and create backup
gcloud sql backups create --instance=YOUR_INSTANCE_NAME
```

### 2. Schedule Maintenance Window
- **Recommended:** During low-traffic period (e.g., 2-4 AM)
- **Duration:** 2-5 minutes depending on data volume
- **Impact:** Database will be accessible but slower during migration

### 3. Test on Staging First
If you have a staging database, run the migration there first to verify timing and impact.

## Running the Migration

### Option 1: Via Google Cloud SQL Console
1. Go to Google Cloud Console → SQL → Your Instance
2. Click **"Databases"** → Select `estimate_db`
3. Click **"Import"**
4. Upload `standardize-collations.sql`
5. Execute

### Option 2: Via MySQL Client
```bash
# Connect to your Cloud SQL instance
mysql -h YOUR_HOST -u YOUR_USER -p estimate_db

# Run the migration
source /path/to/standardize-collations.sql
```

### Option 3: Via Node.js Script
```javascript
// Run from backend directory
const mysql = require('mysql2/promise');
const fs = require('fs');

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.CLOUD_SQL_HOST,
    user: process.env.CLOUD_SQL_USER,
    password: process.env.CLOUD_SQL_PASSWORD,
    database: process.env.CLOUD_SQL_DATABASE,
    port: process.env.CLOUD_SQL_PORT || 3306,
    ssl: { rejectUnauthorized: false },
    multipleStatements: true
  });

  const sql = fs.readFileSync('./database/migrations/standardize-collations.sql', 'utf8');
  await connection.query(sql);
  console.log('✅ Migration completed successfully');
  await connection.end();
}

runMigration().catch(console.error);
```

## Verification

After migration, verify all tables are standardized:

```sql
SELECT 
  TABLE_NAME,
  TABLE_COLLATION
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = 'estimate_db'
ORDER BY TABLE_NAME;
```

**Expected result:** All tables should show `utf8mb4_0900_ai_ci`

## Post-Migration Cleanup

After successful migration, you can:

1. **Remove BINARY casts** from queries (optional cleanup):
   ```sql
   -- Before:
   JOIN users u ON BINARY u.id = BINARY rr.requester_id
   
   -- After:
   JOIN users u ON u.id = rr.requester_id
   ```

2. **Remove COLLATE clauses** from queries (already done in recent commits)

3. **Test all features** that involve:
   - Review request links
   - User authentication
   - Review submissions
   - Data validation endpoints

## Rollback Plan

If issues occur, rollback to previous collation:

```sql
-- Rollback to utf8mb4_unicode_ci
ALTER DATABASE estimate_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- ... repeat for all tables
```

Then restore from backup if needed:
```bash
gcloud sql backups restore BACKUP_ID --backup-instance=YOUR_INSTANCE
```

## FAQ

**Q: Will this affect existing data?**  
A: No, data remains unchanged. Only the collation rules for string comparisons change.

**Q: Will queries be slower during migration?**  
A: Yes, slightly. Each ALTER TABLE locks the table briefly while converting.

**Q: Can I run this on production?**  
A: Yes, but schedule during low-traffic period and have a backup ready.

**Q: What if migration fails midway?**  
A: MySQL transactions don't support DDL, so some tables may be converted. Restore from backup and retry.

**Q: Do I need to update application code?**  
A: No, the BINARY casts in recent commits will continue to work. You can optionally remove them later for cleaner code.

## Timeline

1. **Now:** Review this document
2. **Before migration:** Create database backup
3. **During maintenance window:** Run migration (2-5 min)
4. **After migration:** Verify + test features (10-15 min)
5. **Optional:** Clean up BINARY casts in code

## Support

If you encounter issues:
1. Check migration logs for specific errors
2. Verify database connection settings
3. Ensure MySQL version is 8.0+
4. Contact database administrator if needed
