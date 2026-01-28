# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-28T08:54:25.559Z

## Project Stats
- Total memories: 218
- Commits tracked: 218
- Decisions recorded: 0

## Relevant to Current Work
- **1/27/2026**: Add test review scripts and recalculation utility (backend/database/migrations/add-test-review-liran.sql, backend/database/migrations/find-liran-naim-exact.sql, backend/database/migrations/find-liran-profile.sql)

## Recent Changes
- `f27a15b` 1/28/2026: Fix review request flow - pass linkId to Review page
  Files: backend/database/migration-request-tokens.sql, src/components/RewardsModal.jsx, src/pages/LinkedInCallback.jsx
- `2471cbf` 1/28/2026: Add Rewards feature to profile dropdown with shareable link
  Files: src/components/RewardsModal.jsx, src/pages/Layout.jsx
- `3323ea2` 1/28/2026: Make strength tags optional in review form
  Files: src/components/review/ReviewFormBehavioral.jsx
- `e957751` 1/28/2026: Increase profile picture size in review form header
  Files: src/components/review/QuestionRenderer.jsx, src/components/review/ReviewFormBehavioral.jsx
- `0005961` 1/28/2026: Add comprehensive V2 Question Framework with relationship + role mapping
  Files: src/config/questionsConfigV2.js
- `daa6a5c` 1/28/2026: Fix leaderboard photo: prioritize localStorage picture for current user
  Files: src/pages/Leaderboard.jsx
- `5568832` 1/27/2026: Fix leaderboard profile picture for current user
  Files: src/pages/Leaderboard.jsx
- `870944b` 1/27/2026: Improve leaderboard category matching to prioritize specific matches
  Files: src/pages/Leaderboard.jsx
- `95ea9c3` 1/27/2026: Move Peer Verified badge inline with name on mobile
  Files: src/pages/ProfileLinkedIn.jsx
- `0bbb02a` 1/27/2026: Fix ConsentModal prop name from isOpen to open and add isLoading prop
  Files: src/pages/ProfileLinkedIn.jsx
- `c0bb6a2` 1/27/2026: Remove redundant Verified badge from Credibility Summary section
  Files: src/pages/ProfileLinkedIn.jsx
- `1e2cc68` 1/27/2026: Add Open for Recruiters toggle to ProfileLinkedIn page
  Files: src/pages/ProfileLinkedIn.jsx
- `7656ea6` 1/27/2026: Fix company names wrapping on mobile - use line-clamp-2 instead of truncate
  Files: src/pages/ProfileLinkedIn.jsx
- `a51fb4d` 1/27/2026: Remove redundant Companies Footer and show both companies in tile
  Files: src/pages/ProfileLinkedIn.jsx
- `e836ab0` 1/27/2026: Fix high-signal percentage calculation to only count answered questions
  Files: backend/scripts/recalculate-liran-scores.js, src/pages/ProfileLinkedIn.jsx

## Do Not Repeat
These issues have already been solved:
- Fix review request flow - pass linkId to Review page
- Fix leaderboard photo: prioritize localStorage picture for current user
- Fix leaderboard profile picture for current user
- Fix ConsentModal prop name from isOpen to open and add isLoading prop
- Fix company names wrapping on mobile - use line-clamp-2 instead of truncate
