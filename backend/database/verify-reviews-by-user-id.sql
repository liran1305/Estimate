-- Verify: Reviews are stored with USER_ID not LINKEDIN_PROFILE_ID

-- Check Yaakov's reviews using his USER_ID
SELECT 'Yaakov by user_id' as check_type, COUNT(*) as count, GROUP_CONCAT(id) as review_ids
FROM reviews 
WHERE reviewee_id = '12cf9252-aad7-4b4d-ca57-20536353b4cf';

-- Check Neta's reviews using her USER_ID  
SELECT 'Neta by user_id' as check_type, COUNT(*) as count, GROUP_CONCAT(id) as review_ids
FROM reviews 
WHERE reviewee_id = '2cf8e3d5-8089-4a34-8532-2780c29e37d3';

-- Check Sergey's reviews using his USER_ID
SELECT 'Sergey by user_id' as check_type, COUNT(*) as count, GROUP_CONCAT(id) as review_ids
FROM reviews 
WHERE reviewee_id = 'ed8f4e47-5039-44e4-8759-531a8762c2c9';

-- Get the actual review details
SELECT 
  r.id,
  r.reviewee_id,
  u.name as reviewee_name,
  r.overall_score,
  r.created_at
FROM reviews r
JOIN users u ON r.reviewee_id = u.id
WHERE r.reviewee_id IN (
  '12cf9252-aad7-4b4d-ca57-20536353b4cf',  -- Yaakov
  '3cee382f-4dc4-409e-9ca2-7d13e43f15e10', -- Neta
  'ed8f4e47-5039-44e4-8759-531a8762c2c9'   -- Sergey
)
ORDER BY r.created_at DESC;
