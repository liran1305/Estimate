# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-14T11:20:04.384Z

## Project Stats
- Total memories: 69
- Commits tracked: 69
- Decisions recorded: 0

## Recent Changes
- `78b4333` 1/14/2026: Improve colleague matching: better handling for duration-only profiles (assume 24mo overlap for current employees)
  Files: backend/routes/reviews.js
- `ecc3faa` 1/14/2026: Fix mobile OAuth CSRF error: switch from sessionStorage to localStorage with 10min expiration
  Files: src/lib/linkedinAuth.js
- `6cb04e8` 1/13/2026: Clean up Profile page: remove clock icon, hide Reviews Received when 0, remove duplicate button
  Files: src/components/profile/WaitingState.jsx, src/pages/Profile.jsx
- `af39ba3` 1/13/2026: Add score fetching from backend API to display user reviews and scores on Profile page
  Files: src/pages/Profile.jsx
- `4ae7afd` 1/13/2026: Enforce blocking: redirect blocked users to Blocked page immediately, prevent access to other pages
  Files: backend/server.js, src/pages/Layout.jsx
- `1f3af0e` 1/13/2026: Fix database column name: use started_at instead of created_at for review_sessions
  Files: backend/routes/reviews.js
- `241ff10` 1/13/2026: Fix skip budget: company-size-based (3-13 max), +3 daily refresh only when exhausted
  Files: backend/routes/reviews.js
- `65befa0` 1/13/2026: Add abuse detection: block users who exhaust skips 3 days in a row, cap max skips at 3/day, add Blocked page with contact form
  Files: backend/routes/reviews.js, src/components/review/ColleagueCard.jsx, src/pages/Blocked.jsx
- `2f665e6` 1/13/2026: Add daily skip budget refresh: sessions expire after 24 hours, button shows 'Try again tomorrow' when skips exhausted
  Files: backend/routes/reviews.js, src/components/review/ColleagueCard.jsx
- `27e3e87` 1/13/2026: Fix colleague query to prioritize current and most recent shared companies
  Files: backend/routes/reviews.js
- `90a8942` 1/13/2026: Add new images: anonymous icon and right arrow
  Files: public/images/anonimous.png, public/images/right-arrow.png
- `e76c64d` 1/13/2026: Update Onboarding: wider card, user name greeting, bigger anonymous icon, replace all arrows with new design
  Files: src/components/landing/HeroSection.jsx, src/components/review/ColleagueCard.jsx, src/components/review/ReviewSuccess.jsx
- `74aa496` 1/13/2026: Add loading state to skip button and fix counter jumping issue
  Files: src/components/review/ColleagueCard.jsx, src/pages/Review.jsx
- `a51e49d` 1/13/2026: Fix refresh bypass: add pending status to assignments and skip Turnstile in local dev
  Files: backend/routes/reviews.js, src/lib/turnstile.js
- `202fc1b` 1/13/2026: Fix refresh bypass: create assignment with 'pending' status immediately when colleague is shown
  Files: backend/routes/reviews.js

## Do Not Repeat
These issues have already been solved:
- Fix mobile OAuth CSRF error: switch from sessionStorage to localStorage with 10min expiration
- Fix database column name: use started_at instead of created_at for review_sessions
- Fix skip budget: company-size-based (3-13 max), +3 daily refresh only when exhausted
- Fix colleague query to prioritize current and most recent shared companies
- Fix refresh bypass: add pending status to assignments and skip Turnstile in local dev
