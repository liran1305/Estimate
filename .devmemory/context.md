# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-28T14:00:40.571Z

## Project Stats
- Total memories: 227
- Commits tracked: 227
- Decisions recorded: 0

## Recent Changes
- `4d91ebf` 1/28/2026: Fix colleague endorsement percentages and dimension score calculations
  Files: backend/services/dimensionScoring.js
- `4db13f0` 1/28/2026: Fix dimension scoring to include would_work_again and would_promote in query
  Files: DATABASE_SCHEMA.md, backend/services/dimensionScoring.js
- `14d6235` 1/28/2026: Fix would_promote scale from 0-2 to 1-4
  Files: backend/services/dimensionScoring.js
- `cbc4914` 1/28/2026: Fix colleague endorsement percentages to use average scores
  Files: backend/routes/reviews.js, backend/services/dimensionScoring.js
- `1e5fbbb` 1/28/2026: Make colleague profile picture circular in review card
  Files: src/components/review/ColleagueCard.jsx
- `8cf81e0` 1/28/2026: Fix review request avatar - use fresher avatar from users table
  Files: backend/routes/requestTokens.js
- `97bf0da` 1/28/2026: Fix React hooks error #310 - move useMemo before early return
  Files: src/pages/ProfileLinkedIn.jsx
- `aca8e43` 1/28/2026: Fix React hooks error - move roleConfig inside useMemo
  Files: src/pages/ProfileLinkedIn.jsx
- `359a75b` 1/28/2026: Fix skills comparison using useMemo to handle state timing
  Files: src/pages/ProfileLinkedIn.jsx
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

## Do Not Repeat
These issues have already been solved:
- Fix colleague endorsement percentages and dimension score calculations
- Fix dimension scoring to include would_work_again and would_promote in query
- Fix would_promote scale from 0-2 to 1-4
- Fix colleague endorsement percentages to use average scores
- Fix review request avatar - use fresher avatar from users table
