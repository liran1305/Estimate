# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-19T14:45:47.616Z

## Project Stats
- Total memories: 113
- Commits tracked: 113
- Decisions recorded: 0

## Recent Changes
- `d275675` 1/19/2026: Update PROJECT_CONTEXT.md: document colleague matching improvements and fraud detection changes
  Files: PROJECT_CONTEXT.md
- `10f48f2` 1/19/2026: Smart colleague matching: expand to 4 companies with 2-year filter, skip companies with no colleagues, add 70/30 current/previous weighting
  Files: backend/routes/reviews.js
- `04e5213` 1/19/2026: Fix: Replace insecure client-side fraud detection with server-side enforcement
  Files: backend/database/migration-fraud-tracking.sql, backend/routes/fraud.js, backend/routes/reviews.js
- `2b7eb93` 1/19/2026: Update to new light logo version
  Files: public/images/Estimate_logo_LIGHT_00000 (1).png, public/images/Estimate_logo_LIGHT_00000.png, src/components/Logo.jsx
- `d3d00a1` 1/19/2026: Update logo to light version
  Files: public/images/Estimate_logo_LIGHT_00000.png, src/components/Logo.jsx
- `7d5743e` 1/19/2026: Add clean badge preview to profile headline
  Files: src/pages/Profile.jsx
- `1845647` 1/18/2026: Add escalating violation warnings with 24-hour lockout
  Files: src/components/review/ReviewFormDynamic.jsx
- `bc0240c` 1/18/2026: Add comprehensive abuse detection system
  Files: backend/routes/reviews.js, src/components/review/ReviewFormDynamic.jsx
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

## Do Not Repeat
These issues have already been solved:
- Replace insecure client-side fraud detection with server-side enforcement
- Fix job title normalization for percentile badge
