# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-14T12:22:22.864Z

## Project Stats
- Total memories: 80
- Commits tracked: 80
- Decisions recorded: 0

## Relevant to Current Work
- **1/14/2026**: Optimize mobile OAuth + Add user-facing message (backend/database/migration-optimize-image-matching.sql, backend/server.js, src/pages/LinkedInCallback.jsx)
- **1/9/2026**: Implement real LinkedIn OAuth authentication (.env.example, src/lib/linkedinAuth.js, src/pages/LinkedInAuth.jsx)

## Recent Changes
- `6f63a51` 1/14/2026: Update FAQ: Accurate 3-review unlock mechanism for recruiter visibility
  Files: src/components/landing/FAQ.jsx
- `5d56e97` 1/14/2026: Add dynamic typewriter hero titles with animation
  Files: DATA_FIELD_AUDIT.md, src/components/landing/HeroSection.jsx, src/components/landing/TypewriterTitle.jsx
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

## Do Not Repeat
These issues have already been solved:
- Handle reviewees without user accounts in score updates
- Match interaction types to database ENUM values
- Fix mobile OAuth: Use sessionStorage + localStorage fallback
- Remove is_blocked column reference (not in schema yet)
- Fix mobile OAuth CSRF error: switch from sessionStorage to localStorage with 10min expiration
