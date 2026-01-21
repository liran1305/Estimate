# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-21T11:45:17.989Z

## Project Stats
- Total memories: 136
- Commits tracked: 136
- Decisions recorded: 0

## Relevant to Current Work
- **1/21/2026**: Production Release: Score fix (0-10 scale), skip budget cap enforcement, leaderboard UI improvements (PROJECT_CONTEXT.md, backend/routes/leaderboard.js, backend/routes/reviews.js)

## Recent Changes
- `36671f1` 1/21/2026: Production Release: Score fixes, skip budget cap, review count sync, leaderboard UI
  Files: backend/routes/reviews.js, backend/server.js
- `04821d6` 1/21/2026: Production Release: Score fix (0-10 scale), skip budget cap enforcement, leaderboard UI improvements, dropdown menu
  Files: PROJECT_CONTEXT.md, backend/routes/leaderboard.js, backend/routes/reviews.js
- `cc598d8` 1/21/2026: fix: Generate unsubscribe tokens for new users during signup
  Files: backend/server.js
- `dabff6b` 1/21/2026: feat: Complete GDPR-compliant email unsubscribe system with Privacy Policy updates
  Files: GDPR_COMPLIANCE_CHECKLIST.md, GDPR_EMAIL_SYSTEM.md, backend/routes/anonymousReviews.js
- `0346391` 1/20/2026: feat: Switch to anonymous review system and fix company display
  Files: backend/routes/anonymousReviews.js, backend/routes/reviews.js, src/pages/Review.jsx
- `89c55a4` 1/20/2026: feat: Exclude military organizations from colleague matching
  Files: DATA_STRUCTURES.md, backend/database/migration-company-stats.sql, backend/routes/reviews.js
- `16594be` 1/20/2026: feat: Exclude non-workplace entries from colleague matching
  Files: backend/routes/reviews.js
- `4b5a9ae` 1/20/2026: debug: Add comprehensive logging to track colleague assignment flow
  Files: backend/routes/reviews.js
- `4edd2c0` 1/20/2026: fix: Critical mobile UX improvements for review form
  Files: src/components/review/ReviewFormDynamic.jsx
- `f652c35` 1/20/2026: feat: Improve skip button and add Continue Reviewing CTA
  Files: src/components/review/ColleagueCard.jsx, src/components/review/ReviewSuccess.jsx
- `c33fe89` 1/20/2026: docs: Update PROJECT_CONTEXT.md with colleague persistence and GTM tracking
  Files: PROJECT_CONTEXT.md
- `ae33b3a` 1/20/2026: fix: Persist colleague assignment across sessions/devices
  Files: backend/routes/reviews.js, src/pages/Onboarding.jsx, src/pages/Profile.jsx
- `ffa94f9` 1/20/2026: feat: Add GTM event tracking for key user actions
  Files: src/pages/LinkedInAuth.jsx, src/pages/LinkedInCallback.jsx, src/pages/Profile.jsx
- `c161e60` 1/20/2026: feat: Add Google Tag Manager tracking
  Files: index.html
- `4ce4076` 1/20/2026: fix: Add sitemap.xml and robots.txt content
  Files: public/robots.txt, public/sitemap.xml

## Do Not Repeat
These issues have already been solved:
- Generate unsubscribe tokens for new users during signup
- Critical mobile UX improvements for review form
- Persist colleague assignment across sessions/devices
- Add sitemap.xml and robots.txt content
