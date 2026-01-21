-- FULL DATA INVESTIGATION: Score Calculation Issues
-- Users with 3+ reviews_given and 1+ reviews_received should have overall_score calculated

-- 1. Get all users who SHOULD have scores (gave 3+, received 1+) but have NULL
SELECT 
  u.id as user_id,
  u.name,
  u.email,
  us.reviews_given,
  us.reviews_received,
  us.score_unlocked,
  us.overall_score,
  lp.id as linkedin_profile_id
FROM users u
LEFT JOIN user_scores us ON us.user_id = u.id
LEFT JOIN linkedin_profiles lp ON u.linkedin_profile_id = lp.id
WHERE us.reviews_given >= 3 
  AND us.reviews_received >= 1
  AND us.overall_score IS NULL
ORDER BY us.reviews_received DESC;

-- 2. For each user above, check if they have ACTUAL review records
-- Check Yaakov's actual reviews
SELECT 'Yaakov reviews' as check_type, COUNT(*) as count
FROM reviews WHERE reviewee_id = 'yaakov-eidan-1992752221'
UNION ALL
SELECT 'Yaakov anonymous_reviews', COUNT(*)
FROM anonymous_reviews WHERE reviewee_id = 'yaakov-eidan-1992752221';

-- Check Neta's actual reviews
SELECT 'Neta reviews' as check_type, COUNT(*) as count
FROM reviews WHERE reviewee_id = 'neta-gland-0'
UNION ALL
SELECT 'Neta anonymous_reviews', COUNT(*)
FROM anonymous_reviews WHERE reviewee_id = 'neta-gland-0';

-- Check Sergey's actual reviews
SELECT 'Sergey reviews' as check_type, COUNT(*) as count
FROM reviews WHERE reviewee_id = 'sergey-mirov-0'
UNION ALL
SELECT 'Sergey anonymous_reviews', COUNT(*)
FROM anonymous_reviews WHERE reviewee_id = 'sergey-mirov-0';

-- 3. Check if reviews_received counts match actual review records for ALL users
SELECT 
  u.name,
  us.reviews_received as counted_in_user_scores,
  (SELECT COUNT(*) FROM reviews WHERE reviewee_id COLLATE utf8mb4_unicode_ci = lp.id COLLATE utf8mb4_unicode_ci) as actual_reviews,
  (SELECT COUNT(*) FROM anonymous_reviews WHERE reviewee_id COLLATE utf8mb4_unicode_ci = lp.id COLLATE utf8mb4_unicode_ci) as actual_anonymous_reviews,
  (SELECT COUNT(*) FROM reviews WHERE reviewee_id COLLATE utf8mb4_unicode_ci = lp.id COLLATE utf8mb4_unicode_ci) + 
  (SELECT COUNT(*) FROM anonymous_reviews WHERE reviewee_id COLLATE utf8mb4_unicode_ci = lp.id COLLATE utf8mb4_unicode_ci) as total_actual_reviews
FROM users u
LEFT JOIN user_scores us ON us.user_id = u.id
LEFT JOIN linkedin_profiles lp ON u.linkedin_profile_id = lp.id
WHERE us.reviews_received > 0
ORDER BY us.reviews_received DESC;

-- 4. Find the root cause: Check when scores were last calculated
SELECT 
  user_id,
  overall_score,
  reviews_received,
  updated_at as last_score_update
FROM user_scores
WHERE reviews_received > 0
ORDER BY updated_at DESC;
