# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-02-04T10:36:34.320Z

## Project Stats
- Total memories: 250
- Commits tracked: 250
- Decisions recorded: 0

## Recent Changes
- `547eae0` 2/4/2026: Add 10X and Gravity personality questions to review system
  Files: COMPLETE_DATABASE_SCHEMA.md, backend/migrations/add_10x_gravity_columns.sql, backend/routes/anonymousReviews.js
- `18b0638` 2/4/2026: Fix: Change /auth to /LinkedInAuth in ReviewRequest.jsx
  Files: src/pages/ReviewRequest.jsx
- `ac3415e` 2/4/2026: Add invited-only user system for users without pre-existing profile data
  Files: COMPLETE_DATABASE_SCHEMA.md, DATABASE_SCHEMA.md, backend/migrations/add_invited_only_column.sql
- `a9f1eb0` 2/3/2026: Add mandatory database workflow rules to schema documentation
  Files: COMPLETE_DATABASE_SCHEMA.md
- `8d93a8b` 2/3/2026: Fix white page for incomplete OAuth users: add Contact to publicPages
  Files: src/pages/Layout.jsx
- `b6fd57d` 2/2/2026: Fix skip tracking: increment review_sessions.skips_used counter
  Files: backend/routes/reviews.js
- `c7104e6` 2/2/2026: Fix rewards modal: show generated link even when availableRequests becomes 0
  Files: src/components/RewardsModal.jsx
- `9ad0f78` 2/2/2026: Fix leaderboard visibility: check dimension_scores instead of reviews_received
  Files: src/pages/Layout.jsx
- `5341be0` 2/2/2026: Fix profile display: use dimension_scores to detect reviews instead of reviews_received count
  Files: src/pages/ProfileLinkedIn.jsx
- `c2a7d89` 2/2/2026: Add nodemailer dependency to package.json
  Files: backend/package.json
- `9eb3019` 2/2/2026: Fix: define getPool locally in profileEditRequests.js
  Files: backend/routes/profileEditRequests.js
- `fc663a1` 2/2/2026: Fix db import path in profileEditRequests.js
  Files: backend/routes/profileEditRequests.js
- `770005d` 2/2/2026: Add profile edit request system with admin approval workflow
  Files: .env.example, backend/routes/profileEditRequests.js, backend/server.js
- `3a05c25` 1/30/2026: Fix: redirect new users back to review-request page for validation after signup/onboarding
  Files: src/pages/LinkedInCallback.jsx, src/pages/Onboarding.jsx, src/pages/ReviewRequest.jsx
- `72fb26e` 1/30/2026: Add review request validation: require login, same company, 3+ months overlap
  Files: backend/routes/requestTokens.js, src/pages/ReviewRequest.jsx

## Do Not Repeat
These issues have already been solved:
- Change /auth to /LinkedInAuth in ReviewRequest.jsx
- Fix white page for incomplete OAuth users: add Contact to publicPages
- Fix skip tracking: increment review_sessions.skips_used counter
- Fix rewards modal: show generated link even when availableRequests becomes 0
- Fix leaderboard visibility: check dimension_scores instead of reviews_received
