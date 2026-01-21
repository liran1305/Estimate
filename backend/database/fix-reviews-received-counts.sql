-- FIX DATA INCONSISTENCY: Sync reviews_received counts with actual review records
-- This will reset counts for users who have reviews_received > 0 but no actual reviews

-- 1. First, let's see the current state
SELECT 
  'BEFORE FIX' as status,
  u.name,
  us.reviews_received as counted,
  (SELECT COUNT(*) FROM reviews WHERE reviewee_id = u.id) as actual
FROM users u
JOIN user_scores us ON us.user_id = u.id
WHERE us.reviews_received > 0;

-- 2. Reset reviews_received to actual count for all users
UPDATE user_scores us
SET 
  reviews_received = (
    SELECT COUNT(*) 
    FROM reviews r 
    WHERE r.reviewee_id = us.user_id
  ),
  overall_score = CASE 
    WHEN (SELECT COUNT(*) FROM reviews r WHERE r.reviewee_id = us.user_id) = 0 
    THEN NULL 
    ELSE overall_score 
  END
WHERE us.reviews_received > 0;

-- 3. Verify the fix
SELECT 
  'AFTER FIX' as status,
  u.name,
  us.reviews_received as counted,
  (SELECT COUNT(*) FROM reviews WHERE reviewee_id = u.id) as actual,
  us.overall_score
FROM users u
JOIN user_scores us ON us.user_id = u.id
WHERE us.reviews_received >= 0
ORDER BY us.reviews_received DESC;
