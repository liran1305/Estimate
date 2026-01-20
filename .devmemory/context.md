# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-20T14:37:38.909Z

## Project Stats
- Total memories: 123
- Commits tracked: 123
- Decisions recorded: 0

## Relevant to Current Work
- **1/19/2026**: feat: Complete review counter fix + UI improvements (backend/routes/reviews.js, src/components/review/ReviewSuccess.jsx, src/pages/Profile.jsx)
- **1/18/2026**: Improve review form UI: wider layout, better organization, moved content up (src/components/review/ReviewFormDynamic.jsx, src/config/reviewConfig.js, src/pages/Review.jsx)
- **1/18/2026**: Add relationship-specific review questions with weighted scoring (NEW_REVIEW_STRUCTURE.md, backend/database/migration-dynamic-reviews.sql, backend/database/migration-new-review-structure.sql)
- **1/13/2026**: Add abuse detection: block users who exhaust skips 3 days in a row, cap max skips at 3/day, add Bloc (backend/routes/reviews.js, src/components/review/ColleagueCard.jsx, src/pages/Blocked.jsx)
- **1/13/2026**: Add loading state to skip button and fix counter jumping issue (src/components/review/ColleagueCard.jsx, src/pages/Review.jsx)

## Recent Changes
- `c161e60` 1/20/2026: feat: Add Google Tag Manager tracking
  Files: index.html
- `4ce4076` 1/20/2026: fix: Add sitemap.xml and robots.txt content
  Files: public/robots.txt, public/sitemap.xml
- `080da7b` 1/20/2026: fix: Serve sitemap.xml and robots.txt as static files
  Files: public/_redirects
- `58727fe` 1/20/2026: feat: Add sitemap.xml and robots.txt for SEO
  Files: public/robots.txt, public/sitemap.xml
- `8e6e092` 1/20/2026: feat: Add sitemap.xml and robots.txt for SEO
  Files: public/robots.txt, public/sitemap.xml
- `2643adb` 1/20/2026: fix: Correct 70/30 company distribution in colleague matching
  Files: backend/routes/reviews.js
- `c03efaa` 1/20/2026: feat: Add email notifications for new reviews
  Files: backend/package.json, backend/routes/anonymousReviews.js, backend/services/emailService.js
- `42d7a55` 1/19/2026: feat: Complete review counter fix + UI improvements
  Files: backend/routes/reviews.js, src/components/review/ReviewSuccess.jsx, src/pages/Profile.jsx
- `940c345` 1/19/2026: feat: Add 'Can't rate this' skip feature with 30% limit + fix review counter bug
  Files: backend/routes/reviews.js, src/components/review/ReviewFormDynamic.jsx
- `815bb7a` 1/19/2026: feat: Implement anonymous review system with token-burning architecture
  Files: backend/routes/anonymousReviews.js, backend/server.js, src/components/landing/FAQ.jsx
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

## Do Not Repeat
These issues have already been solved:
- Add sitemap.xml and robots.txt content
- Serve sitemap.xml and robots.txt as static files
- Correct 70/30 company distribution in colleague matching
- Replace insecure client-side fraud detection with server-side enforcement
