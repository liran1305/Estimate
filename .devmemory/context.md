# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-22T20:12:30.192Z

## Project Stats
- Total memories: 148
- Commits tracked: 148
- Decisions recorded: 0

## Recent Changes
- `4a12bbf` 1/22/2026: Fix skip refresh bug: prevent negative unusedSkips and add debug logging
  Files: backend/routes/reviews.js
- `b24ab18` 1/22/2026: Add debug logging for 70/30 company selection to diagnose FireArc issue
  Files: backend/routes/reviews.js
- `3b78a37` 1/22/2026: Major UX improvements and bug fixes
  Files: src/components/review/ColleagueCard.jsx, src/pages/Leaderboard.jsx
- `0edf72d` 1/22/2026: Add multiple UX improvements and new features
  Files: backend/routes/reviews.js, src/components/landing/HeroSection.jsx, src/components/review/ReviewFormDynamic.jsx
- `faad99e` 1/22/2026: Improve landing page UX and fix colleague matching data issue
  Files: public/images/anonymous.png, src/components/landing/HeroSection.jsx
- `012372b` 1/21/2026: Fix user_scores creation and extend company history to 5 years
  Files: backend/routes/reviews.js, backend/server.js
- `44557c4` 1/21/2026: Fix server.js to count reviews from BOTH tables
  Files: PROJECT_CONTEXT.md, backend/server.js
- `69076ba` 1/21/2026: Fix dataValidation.js - use local getPool instead of missing config/database
  Files: backend/routes/dataValidation.js
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

## Do Not Repeat
These issues have already been solved:
- Fix skip refresh bug: prevent negative unusedSkips and add debug logging
- Fix user_scores creation and extend company history to 5 years
- Fix server.js to count reviews from BOTH tables
- Fix dataValidation.js - use local getPool instead of missing config/database
- Fix at source: Database triggers auto-sync review counts
