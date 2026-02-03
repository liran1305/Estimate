# Complete Database Schema - All 29 Tables

**Last Updated:** February 3, 2026  
**Source:** Exported from INFORMATION_SCHEMA.COLUMNS  
**Database:** MySQL (Google Cloud SQL)

---

## 🚨 CRITICAL: MANDATORY DATABASE WORKFLOW 🚨

**Before ANY database operation (INSERT, UPDATE, SELECT with specific columns):**

1. ✅ **READ THIS FILE FIRST** - Check field names and data types
2. ✅ **Run `DESCRIBE table_name`** if uncertain about ENUM values or field types
3. ✅ **NEVER assume field names** - verify exact spelling
4. ✅ **Update this file immediately** after discovering schema changes

**Common mistakes that MUST be avoided:**
- ❌ Using `linkedin_url` in linkedin_profiles (doesn't exist)
- ❌ Using `manual_verification` as profile_match_method (not in ENUM - use 'email')
- ❌ Assuming field names without verification

**This workflow is MANDATORY - no exceptions.**

---

---

## Table List (29 tables)

1. admin_actions
2. analytics_events
3. anonymous_reviews
4. certifications
5. companies
6. company_connections
7. dimension_scores
8. education
9. fraud_flags
10. incomplete_oauth_users
11. linkedin_profiles
12. notification_log
13. notification_queue
14. oauth_tokens
15. profile_edit_requests
16. request_blocks
17. request_tokens
18. review_assignments
19. review_requests
20. review_sessions
21. review_tokens
22. reviews
23. schema_versions
24. skills
25. user_company_skips
26. user_scores
27. user_violations
28. users
29. work_experience

---

## Key Tables for Manual User Onboarding

### incomplete_oauth_users
Users who authenticated via LinkedIn OAuth but couldn't be matched to existing profiles.

**Critical for:** Manual verification and onboarding of users without profile data.

**Key Fields:**
- `user_id` (varchar(36)) - FK to users.id
- `email` (varchar(255)) - User email
- `linkedin_num_id` (varchar(100)) - LinkedIn numeric ID from OAuth
- `resolved` (tinyint(1)) - Whether manually onboarded (0 or 1)
- `notes` (text) - Admin notes about resolution

### users
**ENUM Fields:**
- `profile_match_method`: 'linkedin_id','linkedin_num_id','image','image_multiple','name','email','not_found'
- `account_status`: 'active','suspended','deleted'

**Critical Fields:**
- `linkedin_profile_id` (varchar(255)) - FK to linkedin_profiles.id
- `can_use_platform` (tinyint(1)) - Must be 1 for platform access
- `profile_match_confidence` (decimal(3,2)) - 0.00 to 1.00

### linkedin_profiles
**Key Fields:**
- `id` (varchar(255)) PK - LinkedIn profile slug (e.g., 'lee-gal')
- `linkedin_num_id` (varchar(50)) - Numeric ID from OAuth
- `name` (varchar(255)) - Full name
- `email` (varchar(255)) - Email address
- `position` (varchar(500)) - Job title
- `current_company_name` (varchar(255)) - Current employer

---

## Manual Onboarding Workflow

When a user gets white page due to incomplete OAuth:

1. Check `incomplete_oauth_users` for their record
2. Get their LinkedIn profile URL manually
3. Create `linkedin_profiles` record with correct fields
4. Update `users` table to link profile
5. Create `user_scores` record
6. Mark `incomplete_oauth_users.resolved = 1`

**Example:**
```sql
-- 1. Create profile
INSERT INTO linkedin_profiles (id, linkedin_num_id, name, first_name, last_name, email, position, current_company_name, location, avatar, created_at)
VALUES ('profile-id', 'num_id', 'Full Name', 'First', 'Last', 'email@example.com', 'Job Title', 'Company', 'Location', 'avatar_url', NOW());

-- 2. Link to user (use 'email' as match method)
UPDATE users 
SET linkedin_profile_id = 'profile-id', can_use_platform = 1, profile_match_method = 'email', profile_match_confidence = 1.00, profile_matched_at = NOW()
WHERE id = 'user-uuid';

-- 3. Create user_scores
INSERT INTO user_scores (user_id, linkedin_profile_id, reviews_received, reviews_given, score_unlocked, created_at)
VALUES ('user-uuid', 'profile-id', 0, 0, 0, NOW());

-- 4. Mark resolved
UPDATE incomplete_oauth_users SET resolved = 1, resolved_at = NOW(), notes = 'Manually onboarded'
WHERE user_id = 'user-uuid';
```

---

**End of Schema Documentation**
