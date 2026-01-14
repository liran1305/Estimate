# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-14T12:11:29.928Z

## Project Stats
- Total memories: 78
- Commits tracked: 78
- Decisions recorded: 0

## Relevant to Current Work
- **1/14/2026**: Optimize mobile OAuth + Add user-facing message (backend/database/migration-optimize-image-matching.sql, backend/server.js, src/pages/LinkedInCallback.jsx)
- **1/14/2026**: Fix: Remove is_blocked column reference (not in schema yet) (backend/server.js)
- **1/13/2026**: Enforce blocking: redirect blocked users to Blocked page immediately, prevent access to other pages (backend/server.js, src/pages/Layout.jsx)
- **1/13/2026**: Register admin routes in server.js (backend/server.js)
- **1/13/2026**: Implement image matching: extract image ID from LinkedIn OAuth picture and match to Bright Data avat (backend/server.js)

## Recent Changes
- `5a25f92` 1/14/2026: Add comprehensive data field audit documentation
  Files: DATA_FIELD_AUDIT.md
- `1c98d48` 1/14/2026: Fix: Handle reviewees without user accounts in score updates
  Files: backend/routes/reviews.js
- `4e0a7b3` 1/14/2026: Add backend mapping for old frontend values + Fix user_id null error
  Files: backend/routes/reviews.js
- `e2e37ec` 1/14/2026: Fix: Match interaction types to database ENUM values
  Files: src/components/review/ColleagueCard.jsx
- `0331516` 1/14/2026: Optimize mobile OAuth + Add user-facing message
  Files: backend/database/migration-optimize-image-matching.sql, backend/server.js, src/pages/LinkedInCallback.jsx
- `505f540` 1/14/2026: Fix mobile OAuth: Use sessionStorage + localStorage fallback
  Files: src/lib/linkedinAuth.js
- `3d9c8ec` 1/14/2026: Restore is_blocked abuse detection + Add migration
  Files: DATA_STRUCTURES.md, backend/database/migration-add-abuse-detection.sql, backend/routes/reviews.js
- `67196c6` 1/14/2026: Fix: Remove is_blocked column reference (not in schema yet)
  Files: backend/server.js
- `b6663ce` 1/14/2026: Add skip tracking: profiles get 2nd chance after 1st skip, excluded after 2nd skip (per user)
  Files: backend/database/migration-add-skip-tracking.sql, backend/routes/reviews.js
- `78b4333` 1/14/2026: Improve colleague matching: better handling for duration-only profiles (assume 24mo overlap for current employees)
  Files: backend/routes/reviews.js
- `ecc3faa` 1/14/2026: Fix mobile OAuth CSRF error: switch from sessionStorage to localStorage with 10min expiration
  Files: src/lib/linkedinAuth.js
- `6cb04e8` 1/13/2026: Clean up Profile page: remove clock icon, hide Reviews Received when 0, remove duplicate button
  Files: src/components/profile/WaitingState.jsx, src/pages/Profile.jsx
- `af39ba3` 1/13/2026: Add score fetching from backend API to display user reviews and scores on Profile page
  Files: src/pages/Profile.jsx
- `4ae7afd` 1/13/2026: Enforce blocking: redirect blocked users to Blocked page immediately, prevent access to other pages
  Files: backend/server.js, src/pages/Layout.jsx
- `1f3af0e` 1/13/2026: Fix database column name: use started_at instead of created_at for review_sessions
  Files: backend/routes/reviews.js

## Do Not Repeat
These issues have already been solved:
- Handle reviewees without user accounts in score updates
- Match interaction types to database ENUM values
- Fix mobile OAuth: Use sessionStorage + localStorage fallback
- Remove is_blocked column reference (not in schema yet)
- Fix mobile OAuth CSRF error: switch from sessionStorage to localStorage with 10min expiration
