-- ============================================================================
-- COLLATION STANDARDIZATION MIGRATION
-- ============================================================================
-- Purpose: Standardize all tables and columns to utf8mb4_0900_ai_ci
-- This prevents "Illegal mix of collations" errors across the database
-- 
-- IMPORTANT: Run this during low-traffic period
-- Estimated time: 2-5 minutes depending on data volume
-- ============================================================================

-- NOTE: Database-level collation change removed - not needed for table conversions
-- The ALTER TABLE commands below will work regardless of database default collation

-- Disable foreign key checks temporarily to allow collation conversion
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 2. LINKEDIN_PROFILES TABLE
-- ============================================================================
ALTER TABLE linkedin_profiles CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 3. REVIEWS TABLE (Legacy)
-- ============================================================================
ALTER TABLE reviews CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 4. ANONYMOUS_REVIEWS TABLE
-- ============================================================================
ALTER TABLE anonymous_reviews CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 5. REVIEW_REQUESTS TABLE
-- ============================================================================
ALTER TABLE review_requests CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 6. REVIEW_SESSIONS TABLE
-- ============================================================================
ALTER TABLE review_sessions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 7. REVIEW_ASSIGNMENTS TABLE
-- ============================================================================
ALTER TABLE review_assignments CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 8. USER_SCORES TABLE
-- ============================================================================
ALTER TABLE user_scores CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 9. COMPANY_CONNECTIONS TABLE
-- ============================================================================
ALTER TABLE company_connections CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 10. COMPANIES TABLE
-- ============================================================================
ALTER TABLE companies CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 11. WORK_EXPERIENCE TABLE
-- ============================================================================
ALTER TABLE work_experience CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 12. EDUCATION TABLE
-- ============================================================================
ALTER TABLE education CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 13. SKILLS TABLE
-- ============================================================================
ALTER TABLE skills CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 14. REVIEW_TOKENS TABLE
-- ============================================================================
ALTER TABLE review_tokens CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 15. ADMIN_ACTIONS TABLE
-- ============================================================================
ALTER TABLE admin_actions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 16. FRAUD_FLAGS TABLE
-- ============================================================================
ALTER TABLE fraud_flags CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 17. USER_VIOLATIONS TABLE
-- ============================================================================
ALTER TABLE user_violations CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 18. OAUTH_TOKENS TABLE
-- ============================================================================
ALTER TABLE oauth_tokens CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 19. CERTIFICATIONS TABLE
-- ============================================================================
ALTER TABLE certifications CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 20. ANALYTICS_EVENTS TABLE
-- ============================================================================
ALTER TABLE analytics_events CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 21. NOTIFICATION_LOG TABLE
-- ============================================================================
ALTER TABLE notification_log CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 22. NOTIFICATION_QUEUE TABLE
-- ============================================================================
ALTER TABLE notification_queue CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 23. USER_COMPANY_SKIPS TABLE
-- ============================================================================
ALTER TABLE user_company_skips CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- 24. SCHEMA_VERSIONS TABLE
-- ============================================================================
ALTER TABLE schema_versions CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;

-- ============================================================================
-- RE-ENABLE FOREIGN KEY CHECKS
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this after migration to verify all tables are standardized:
/*
SELECT 
  TABLE_NAME,
  TABLE_COLLATION
FROM information_schema.TABLES
WHERE TABLE_SCHEMA = DATABASE()
ORDER BY TABLE_NAME;
*/

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================
-- To rollback to utf8mb4_unicode_ci, replace all instances above with:
-- COLLATE utf8mb4_unicode_ci
-- And remember to SET FOREIGN_KEY_CHECKS = 0 before running
-- ============================================================================
