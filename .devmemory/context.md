# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-02-02T15:11:56.716Z

## Project Stats
- Total memories: 242
- Commits tracked: 242
- Decisions recorded: 0

## Recent Changes
- `5341be0` 2/2/2026: Fix profile display: use dimension_scores to detect reviews instead of reviews_received count
  Files: src/pages/ProfileLinkedIn.jsx
- `c2a7d89` 2/2/2026: Add nodemailer dependency to package.json
  Files: backend/package.json
- `9eb3019` 2/2/2026: Fix: define getPool locally in profileEditRequests.js
  Files: backend/routes/profileEditRequests.js
- `fc663a1` 2/2/2026: Fix db import path in profileEditRequests.js
  Files: backend/routes/profileEditRequests.js
- `770005d` 2/2/2026: Add profile edit request system with admin approval workflow
  Files: .env.example, backend/routes/profileEditRequests.js, backend/server.js
- `3a05c25` 1/30/2026: Fix: redirect new users back to review-request page for validation after signup/onboarding
  Files: src/pages/LinkedInCallback.jsx, src/pages/Onboarding.jsx, src/pages/ReviewRequest.jsx
- `72fb26e` 1/30/2026: Add review request validation: require login, same company, 3+ months overlap
  Files: backend/routes/requestTokens.js, src/pages/ReviewRequest.jsx
- `b6546cd` 1/30/2026: Fix token request: add transaction to prevent token loss if INSERT fails
  Files: backend/routes/requestTokens.js
- `18faa5c` 1/29/2026: Replace with 9MB video for better performance
  Files: public/videos/new_estimate_video 2.mp4, public/videos/new_estimate_video_1.mp4, src/components/landing/VideoDemo.jsx
- `377378e` 1/29/2026: Update LP and quiz videos to new_estimate_video 2.mp4
  Files: public/videos/new_estimate_video 2.mp4, src/components/landing/VideoDemo.jsx, src/pages/FutureFitQuiz.jsx
- `40d6f01` 1/29/2026: Simplify review data: remove high_signal_answers JSON, use only columns (would_work_again, would_promote)
  Files: backend/routes/anonymousReviews.js, backend/services/dimensionScoring.js, src/components/review/ReviewFormBehavioral.jsx
- `5ad3306` 1/29/2026: Add highlighted background to KEY SKILL rows on profile page
  Files: src/pages/ProfileLinkedIn.jsx
- `f412017` 1/28/2026: Add location-based colleague matching for large companies with multiple branches
  Files: DATABASE_SCHEMA.md, backend/routes/colleagues.js, backend/scripts/check-alex-location.js
- `aadf91e` 1/28/2026: Add Future-Fit Quiz to sitemap with SEO meta tags for Google indexing
  Files: public/sitemap.xml, src/pages/FutureFitQuiz.jsx
- `49301e5` 1/28/2026: Add Future-Fit Quiz: gamified soft skills assessment with instant feedback, demo video, and Estimate CTA
  Files: src/App.css, src/pages/FutureFitQuiz.jsx, src/pages/index.jsx

## Do Not Repeat
These issues have already been solved:
- Fix profile display: use dimension_scores to detect reviews instead of reviews_received count
- define getPool locally in profileEditRequests.js
- Fix db import path in profileEditRequests.js
- redirect new users back to review-request page for validation after signup/onboarding
- Fix token request: add transaction to prevent token loss if INSERT fails
