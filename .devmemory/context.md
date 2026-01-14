# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-14T12:42:35.956Z

## Project Stats
- Total memories: 83
- Commits tracked: 83
- Decisions recorded: 0

## Relevant to Current Work
- **1/14/2026**: Show actual Cloudflare Turnstile widget with logo and loading (src/lib/turnstile.js, src/pages/LinkedInAuth.jsx)
- **1/14/2026**: Fix mobile OAuth: Make Cloudflare Turnstile verification visible (src/components/landing/HeroSection.jsx, src/components/landing/QuoteSection.jsx, src/lib/turnstile.js)
- **1/13/2026**: Fix refresh bypass: add pending status to assignments and skip Turnstile in local dev (backend/routes/reviews.js, src/lib/turnstile.js)
- **1/11/2026**: Security fix and UX improvements (src/components/review/ColleagueCard.jsx, src/lib/turnstile.js, src/pages/Review.jsx)
- **1/11/2026**: Add Cloudflare Turnstile invisible bot protection (.env.example, backend/.env.example, backend/server.js)

## Recent Changes
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
- `b6663ce` 1/14/2026: Add skip tracking: profiles get 2nd chance after 1st skip, excluded after 2nd skip (per user)
  Files: backend/database/migration-add-skip-tracking.sql, backend/routes/reviews.js
- `78b4333` 1/14/2026: Improve colleague matching: better handling for duration-only profiles (assume 24mo overlap for current employees)
  Files: backend/routes/reviews.js

## Do Not Repeat
These issues have already been solved:
- Fix mobile OAuth: Make Cloudflare Turnstile verification visible
- Fix mobile OAuth slowness: Implement lazy loading for all pages
- Handle reviewees without user accounts in score updates
- Match interaction types to database ENUM values
- Fix mobile OAuth: Use sessionStorage + localStorage fallback
