-- RESTORE CORRECT REVIEW COUNTS
-- Sync user_scores.reviews_received with actual reviews (both tables)
-- Reviews are stored with linkedin_profile_id as reviewee_id

-- 1. Show current broken state
SELECT 
  'CURRENT BROKEN STATE' as status,
  u.name,
  us.reviews_received as current_count,
  us.overall_score
FROM users u
JOIN user_scores us ON us.user_id = u.id
ORDER BY u.name;

-- 2. Update reviews_received to match actual review count (reviews + anonymous_reviews)
UPDATE user_scores us
JOIN users u ON us.user_id = u.id
JOIN linkedin_profiles lp ON u.linkedin_profile_id = lp.id
SET us.reviews_received = (
  (SELECT COUNT(*) FROM reviews r WHERE r.reviewee_id COLLATE utf8mb4_unicode_ci = lp.id COLLATE utf8mb4_unicode_ci) +
  (SELECT COUNT(*) FROM anonymous_reviews ar WHERE ar.reviewee_id COLLATE utf8mb4_unicode_ci = lp.id COLLATE utf8mb4_unicode_ci)
);

-- 3. Recalculate overall_score for users who have reviews
-- Calculate average score from all reviews (both tables)
UPDATE user_scores us
JOIN users u ON us.user_id = u.id
JOIN linkedin_profiles lp ON u.linkedin_profile_id = lp.id
SET us.overall_score = (
  SELECT AVG(combined_scores.score)
  FROM (
    SELECT overall_score as score 
    FROM reviews 
    WHERE reviewee_id COLLATE utf8mb4_unicode_ci = lp.id COLLATE utf8mb4_unicode_ci
    UNION ALL
    SELECT overall_score as score 
    FROM anonymous_reviews 
    WHERE reviewee_id COLLATE utf8mb4_unicode_ci = lp.id COLLATE utf8mb4_unicode_ci
  ) as combined_scores
)
WHERE us.reviews_received > 0;

-- 4. Set overall_score to NULL for users with 0 reviews
UPDATE user_scores us
SET us.overall_score = NULL
WHERE us.reviews_received = 0;

-- 5. Verify the fix - show corrected data
SELECT 
  'AFTER FIX' as status,
  u.name,
  us.reviews_received as review_count,
  us.overall_score,
  us.score_unlocked
FROM users u
JOIN user_scores us ON us.user_id = u.id
ORDER BY us.reviews_received DESC, u.name;
