# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-22T12:59:58.500Z

## Project Stats
- Total memories: 143
- Commits tracked: 143
- Decisions recorded: 0

## Relevant to Current Work
- **1/14/2026**: Fix mobile OAuth: Make Cloudflare Turnstile verification visible (src/components/landing/HeroSection.jsx, src/components/landing/QuoteSection.jsx, src/lib/turnstile.js)
- **1/14/2026**: Add dynamic typewriter hero titles with animation (DATA_FIELD_AUDIT.md, src/components/landing/HeroSection.jsx, src/components/landing/TypewriterTitle.jsx)
- **1/13/2026**: Update Onboarding: wider card, user name greeting, bigger anonymous icon, replace all arrows with ne (src/components/landing/HeroSection.jsx, src/components/review/ColleagueCard.jsx, src/components/review/ReviewSuccess.jsx)
- **1/7/2026**: Major UX improvements based on CPO/Senior UX analysis (src/components/landing/FAQ.jsx, src/components/landing/HeroSection.jsx, src/components/landing/HowItWorks.jsx)
- **1/6/2026**: Add Logo component with local images and update header spacing (public/images/Estimate_logo.png, public/images/Simon_Sinek.png, src/components/Logo.jsx)

## Recent Changes
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

## Do Not Repeat
These issues have already been solved:
- Fix user_scores creation and extend company history to 5 years
- Fix server.js to count reviews from BOTH tables
- Fix dataValidation.js - use local getPool instead of missing config/database
- Fix at source: Database triggers auto-sync review counts
- Generate unsubscribe tokens for new users during signup
