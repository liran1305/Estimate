-- Find where actual review data is stored

-- 1. Check ALL reviews in the reviews table (any reviewee_id format)
SELECT 'Total reviews in reviews table' as info, COUNT(*) as count
FROM reviews;

-- 2. Check ALL anonymous_reviews
SELECT 'Total anonymous_reviews' as info, COUNT(*) as count
FROM anonymous_reviews;

-- 3. Sample of reviews table to see what reviewee_id format is used
SELECT 
  'Sample reviews' as info,
  id,
  reviewer_id,
  reviewee_id,
  overall_score,
  created_at
FROM reviews
ORDER BY created_at DESC
LIMIT 10;

-- 4. Sample of anonymous_reviews to see format
SELECT 
  'Sample anonymous_reviews' as info,
  id,
  reviewee_id,
  overall_score
FROM anonymous_reviews
ORDER BY id DESC
LIMIT 10;

-- 5. Check if reviewee_id matches linkedin_profile_id format
SELECT 
  'Reviews by linkedin_profile_id' as check_type,
  lp.name,
  COUNT(r.id) as review_count
FROM linkedin_profiles lp
LEFT JOIN reviews r ON r.reviewee_id COLLATE utf8mb4_unicode_ci = lp.id COLLATE utf8mb4_unicode_ci
GROUP BY lp.id, lp.name
HAVING COUNT(r.id) > 0
ORDER BY review_count DESC;

-- 6. Check anonymous_reviews by linkedin_profile_id
SELECT 
  'Anonymous reviews by linkedin_profile_id' as check_type,
  lp.name,
  COUNT(ar.id) as review_count
FROM linkedin_profiles lp
LEFT JOIN anonymous_reviews ar ON ar.reviewee_id COLLATE utf8mb4_unicode_ci = lp.id COLLATE utf8mb4_unicode_ci
GROUP BY lp.id, lp.name
HAVING COUNT(ar.id) > 0
ORDER BY review_count DESC;
