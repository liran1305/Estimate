# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-18T09:39:17.259Z

## Project Stats
- Total memories: 95
- Commits tracked: 95
- Decisions recorded: 0

## Relevant to Current Work
- **1/18/2026**: Fix Polish button: move below textarea and use production API URL (src/components/review/ReviewFormDynamic.jsx)
- **1/18/2026**: Add AI grammar polish feature with OpenAI integration (backend/routes/reviews.js, src/components/review/ReviewFormDynamic.jsx)
- **1/18/2026**: Add relationship-specific review questions with weighted scoring (NEW_REVIEW_STRUCTURE.md, backend/database/migration-dynamic-reviews.sql, backend/database/migration-new-review-structure.sql)

## Recent Changes
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
- `fe390ed` 1/14/2026: Fix: Use ref callback to render Turnstile when element is mounted
  Files: src/lib/turnstile.js, src/pages/LinkedInAuth.jsx
- `d601d4e` 1/14/2026: Fix Turnstile container not found error
  Files: src/pages/LinkedInAuth.jsx
- `6800147` 1/14/2026: Show actual Cloudflare Turnstile widget with logo and loading
  Files: src/lib/turnstile.js, src/pages/LinkedInAuth.jsx
- `0df80d2` 1/14/2026: Fix mobile OAuth: Make Cloudflare Turnstile verification visible
  Files: src/components/landing/HeroSection.jsx, src/components/landing/QuoteSection.jsx, src/lib/turnstile.js
- `aaf6db5` 1/14/2026: Fix mobile OAuth slowness: Implement lazy loading for all pages
  Files: backend/server.js, src/pages/index.jsx

## Do Not Repeat
These issues have already been solved:
- Fix Polish button: move below textarea and use production API URL
- Fix validation: remove old column references, validate new scores structure
- Change review session status from 'expired' to 'abandoned' to match ENUM values
- Use ref callback to render Turnstile when element is mounted
- Fix Turnstile container not found error
