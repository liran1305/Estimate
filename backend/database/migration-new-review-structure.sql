-- Migration: New Review Structure (5 core skills + qualitative data)
-- This updates the reviews table to support the new UX/UI design

-- Step 1: Add new columns for the redesigned review structure
ALTER TABLE reviews
  -- Remove old rating columns (will be replaced)
  DROP COLUMN IF EXISTS technical_rating,
  DROP COLUMN IF EXISTS communication_rating,
  DROP COLUMN IF EXISTS teamwork_rating,
  DROP COLUMN IF EXISTS leadership_rating,
  
  -- Add new 5 core skill ratings (1-10 scale)
  ADD COLUMN communication_score INT CHECK (communication_score BETWEEN 1 AND 10) COMMENT 'Clear, effective communication',
  ADD COLUMN reliability_score INT CHECK (reliability_score BETWEEN 1 AND 10) COMMENT 'Delivers on commitments',
  ADD COLUMN problem_solving_score INT CHECK (problem_solving_score BETWEEN 1 AND 10) COMMENT 'Analytical thinking and solutions',
  ADD COLUMN teamwork_score INT CHECK (teamwork_score BETWEEN 1 AND 10) COMMENT 'Works well with others',
  ADD COLUMN initiative_score INT CHECK (initiative_score BETWEEN 1 AND 10) COMMENT 'Takes action without being asked',
  
  -- Add qualitative data fields
  ADD COLUMN strength_tags JSON COMMENT 'Array of up to 3 selected strength tags',
  ADD COLUMN would_work_again INT CHECK (would_work_again BETWEEN 1 AND 5) COMMENT '1=Prefer not, 2=Maybe, 3=Sure, 4=Gladly, 5=Absolutely',
  ADD COLUMN optional_comment TEXT COMMENT 'One sentence about working with this person',
  
  -- Add overall score (calculated from the 5 core skills)
  ADD COLUMN overall_score DECIMAL(3,1) CHECK (overall_score BETWEEN 1.0 AND 10.0) COMMENT 'Average of 5 core skills',
  
  -- Add metadata
  ADD COLUMN initiative_na BOOLEAN DEFAULT FALSE COMMENT 'User marked Initiative as N/A';

-- Step 2: Update indexes for new columns
CREATE INDEX idx_would_work_again ON reviews(would_work_again);
CREATE INDEX idx_overall_score ON reviews(overall_score);

-- Step 3: Add comments to clarify the new structure
ALTER TABLE reviews COMMENT = 'Peer reviews with 5 core skills (1-10), strength tags, and work-again rating (1-5)';
