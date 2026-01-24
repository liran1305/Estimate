-- ============================================================================
-- MANUAL USER ADDITION SCRIPT
-- ============================================================================
-- Use this script when manually adding a user who signed in via OAuth but
-- wasn't found in the system. This ensures all necessary records are created.
--
-- INSTRUCTIONS:
-- 1. Replace the placeholder values with actual user data
-- 2. Run each section in order
-- 3. Verify the user appears in analytics after completion
-- ============================================================================

-- STEP 1: Add LinkedIn Profile
-- ============================================================================
INSERT INTO linkedin_profiles (
  id,                    -- LinkedIn profile ID (e.g., 'alex-tykhonovych')
  linkedin_num_id,       -- LinkedIn numeric ID from OAuth (e.g., 'WBAx-FQ7fy')
  name,                  -- Full name
  first_name,            -- First name
  last_name,             -- Last name
  email,                 -- Email address
  image_id,              -- Extract from profile picture URL (e.g., 'D4D03AQEkYl7Gdao9XQ')
  avatar,                -- Full profile picture URL
  current_company_name,  -- Current company name (optional)
  created_at,
  updated_at
) VALUES (
  'PROFILE_ID',          -- e.g., 'alex-tykhonovych'
  'LINKEDIN_NUM_ID',     -- e.g., 'WBAx-FQ7fy' from OAuth sub field
  'FULL_NAME',           -- e.g., 'Alex Tykhonovych'
  'FIRST_NAME',          -- e.g., 'Alex'
  'LAST_NAME',           -- e.g., 'Tykhonovych'
  'EMAIL',               -- e.g., 'alex.tykhon@gmail.com'
  'IMAGE_ID',            -- Extract from picture URL
  'AVATAR_URL',          -- Full picture URL from OAuth
  'CURRENT_COMPANY',     -- e.g., 'Discount Bank' (optional)
  NOW(),
  NOW()
);

-- STEP 2: Add Company Connections
-- ============================================================================
-- Add one row for each company the user worked at
-- Repeat this INSERT for each company in their work history

INSERT INTO company_connections (
  profile_id,
  company_name,
  company_id,            -- Optional: LinkedIn company ID
  worked_from,           -- Start date (YYYY-MM-DD)
  worked_to,             -- End date (YYYY-MM-DD) or NULL if current
  is_current,            -- 1 if currently working there, 0 if past
  created_at
) VALUES (
  'PROFILE_ID',          -- Same as linkedin_profiles.id
  'COMPANY_NAME',        -- e.g., 'Discount Bank'
  'COMPANY_ID',          -- Optional
  '2024-11-01',          -- Start date
  NULL,                  -- NULL if current job
  1,                     -- 1 = current, 0 = past
  NOW()
);

-- Example for a past company:
-- INSERT INTO company_connections (profile_id, company_name, worked_from, worked_to, is_current, created_at)
-- VALUES ('PROFILE_ID', 'Previous Company', '2020-01-01', '2024-10-31', 0, NOW());

-- STEP 3: Update User Account
-- ============================================================================
-- Link the user account to the LinkedIn profile and enable platform access

UPDATE users 
SET 
  linkedin_profile_id = 'PROFILE_ID',     -- Same as linkedin_profiles.id
  can_use_platform = 1,                   -- Enable platform access
  profile_match_method = 'manual',        -- Mark as manually added
  profile_match_confidence = 100,         -- 100% confidence (manual)
  profile_matched_at = NOW()
WHERE email = 'EMAIL';                    -- User's email address

-- STEP 4: Create User Scores Record
-- ============================================================================
-- This is REQUIRED for the user to appear in analytics

INSERT INTO user_scores (
  user_id,               -- Get from users table (UUID)
  linkedin_profile_id,   -- Same as linkedin_profiles.id
  reviews_received,
  reviews_given,
  score_unlocked,
  overall_score,
  created_at,
  updated_at
) 
SELECT 
  u.id,                  -- Get user_id from users table
  'PROFILE_ID',          -- Same as linkedin_profiles.id
  0,                     -- Start with 0 reviews received
  0,                     -- Start with 0 reviews given
  FALSE,                 -- Score not unlocked yet
  NULL,                  -- No score yet
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'EMAIL';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify everything was created correctly:

-- 1. Check LinkedIn profile exists
SELECT * FROM linkedin_profiles WHERE id = 'PROFILE_ID';

-- 2. Check company connections exist
SELECT * FROM company_connections WHERE profile_id = 'PROFILE_ID';

-- 3. Check user account is linked and enabled
SELECT id, email, linkedin_profile_id, can_use_platform, profile_match_method
FROM users WHERE email = 'EMAIL';

-- 4. Check user_scores record exists
SELECT * FROM user_scores 
WHERE linkedin_profile_id = 'PROFILE_ID';

-- 5. Verify user appears in analytics query
SELECT 
  us.user_id,
  lp.name as full_name,
  lp.current_company_name as company,
  us.reviews_given,
  us.reviews_received,
  us.score_unlocked,
  us.overall_score
FROM user_scores us
JOIN users u ON u.id = us.user_id
JOIN linkedin_profiles lp ON lp.id = u.linkedin_profile_id
WHERE u.email = 'EMAIL';

-- ============================================================================
-- EXAMPLE: Alex Tykhonovych
-- ============================================================================
-- Here's a complete example with actual values:
/*
-- 1. LinkedIn Profile
INSERT INTO linkedin_profiles (id, linkedin_num_id, name, first_name, last_name, email, image_id, avatar, current_company_name, created_at, updated_at)
VALUES ('alex-tykhonovych', 'WBAx-FQ7fy', 'Alex Tykhonovych', 'Alex', 'Tykhonovych', 'alex.tykhon@gmail.com', 'D4D03AQEkYl7Gdao9XQ', 'https://media.licdn.com/dms/image/v2/D4D03AQEkYl7Gdao9XQ/profile-displayphoto-shrink_100_100/profile-displayphoto-shrink_100_100/0/1706374799769?e=1770854400&v=beta&t=9pPzQvDJkJMUfsbXU6X_7mmZcqeDo0tU1E4L7Dgxt6I', 'Discount Bank', NOW(), NOW());

-- 2. Company Connections
INSERT INTO company_connections (profile_id, company_name, worked_from, worked_to, is_current, created_at)
VALUES ('alex-tykhonovych', 'Discount Bank', '2024-11-01', NULL, 1, NOW());

-- 3. Update User
UPDATE users 
SET linkedin_profile_id = 'alex-tykhonovych', can_use_platform = 1, profile_match_method = 'manual', profile_match_confidence = 100, profile_matched_at = NOW()
WHERE email = 'alex.tykhon@gmail.com';

-- 4. User Scores
INSERT INTO user_scores (user_id, linkedin_profile_id, reviews_received, reviews_given, score_unlocked, overall_score, created_at, updated_at)
SELECT u.id, 'alex-tykhonovych', 0, 0, FALSE, NULL, NOW(), NOW()
FROM users u WHERE u.email = 'alex.tykhon@gmail.com';
*/
