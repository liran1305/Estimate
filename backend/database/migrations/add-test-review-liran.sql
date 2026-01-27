-- Add a test review for Liran Naim to see the full profile experience
-- First, find Liran's linkedin_profile_id (run this query first to get the ID)
-- SELECT id, name FROM linkedin_profiles WHERE name LIKE '%Liran%' OR name LIKE '%liran%';

-- Replace LIRAN_PROFILE_ID with the actual ID from the query above
-- Example: If the query returns id = 'abc123', replace LIRAN_PROFILE_ID with 'abc123'

SET @liran_profile_id = (SELECT id FROM linkedin_profiles WHERE name LIKE '%Liran Naim%' LIMIT 1);

-- Insert a comprehensive test review with all the new V2 fields
INSERT INTO anonymous_reviews (
  id,
  reviewee_id,
  company_name,
  company_context,
  interaction_type,
  scores,
  strength_tags,
  would_work_again,
  would_promote,
  optional_comment,
  overall_score,
  review_weight,
  created_date,
  never_worry_about,
  room_to_grow
) VALUES (
  UUID(),
  @liran_profile_id,
  'Crawl5',
  'AI/AdTech Product',
  'peer',
  JSON_OBJECT(
    'learns_fast', 5,
    'figures_out', 5,
    'ai_ready', 5,
    'gets_buyin', 4,
    'owns_it', 5,
    'startup_hire', 5,
    'harder_job', 5
  ),
  JSON_ARRAY('Quick Learner', 'Solution-Oriented', 'Removes Blockers', 'Delivers Results', 'Accountable'),
  5,
  5,
  'Liran is an exceptional product leader. He has a rare ability to understand complex technical challenges and translate them into clear product vision. His AI expertise is top-notch, and he consistently delivers results even under pressure. Would absolutely work with him again.',
  9.5,
  1.0,
  NOW(),
  'Dropping commitments',
  'Could delegate more instead of taking everything on himself'
);

-- Add another test review from a different perspective (manager)
INSERT INTO anonymous_reviews (
  id,
  reviewee_id,
  company_name,
  company_context,
  interaction_type,
  scores,
  strength_tags,
  would_work_again,
  would_promote,
  optional_comment,
  overall_score,
  review_weight,
  created_date,
  never_worry_about,
  room_to_grow
) VALUES (
  UUID(),
  @liran_profile_id,
  'FireArc Technologies',
  'LLM-Powered Solutions',
  'manager',
  JSON_OBJECT(
    'learns_fast', 4,
    'figures_out', 5,
    'ai_ready', 5,
    'gets_buyin', 5,
    'owns_it', 4,
    'startup_hire', 5,
    'harder_job', 4
  ),
  JSON_ARRAY('Strategic Thinker', 'Quick Learner', 'Accountable', 'Solution-Oriented'),
  5,
  5,
  'One of the best product minds I have worked with. Liran brings clarity to ambiguous situations and has excellent stakeholder management skills. His understanding of AI/ML is a huge asset.',
  9.2,
  1.0,
  DATE_SUB(NOW(), INTERVAL 30 DAY),
  'Missing deadlines',
  'Sometimes moves too fast for the team to keep up'
);

-- Verify the reviews were added
SELECT 
  id, 
  reviewee_id, 
  company_name, 
  interaction_type, 
  optional_comment,
  never_worry_about,
  room_to_grow,
  created_date
FROM anonymous_reviews 
WHERE reviewee_id = @liran_profile_id
ORDER BY created_date DESC
LIMIT 5;
