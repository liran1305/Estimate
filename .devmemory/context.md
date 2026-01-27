# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-27T14:50:58.653Z

## Project Stats
- Total memories: 197
- Commits tracked: 197
- Decisions recorded: 0

## Relevant to Current Work
- **1/27/2026**: Add Never Worry About and Room to Grow features (backend/database/migrations/add-room-to-grow.sql, backend/database/migrations/scoring-redesign.sql, backend/routes/anonymousReviews.js)

## Recent Changes
- `d2a241b` 1/27/2026: Fix profile avatar with ui-avatars fallback
  Files: backend/routes/reviews.js, src/pages/ProfileLinkedIn.jsx
- `c2d5153` 1/27/2026: Fix percentile display - use actual database values, no hardcoded fallback
  Files: src/pages/ProfileLinkedIn.jsx
- `64e6267` 1/27/2026: Fix profile avatar to use scoreData.avatar from linkedin_profiles
  Files: backend/routes/reviews.js, src/pages/ProfileLinkedIn.jsx
- `b728b8c` 1/27/2026: Add LinkedIn-styled ProfileLinkedIn page
  Files: src/pages/ProfileLinkedIn.jsx, src/pages/ProfileV2.jsx, src/pages/index.jsx
- `b7ea1d4` 1/27/2026: Add vote counts back to StrengthTagsDisplay and make tags larger
  Files: src/components/profile/StrengthTagsDisplay.jsx
- `f207b48` 1/27/2026: Update StrengthTagsDisplay to professional style
  Files: src/components/profile/StrengthTagsDisplay.jsx
- `ceaa6d1` 1/27/2026: Add Never Worry About and Room to Grow features
  Files: backend/database/migrations/add-room-to-grow.sql, backend/database/migrations/scoring-redesign.sql, backend/routes/anonymousReviews.js
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

## Do Not Repeat
These issues have already been solved:
- Fix profile avatar with ui-avatars fallback
- Fix percentile display - use actual database values, no hardcoded fallback
- Fix profile avatar to use scoreData.avatar from linkedin_profiles
- Fix ProfileV2: thinner badge, add colleague comments
- Fix progress bar and add skip option to questions
