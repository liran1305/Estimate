-- Performance indexes for colleague matching queries
-- Run this on Cloud SQL to speed up queries

-- Composite index for finding colleagues by company name (most important)
CREATE INDEX IF NOT EXISTS idx_cc_company_profile 
ON company_connections(company_name, profile_id, is_current);

-- Index for ordering by is_current and worked_to
CREATE INDEX IF NOT EXISTS idx_cc_profile_current_date 
ON company_connections(profile_id, is_current DESC, worked_to DESC);

-- Verify indexes
SHOW INDEX FROM company_connections;
