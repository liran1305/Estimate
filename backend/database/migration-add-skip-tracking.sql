-- Migration: Add skip tracking for profiles
-- This allows profiles to be shown again after first skip, but not after second skip

-- Add skip_count column to review_assignments
ALTER TABLE review_assignments 
ADD COLUMN skip_count INT DEFAULT 0 AFTER status;

-- Create index for efficient querying
CREATE INDEX idx_skip_count ON review_assignments(user_id, colleague_id, skip_count);

-- Update existing skipped assignments to have skip_count = 1
UPDATE review_assignments 
SET skip_count = 1 
WHERE status = 'skipped';
