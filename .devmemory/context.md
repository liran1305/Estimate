# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-14T14:13:41.162Z

## Project Stats
- Total memories: 85
- Commits tracked: 85
- Decisions recorded: 0

## Relevant to Current Work
- **1/14/2026**: Fix: Match interaction types to database ENUM values (src/components/review/ColleagueCard.jsx)
- **1/13/2026**: Add abuse detection: block users who exhaust skips 3 days in a row, cap max skips at 3/day, add Bloc (backend/routes/reviews.js, src/components/review/ColleagueCard.jsx, src/pages/Blocked.jsx)
- **1/13/2026**: Add daily skip budget refresh: sessions expire after 24 hours, button shows 'Try again tomorrow' whe (backend/routes/reviews.js, src/components/review/ColleagueCard.jsx)
- **1/13/2026**: Update Onboarding: wider card, user name greeting, bigger anonymous icon, replace all arrows with ne (src/components/landing/HeroSection.jsx, src/components/review/ColleagueCard.jsx, src/components/review/ReviewSuccess.jsx)
- **1/13/2026**: Add loading state to skip button and fix counter jumping issue (src/components/review/ColleagueCard.jsx, src/pages/Review.jsx)

## Recent Changes
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
- `6f63a51` 1/14/2026: Update FAQ: Accurate 3-review unlock mechanism for recruiter visibility
  Files: src/components/landing/FAQ.jsx
- `5d56e97` 1/14/2026: Add dynamic typewriter hero titles with animation
  Files: DATA_FIELD_AUDIT.md, src/components/landing/HeroSection.jsx, src/components/landing/TypewriterTitle.jsx
- `5a25f92` 1/14/2026: Add comprehensive data field audit documentation
  Files: DATA_FIELD_AUDIT.md
- `1c98d48` 1/14/2026: Fix: Handle reviewees without user accounts in score updates
  Files: backend/routes/reviews.js
- `4e0a7b3` 1/14/2026: Add backend mapping for old frontend values + Fix user_id null error
  Files: backend/routes/reviews.js
- `e2e37ec` 1/14/2026: Fix: Match interaction types to database ENUM values
  Files: src/components/review/ColleagueCard.jsx
- `0331516` 1/14/2026: Optimize mobile OAuth + Add user-facing message
  Files: backend/database/migration-optimize-image-matching.sql, backend/server.js, src/pages/LinkedInCallback.jsx
- `505f540` 1/14/2026: Fix mobile OAuth: Use sessionStorage + localStorage fallback
  Files: src/lib/linkedinAuth.js
- `3d9c8ec` 1/14/2026: Restore is_blocked abuse detection + Add migration
  Files: DATA_STRUCTURES.md, backend/database/migration-add-abuse-detection.sql, backend/routes/reviews.js
- `67196c6` 1/14/2026: Fix: Remove is_blocked column reference (not in schema yet)
  Files: backend/server.js

## Do Not Repeat
These issues have already been solved:
- Use ref callback to render Turnstile when element is mounted
- Fix Turnstile container not found error
- Fix mobile OAuth: Make Cloudflare Turnstile verification visible
- Fix mobile OAuth slowness: Implement lazy loading for all pages
- Handle reviewees without user accounts in score updates
