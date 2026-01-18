# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-18T07:59:05.921Z

## Project Stats
- Total memories: 87
- Commits tracked: 87
- Decisions recorded: 0

## Relevant to Current Work
- **1/12/2026**: Revert "Add Cloud SQL Connector for secure private connection" (backend/.env.example, backend/package.json, backend/routes/colleagues.js)
- **1/12/2026**: Add Cloud SQL Connector for secure private connection (backend/.env.example, backend/package.json, backend/routes/colleagues.js)
- **1/12/2026**: Add Cloud SQL integration and colleague search API (backend/.env.example, backend/database/schema.sql, backend/package.json)
- **1/11/2026**: Add Cloudflare Turnstile invisible bot protection (.env.example, backend/.env.example, backend/server.js)
- **1/9/2026**: Add secure backend and remove client secret from frontend (.env.example, backend/.env.example, backend/README.md)

## Recent Changes
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

## Do Not Repeat
These issues have already been solved:
- Change review session status from 'expired' to 'abandoned' to match ENUM values
- Use ref callback to render Turnstile when element is mounted
- Fix Turnstile container not found error
- Fix mobile OAuth: Make Cloudflare Turnstile verification visible
- Fix mobile OAuth slowness: Implement lazy loading for all pages
