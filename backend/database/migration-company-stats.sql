-- ============================================================================
-- MIGRATION: Per-Company Skip System
-- ============================================================================
-- This migration:
-- 1. Populates companies table with employee counts from company_connections
-- 2. Calculates initial skip allowance per company
-- 3. Creates user_company_skips table for tracking per-company skip usage
-- ============================================================================

-- Step 1: Add columns to companies table if they don't exist
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS employees_in_db INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_employees_in_db INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS skip_allowance INT DEFAULT 3,
ADD COLUMN IF NOT EXISTS daily_refresh INT DEFAULT 3;

-- Step 2: Create user_company_skips table for per-company skip tracking
CREATE TABLE IF NOT EXISTS user_company_skips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  initial_budget INT NOT NULL DEFAULT 3,    -- Based on company size: 3 + (employees/100), max 30
  skips_used INT DEFAULT 0,
  daily_refresh INT DEFAULT 3,              -- <1000 employees: 3, >=1000 employees: 5
  last_refresh_date DATE,                   -- Track when daily refresh was applied
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_company (user_id, company_name),
  INDEX idx_user (user_id),
  INDEX idx_company (company_name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Step 2: Create a temporary table with company stats from company_connections
CREATE TEMPORARY TABLE temp_company_stats AS
SELECT 
  company_name,
  COUNT(DISTINCT profile_id) as total_employees,
  COUNT(DISTINCT CASE WHEN is_current = TRUE THEN profile_id END) as current_employees
FROM company_connections
WHERE company_name NOT IN ('Self-employed', 'Self employed', 'Freelance', 'Freelancer', 'Independent Consultant', 'Consultant', 'Independent')
  AND company_name NOT IN ('Israel Defense Forces', 'Israeli Air Force', 'I.D.F', 'IDF', 'Israeli Military Intelligence', 'Israeli Military Intelligence - Unit 8200', 'IAF - Israeli Air Force', 'Unit 8200 - Israeli Intelligence Corps', 'IDF - Israel Defense Forces', 'Israel Defense Forces - Military Intelligence')
  AND company_name NOT REGEXP '^\\*+( \\*+)*$'
  AND LENGTH(company_name) >= 2
GROUP BY company_name;

-- Step 3: Insert new companies that don't exist yet
INSERT INTO companies (id, name, employees_in_db, current_employees_in_db)
SELECT 
  LOWER(REPLACE(REPLACE(REPLACE(company_name, ' ', '-'), '.', ''), ',', '')) as id,
  company_name as name,
  total_employees,
  current_employees
FROM temp_company_stats t
WHERE NOT EXISTS (
  SELECT 1 FROM companies c WHERE c.name = t.company_name
)
ON DUPLICATE KEY UPDATE
  employees_in_db = VALUES(employees_in_db),
  current_employees_in_db = VALUES(current_employees_in_db);

-- Step 4: Update existing companies with employee counts
UPDATE companies c
JOIN temp_company_stats t ON c.name = t.company_name
SET 
  c.employees_in_db = t.total_employees,
  c.current_employees_in_db = t.current_employees;

-- Step 5: Calculate skip allowance and daily refresh based on employee count
-- Initial Skip Allowance: 3 base + 1 skip per 100 employees, max 30 skips
-- Daily Refresh: <1000 employees = +3 skips, >=1000 employees = +5 skips
UPDATE companies
SET 
  skip_allowance = LEAST(3 + FLOOR(employees_in_db / 100), 30),
  daily_refresh = CASE WHEN employees_in_db >= 1000 THEN 5 ELSE 3 END
WHERE employees_in_db > 0;

-- Step 6: Drop temporary table
DROP TEMPORARY TABLE IF EXISTS temp_company_stats;

-- Step 7: Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_companies_employees ON companies(employees_in_db);
CREATE INDEX IF NOT EXISTS idx_companies_skip_allowance ON companies(skip_allowance);

-- Verify results - Show skip allowance and daily refresh distribution
SELECT 
  skip_allowance,
  daily_refresh,
  COUNT(*) as company_count,
  MIN(employees_in_db) as min_employees,
  MAX(employees_in_db) as max_employees
FROM companies
WHERE employees_in_db > 0
GROUP BY skip_allowance, daily_refresh
ORDER BY skip_allowance;
