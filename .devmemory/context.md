# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-27T14:29:22.056Z

## Project Stats
- Total memories: 190
- Commits tracked: 190
- Decisions recorded: 0

## Recent Changes
- `81bb288` 1/27/2026: Fix ProfileV2: thinner badge, add colleague comments
  Files: backend/database/migrations/migrate-existing-reviews.js, src/components/profile/ColleagueQuotes.jsx, src/components/profile/DimensionCard.jsx
- `f982030` 1/27/2026: Add all V2 Profile components matching design mockups
  Files: src/components/profile/DimensionCard.jsx, src/components/profile/SkillsThatMatter.jsx, src/components/profile/StrengthTagsDisplay.jsx
- `6370ba3` 1/27/2026: Integrate V2 behavioral scoring into Profile page
  Files: backend/routes/reviews.js, src/pages/Profile.jsx
- `d413aa2` 1/27/2026: Make AI Grammar Fix button always visible, disabled until 10+ chars
  Files: src/components/review/ReviewFormBehavioral.jsx
- `37b20c5` 1/27/2026: Show Other option only for choice-type questions, not emoji questions
  Files: src/components/review/ReviewFormBehavioral.jsx
- `87a2ec2` 1/27/2026: Add Other option with free text input to questions
  Files: src/components/review/ReviewFormBehavioral.jsx
- `b6659c7` 1/27/2026: Fix progress bar and add skip option to questions
  Files: src/components/review/ReviewFormBehavioral.jsx
- `e32fa57` 1/27/2026: Redesign review form - simple, fun, one question at a time
  Files: backend/database/migrations/scoring-redesign.sql, src/components/review/ReviewFormBehavioral.jsx
- `9977d65` 1/27/2026: Add profile components index.js exports
  Files: src/components/profile/index.js
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

## Do Not Repeat
These issues have already been solved:
- Fix ProfileV2: thinner badge, add colleague comments
- Fix progress bar and add skip option to questions
- Refresh user avatar on every login to prevent expired LinkedIn URLs
- Fetch requester avatar from users table instead of linkedin_profiles
- Use BINARY casting in JOINs to prevent collation mismatch
