# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-18T16:33:03.848Z

## Project Stats
- Total memories: 105
- Commits tracked: 105
- Decisions recorded: 0

## Relevant to Current Work
- **1/18/2026**: Improve tag button alignment: left-align text and icons (src/components/review/ReviewFormDynamic.jsx)
- **1/18/2026**: Improve review form UI: wider layout, better organization, moved content up (src/components/review/ReviewFormDynamic.jsx, src/config/reviewConfig.js, src/pages/Review.jsx)
- **1/18/2026**: Fix Polish button: move below textarea and use production API URL (src/components/review/ReviewFormDynamic.jsx)
- **1/18/2026**: Add AI grammar polish feature with OpenAI integration (backend/routes/reviews.js, src/components/review/ReviewFormDynamic.jsx)
- **1/18/2026**: Add relationship-specific review questions with weighted scoring (NEW_REVIEW_STRUCTURE.md, backend/database/migration-dynamic-reviews.sql, backend/database/migration-new-review-structure.sql)

## Recent Changes
- `dd4e0e8` 1/18/2026: Improve tag button alignment: left-align text and icons
  Files: src/components/review/ReviewFormDynamic.jsx
- `96a1a91` 1/18/2026: Improve review form UI: wider layout, better organization, moved content up
  Files: src/components/review/ReviewFormDynamic.jsx, src/config/reviewConfig.js, src/pages/Review.jsx
- `19cc7f3` 1/18/2026: Improve mobile UI: logo icon and score circle
  Files: src/components/Logo.jsx, src/pages/Profile.jsx
- `96405d7` 1/18/2026: Fix job title normalization for percentile badge
  Files: backend/routes/reviews.js, src/pages/Profile.jsx
- `ae56b96` 1/18/2026: Add new relationship-specific soft skills to review config
  Files: src/config/reviewConfig.js
- `311b945` 1/18/2026: Profile page redesign: percentile tiers, mobile responsiveness, consent modal update
  Files: backend/routes/reviews.js, backend/utils/jobTitlesSystem.js, src/components/profile/ConsentModal.jsx
- `473ce79` 1/18/2026: Simplify profile page: compact hero section with Continue Reviewing button, fix onboarding redirect for users who completed 3 reviews
  Files: src/components/profile/WaitingState.jsx, src/pages/Onboarding.jsx, src/pages/Profile.jsx
- `bd6bac4` 1/18/2026: Upgrade to GPT-4o-mini for better grammar correction with lower temperature
  Files: backend/routes/reviews.js
- `4008fc8` 1/18/2026: Fix polish-comment route path to match frontend API call
  Files: backend/routes/reviews.js
- `a8d617c` 1/18/2026: Remove netlify.toml - using Vercel for frontend
  Files: DATABASE_SCHEMA_REVIEW.md, PROJECT_CONTEXT.md, netlify.toml
- `8978015` 1/18/2026: Add Netlify config to fix SPA routing and MIME type issues
  Files: netlify.toml
- `85e5f09` 1/18/2026: Fix Polish button: move below textarea and use production API URL
  Files: src/components/review/ReviewFormDynamic.jsx
- `c9e7b35` 1/18/2026: Add AI grammar polish feature with OpenAI integration
  Files: backend/routes/reviews.js, src/components/review/ReviewFormDynamic.jsx
- `d5a3ab8` 1/18/2026: Add randomization and prioritize colleagues with 1-2 reviews for completion
  Files: backend/routes/reviews.js
- `65d0c7b` 1/18/2026: Add /api/analytics/users endpoint for detailed user review activity table
  Files: backend/routes/analytics.js

## Do Not Repeat
These issues have already been solved:
- Fix job title normalization for percentile badge
- Fix polish-comment route path to match frontend API call
- Fix Polish button: move below textarea and use production API URL
