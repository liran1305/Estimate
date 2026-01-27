-- ============================================================================
-- SCORING SYSTEM REDESIGN MIGRATION
-- ============================================================================
-- Purpose: Migrate from numeric 1-10 sliders to behavioral assessment system
-- with 5 future-fit dimensions
-- 
-- IMPORTANT: Run this during low-traffic period
-- ============================================================================

-- Disable foreign key checks
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================================
-- 1. CREATE DIMENSION_SCORES TABLE
-- Stores aggregated dimension scores per user
-- ============================================================================
CREATE TABLE IF NOT EXISTS dimension_scores (
  id VARCHAR(36) PRIMARY KEY,
  linkedin_profile_id VARCHAR(255) NOT NULL,
  dimension VARCHAR(50) NOT NULL,
  level VARCHAR(20) NOT NULL DEFAULT 'developing',
  percentile INT DEFAULT NULL,
  review_count INT DEFAULT 0,
  raw_score DECIMAL(5,2) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_profile_dimension (linkedin_profile_id, dimension),
  INDEX idx_dimension (dimension),
  INDEX idx_level (level),
  INDEX idx_linkedin_profile (linkedin_profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 2. ADD NEW COLUMNS TO ANONYMOUS_REVIEWS
-- Note: Run each statement separately if column already exists
-- ============================================================================
ALTER TABLE anonymous_reviews 
  ADD COLUMN behavioral_answers JSON DEFAULT NULL,
  ADD COLUMN high_signal_answers JSON DEFAULT NULL,
  ADD COLUMN never_worry_about VARCHAR(200) DEFAULT NULL,
  ADD COLUMN room_to_grow VARCHAR(500) DEFAULT NULL,
  ADD COLUMN review_version INT DEFAULT 1;

-- ============================================================================
-- 3. ADD NEW COLUMNS TO USER_SCORES
-- ============================================================================
ALTER TABLE user_scores
  ADD COLUMN qualitative_badge VARCHAR(50) DEFAULT NULL,
  ADD COLUMN startup_hire_pct INT DEFAULT NULL,
  ADD COLUMN harder_job_pct INT DEFAULT NULL,
  ADD COLUMN work_again_absolutely_pct INT DEFAULT NULL,
  ADD COLUMN never_worry_about JSON DEFAULT NULL;

-- ============================================================================
-- 4. ADD NEW COLUMNS TO REVIEWS (legacy table)
-- ============================================================================
ALTER TABLE reviews
  ADD COLUMN behavioral_answers JSON DEFAULT NULL,
  ADD COLUMN high_signal_answers JSON DEFAULT NULL,
  ADD COLUMN never_worry_about VARCHAR(200) DEFAULT NULL,
  ADD COLUMN room_to_grow VARCHAR(500) DEFAULT NULL,
  ADD COLUMN review_version INT DEFAULT 1;

-- ============================================================================
-- RE-ENABLE FOREIGN KEY CHECKS
-- ============================================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this after migration to verify:
/*
DESCRIBE dimension_scores;
DESCRIBE anonymous_reviews;
DESCRIBE user_scores;
*/
