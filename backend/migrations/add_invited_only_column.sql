-- Migration: Add invited_only column to users table
-- Date: 2026-02-04
-- Purpose: Allow users without linkedin_profile_id to use platform via direct invitation links only

-- Add invited_only column to users table
ALTER TABLE users 
ADD COLUMN invited_only TINYINT(1) DEFAULT 0 AFTER can_use_platform;

-- Set invited_only = 1 for existing users without linkedin_profile_id
UPDATE users 
SET invited_only = 1 
WHERE linkedin_profile_id IS NULL;

-- Verify the migration
SELECT 
  COUNT(*) as total_users,
  SUM(CASE WHEN invited_only = 1 THEN 1 ELSE 0 END) as invited_only_users,
  SUM(CASE WHEN linkedin_profile_id IS NULL THEN 1 ELSE 0 END) as users_without_profile
FROM users;
