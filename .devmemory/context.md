# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-18T15:03:06.138Z

## Project Stats
- Total memories: 100
- Commits tracked: 100
- Decisions recorded: 0

## Relevant to Current Work
- **1/18/2026**: Profile page redesign: percentile tiers, mobile responsiveness, consent modal update (backend/routes/reviews.js, backend/utils/jobTitlesSystem.js, src/components/profile/ConsentModal.jsx)
- **1/18/2026**: Upgrade to GPT-4o-mini for better grammar correction with lower temperature (backend/routes/reviews.js)
- **1/18/2026**: Fix polish-comment route path to match frontend API call (backend/routes/reviews.js)
- **1/18/2026**: Add AI grammar polish feature with OpenAI integration (backend/routes/reviews.js, src/components/review/ReviewFormDynamic.jsx)
- **1/18/2026**: Add randomization and prioritize colleagues with 1-2 reviews for completion (backend/routes/reviews.js)

## Recent Changes
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
- `846a93e` 1/18/2026: Improve clarity of 'Handles Disagreements' question - rename to 'Conflict Resolution'
  Files: src/config/reviewConfig.js
- `fd2d074` 1/18/2026: Fix validation: remove old column references, validate new scores structure
  Files: backend/routes/reviews.js
- `8f58563` 1/18/2026: Add relationship-specific review questions with weighted scoring
  Files: NEW_REVIEW_STRUCTURE.md, backend/database/migration-dynamic-reviews.sql, backend/database/migration-new-review-structure.sql
- `1105ce9` 1/18/2026: Fix: Change review session status from 'expired' to 'abandoned' to match ENUM values
  Files: backend/routes/reviews.js
- `7287631` 1/14/2026: Improve navigation and profile visibility
  Files: src/pages/Layout.jsx, src/pages/Profile.jsx

## Do Not Repeat
These issues have already been solved:
- Fix polish-comment route path to match frontend API call
- Fix Polish button: move below textarea and use production API URL
- Fix validation: remove old column references, validate new scores structure
- Change review session status from 'expired' to 'abandoned' to match ENUM values
