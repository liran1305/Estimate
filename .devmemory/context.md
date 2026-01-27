# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-27T13:32:18.177Z

## Project Stats
- Total memories: 181
- Commits tracked: 181
- Decisions recorded: 0

## Recent Changes
- `263e7d4` 1/27/2026: Feature: Implement proper review request flow
  Files: backend/routes/requestTokens.js, src/pages/Review.jsx
- `394d0d2` 1/27/2026: Fix: Refresh user avatar on every login to prevent expired LinkedIn URLs
  Files: backend/server.js
- `c75ea87` 1/27/2026: Fix: Fetch requester avatar from users table instead of linkedin_profiles
  Files: backend/routes/requestTokens.js
- `0a3a328` 1/27/2026: Fix: Use BINARY casting in JOINs to prevent collation mismatch
  Files: backend/routes/requestTokens.js
- `c18f6c5` 1/27/2026: Fix: Remove all COLLATE clauses in dataValidation queries
  Files: backend/routes/dataValidation.js
- `3c10471` 1/27/2026: Fix: Remove COLLATE clause causing collation mismatch in review request query
  Files: backend/routes/requestTokens.js
- `15f66b4` 1/27/2026: Fix: Use consistent VITE_BACKEND_API_URL across all frontend files
  Files: src/components/review/ReviewFormDynamic.jsx, src/components/tokens/PendingRequestsList.jsx, src/components/tokens/RequestReviewModal.jsx
- `86c2629` 1/27/2026: Fix: Auto-repair corrupted skip budget records (initial_budget=0)
  Files: backend/routes/reviews.js
- `3659f4a` 1/26/2026: Fix collation error in review request query
  Files: backend/routes/requestTokens.js
- `f4ed234` 1/26/2026: Add token request feature to profile page
  Files: PROJECT_CONTEXT.md, backend/OAUTH_MATCHING_IMPROVEMENT.md, backend/routes/anonymousReviews.js
- `b000fa6` 1/26/2026: Improve colleague matching: increase overlap to 6 months and add smart skip detection
  Files: DATA_STRUCTURES.md, backend/routes/colleagues.js, backend/routes/reviews.js
- `347779d` 1/26/2026: Add Estimate Verified badge creator feature
  Files: backend/database/add-profile-photo.sql, backend/package.json, backend/routes/profilePhoto.js
- `c43a518` 1/25/2026: Enable SSL for all database connections (Level 1 Security)
  Files: backend/config/database.js, backend/routes/admin.js, backend/routes/anonymousReviews.js
- `e13a67b` 1/25/2026: Add anonymity trust message to colleague selection screen
  Files: src/components/review/ColleagueCard.jsx
- `41e0edd` 1/24/2026: Fix daily review limit to only count completed reviews
  Files: backend/routes/anonymousReviews.js

## Do Not Repeat
These issues have already been solved:
- Refresh user avatar on every login to prevent expired LinkedIn URLs
- Fetch requester avatar from users table instead of linkedin_profiles
- Use BINARY casting in JOINs to prevent collation mismatch
- Remove all COLLATE clauses in dataValidation queries
- Remove COLLATE clause causing collation mismatch in review request query
