-- Migration: Dynamic Review Structure with Relationship-Specific Questions
-- This updates the reviews table to support dynamic scores and weighted scoring

-- Step 1: Add new columns for dynamic review structure
ALTER TABLE reviews
  -- Add dynamic scores column (JSON object with all relationship-specific scores)
  ADD COLUMN scores JSON COMMENT 'Dynamic scores object with relationship-specific questions',
  
  -- Add would_promote column (for direct_report relationship)
  ADD COLUMN would_promote INT CHECK (would_promote BETWEEN 1 AND 4) COMMENT '1=Not yet, 2=Maybe 1-2 years, 3=Ready now, 4=Above level';

-- Step 2: Update indexes
CREATE INDEX idx_would_promote ON reviews(would_promote);

-- Step 3: Migrate existing data (if any exists with old structure)
-- This converts old individual score columns to the new scores JSON object
UPDATE reviews 
SET scores = JSON_OBJECT(
  'communication', communication_score,
  'reliability', reliability_score,
  'problem_solving', problem_solving_score,
  'teamwork', teamwork_score,
  'initiative', initiative_score
)
WHERE scores IS NULL AND communication_score IS NOT NULL;

-- Step 4: Add comments
ALTER TABLE reviews COMMENT = 'Peer reviews with dynamic relationship-specific questions and weighted scoring';

-- Note: Old columns (communication_score, reliability_score, etc.) are kept for backward compatibility
-- They can be removed in a future migration after confirming all data is migrated
