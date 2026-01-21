-- DATA CONSISTENCY VALIDATION
-- Run this regularly to check if user_scores is in sync with actual reviews

-- Check 1: Users with reviews_received count mismatch
SELECT 
  'MISMATCH: reviews_received' as issue_type,
  u.name,
  u.email,
  us.reviews_received as counted_in_user_scores,
  (
    (SELECT COUNT(*) FROM reviews r WHERE r.reviewee_id COLLATE utf8mb4_unicode_ci = lp.id COLLATE utf8mb4_unicode_ci) +
    (SELECT COUNT(*) FROM anonymous_reviews ar WHERE ar.reviewee_id COLLATE utf8mb4_unicode_ci = lp.id COLLATE utf8mb4_unicode_ci)
  ) as actual_review_count,
  'NEEDS SYNC' as action_required
FROM users u
JOIN user_scores us ON us.user_id = u.id
JOIN linkedin_profiles lp ON u.linkedin_profile_id = lp.id
WHERE us.reviews_received != (
  (SELECT COUNT(*) FROM reviews r WHERE r.reviewee_id COLLATE utf8mb4_unicode_ci = lp.id COLLATE utf8mb4_unicode_ci) +
  (SELECT COUNT(*) FROM anonymous_reviews ar WHERE ar.reviewee_id COLLATE utf8mb4_unicode_ci = lp.id COLLATE utf8mb4_unicode_ci)
);

-- Check 2: Users with reviews but NULL overall_score
SELECT 
  'MISMATCH: NULL score with reviews' as issue_type,
  u.name,
  u.email,
  us.reviews_received,
  us.overall_score,
  'NEEDS SCORE CALCULATION' as action_required
FROM users u
JOIN user_scores us ON us.user_id = u.id
WHERE us.reviews_received > 0 
  AND us.overall_score IS NULL;

-- Check 3: Users with overall_score but 0 reviews
SELECT 
  'MISMATCH: Score without reviews' as issue_type,
  u.name,
  u.email,
  us.reviews_received,
  us.overall_score,
  'NEEDS SCORE RESET' as action_required
FROM users u
JOIN user_scores us ON us.user_id = u.id
WHERE us.reviews_received = 0 
  AND us.overall_score IS NOT NULL;

-- Summary: If all checks return 0 rows, data is consistent
SELECT 
  CASE 
    WHEN (
      SELECT COUNT(*) FROM (
        SELECT 1 FROM users u
        JOIN user_scores us ON us.user_id = u.id
        JOIN linkedin_profiles lp ON u.linkedin_profile_id = lp.id
        WHERE us.reviews_received != (
          (SELECT COUNT(*) FROM reviews r WHERE r.reviewee_id COLLATE utf8mb4_unicode_ci = lp.id COLLATE utf8mb4_unicode_ci) +
          (SELECT COUNT(*) FROM anonymous_reviews ar WHERE ar.reviewee_id COLLATE utf8mb4_unicode_ci = lp.id COLLATE utf8mb4_unicode_ci)
        )
      ) as t1
    ) = 0 
    THEN '✅ DATA IS CONSISTENT - No action needed'
    ELSE '❌ DATA INCONSISTENCY DETECTED - Run restore-correct-review-counts.sql'
  END as validation_result;
