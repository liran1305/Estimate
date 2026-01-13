# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-13T07:44:22.458Z

## Project Stats
- Total memories: 45
- Commits tracked: 45
- Decisions recorded: 0

## Relevant to Current Work
- **1/12/2026**: Fix OAuth matching: extract profile_id from LinkedIn URL, fallback to linkedin_num_id and name (backend/routes/colleagues.js, backend/server.js)
- **1/12/2026**: Update OAuth callback to create user, match to Bright Data profile, and enable review flow (backend/server.js)
- **1/12/2026**: Add performance indexes for colleague matching queries (backend/database/add-indexes.sql, backend/server.js)
- **1/12/2026**: Add Core APIs: session/start, colleague/next, colleague/skip, review/submit, score/me (backend/routes/reviews.js, backend/server.js)
- **1/12/2026**: Add table-info endpoint and fix migration (backend/server.js)

## Recent Changes
- `3155f79` 1/12/2026: Fix OAuth matching: extract profile_id from LinkedIn URL, fallback to linkedin_num_id and name
  Files: backend/routes/colleagues.js, backend/server.js
- `b1271ec` 1/12/2026: Update frontend to use real APIs for review flow
  Files: src/lib/linkedinAuth.js, src/pages/Review.jsx
- `f2600c2` 1/12/2026: Update OAuth callback to create user, match to Bright Data profile, and enable review flow
  Files: backend/server.js
- `13c5909` 1/12/2026: Add performance indexes for colleague matching queries
  Files: backend/database/add-indexes.sql, backend/server.js
- `e683385` 1/12/2026: Add 3+ months time overlap filter for colleague matching, remove connections-based sorting
  Files: backend/routes/colleagues.js, backend/routes/reviews.js
- `2cf3e17` 1/12/2026: Limit colleague matching to current + 1 previous company only
  Files: backend/routes/colleagues.js, backend/routes/reviews.js
- `4e39393` 1/12/2026: Add endpoint to get profile work history and colleagues from all companies
  Files: backend/routes/colleagues.js
- `71b2826` 1/12/2026: Add Core APIs: session/start, colleague/next, colleague/skip, review/submit, score/me
  Files: backend/routes/reviews.js, backend/server.js
- `73cbdb0` 1/12/2026: Add table-info endpoint and fix migration
  Files: backend/server.js
- `ceff973` 1/12/2026: Fix migration: add ENGINE and CHARSET to match existing tables
  Files: backend/database/migration-add-review-system.sql
- `4d0cb5d` 1/12/2026: Add table info endpoint
  Files: backend/server.js
- `39687d1` 1/12/2026: Add migration endpoint directly to server.js
  Files: backend/server.js
- `c0d9cd6` 1/12/2026: Add migration script and admin endpoint to run migration
  Files: backend/database/migration-add-review-system.sql, backend/routes/admin.js, backend/scripts/runMigration.js
- `a4d82cc` 1/12/2026: Fix schema alignment with Bright Data: VARCHAR years, add skills table
  Files: backend/database/complete-schema.sql
- `d73c01c` 1/12/2026: Add profile matching fields to users table
  Files: backend/database/complete-schema.sql

## Do Not Repeat
These issues have already been solved:
- Fix OAuth matching: extract profile_id from LinkedIn URL, fallback to linkedin_num_id and name
- Fix migration: add ENGINE and CHARSET to match existing tables
- Fix schema alignment with Bright Data: VARCHAR years, add skills table
