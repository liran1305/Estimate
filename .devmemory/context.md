# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-21T13:11:19.629Z

## Project Stats
- Total memories: 140
- Commits tracked: 140
- Decisions recorded: 0

## Relevant to Current Work
- **1/21/2026**: Fix at source: Database triggers auto-sync review counts (backend/routes/anonymousReviews.js, backend/routes/reviews.js)
- **1/21/2026**: feat: Complete GDPR-compliant email unsubscribe system with Privacy Policy updates (GDPR_COMPLIANCE_CHECKLIST.md, GDPR_EMAIL_SYSTEM.md, backend/routes/anonymousReviews.js)
- **1/20/2026**: feat: Switch to anonymous review system and fix company display (backend/routes/anonymousReviews.js, backend/routes/reviews.js, src/pages/Review.jsx)
- **1/20/2026**: feat: Add email notifications for new reviews (backend/package.json, backend/routes/anonymousReviews.js, backend/services/emailService.js)
- **1/19/2026**: feat: Implement anonymous review system with token-burning architecture (backend/routes/anonymousReviews.js, backend/server.js, src/components/landing/FAQ.jsx)

## Recent Changes
- `e50759e` 1/21/2026: Fix at source: Database triggers auto-sync review counts
  Files: backend/routes/anonymousReviews.js, backend/routes/reviews.js
- `a57428f` 1/21/2026: Add data validation system and fix review count sync
  Files: backend/database/find-actual-reviews.sql, backend/database/fix-reviews-received-counts.sql, backend/database/full-data-investigation.sql
- `217e8d0` 1/21/2026: Leaderboard share feature: disabled button with tooltip
  Files: package.json, src/pages/Leaderboard.jsx
- `32a6c0c` 1/21/2026: Production Release v2: Realistic leaderboard, blurred fake profiles, review count fixes
  Files: backend/routes/leaderboard.js, public/images/fake-profile-images/download (1).png, public/images/fake-profile-images/download (10).png
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

## Do Not Repeat
These issues have already been solved:
- Fix at source: Database triggers auto-sync review counts
- Generate unsubscribe tokens for new users during signup
- Critical mobile UX improvements for review form
