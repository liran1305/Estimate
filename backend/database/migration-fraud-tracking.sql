-- Migration: Add server-side fraud/violation tracking
-- This replaces the insecure client-side localStorage approach

-- Step 1: Create user_violations table
CREATE TABLE IF NOT EXISTS user_violations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  violation_type ENUM('too_fast', 'all_identical_scores', 'all_max_scores', 'all_min_scores', 'low_variance') NOT NULL,
  review_session_id VARCHAR(255),
  time_spent_seconds INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_user_violations (user_id, created_at),
  INDEX idx_violation_type (violation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Add columns to users table (run each separately if needed)
-- Check if columns exist first by running: SHOW COLUMNS FROM users LIKE 'violation_count';

-- Add violation_count column
ALTER TABLE users ADD COLUMN violation_count INT DEFAULT 0;

-- Add last_violation_at column
ALTER TABLE users ADD COLUMN last_violation_at TIMESTAMP NULL;

-- Add locked_until column
ALTER TABLE users ADD COLUMN locked_until TIMESTAMP NULL;

-- Add index for locked_until
ALTER TABLE users ADD INDEX idx_locked_until (locked_until);

-- Note: A user is locked out if:
-- 1. locked_until is set AND locked_until > NOW()
-- 2. violation_count >= 3 within last 24 hours
