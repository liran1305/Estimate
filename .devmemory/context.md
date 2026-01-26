# DevMemory - AI Context
> Auto-generated. AI: Read this to understand project history.
> Last updated: 2026-01-26T09:35:25.088Z

## Project Stats
- Total memories: 169
- Commits tracked: 169
- Decisions recorded: 0

## Relevant to Current Work
- **1/22/2026**: Add multiple UX improvements and new features (backend/routes/reviews.js, src/components/landing/HeroSection.jsx, src/components/review/ReviewFormDynamic.jsx)
- **1/20/2026**: fix: Persist colleague assignment across sessions/devices (backend/routes/reviews.js, src/pages/Onboarding.jsx, src/pages/Profile.jsx)
- **1/20/2026**: feat: Add GTM event tracking for key user actions (src/pages/LinkedInAuth.jsx, src/pages/LinkedInCallback.jsx, src/pages/Profile.jsx)
- **1/19/2026**: feat: Complete review counter fix + UI improvements (backend/routes/reviews.js, src/components/review/ReviewSuccess.jsx, src/pages/Profile.jsx)
- **1/19/2026**: Add clean badge preview to profile headline (src/pages/Profile.jsx)

## Recent Changes
- `c43a518` 1/25/2026: Enable SSL for all database connections (Level 1 Security)
  Files: backend/config/database.js, backend/routes/admin.js, backend/routes/anonymousReviews.js
- `e13a67b` 1/25/2026: Add anonymity trust message to colleague selection screen
  Files: src/components/review/ColleagueCard.jsx
- `41e0edd` 1/24/2026: Fix daily review limit to only count completed reviews
  Files: backend/routes/anonymousReviews.js
- `2bde425` 1/24/2026: Increase daily review limits to allow more reviews
  Files: backend/routes/anonymousReviews.js
- `d27f8f7` 1/24/2026: Add robust avatar fallback for broken LinkedIn images
  Files: src/components/review/ColleagueCard.jsx, src/components/review/ReviewForm.jsx, src/components/review/ReviewFormDynamic.jsx
- `0ba4dc4` 1/24/2026: Add manual user addition documentation and script
  Files: PROJECT_CONTEXT.md, backend/scripts/add-user-manually.sql
- `2864e9a` 1/24/2026: Add incomplete OAuth user tracking and contact form with backend email
  Files: backend/server.js, backend/services/emailService.js, src/pages/Contact.jsx
- `1e84027` 1/23/2026: Add video demo section to landing page
  Files: public/videos/estimate-demo.mp4, src/components/landing/VideoDemo.jsx, src/pages/Landing.jsx
- `d0717db` 1/23/2026: Add leaderboard preview image for landing page
  Files: public/leaderboard-preview.png
- `5c54e3b` 1/23/2026: Add leaderboard preview and update Why Estimate section on landing page
  Files: src/components/landing/LeaderboardPreview.jsx, src/components/landing/WhyEstimate.jsx, src/pages/Landing.jsx
- `c4fc168` 1/23/2026: Use light background logo for OG image (1024x1024)
  Files: index.html, public/og-image.png
- `a932c7f` 1/23/2026: Add og:image back with 180x180 favicon and image type
  Files: index.html
- `8a9142f` 1/23/2026: Remove og:image tags to let LinkedIn use favicon for icon-card layout
  Files: index.html
- `38c0796` 1/22/2026: Use smaller 180x180 favicon for OG image to trigger icon-card layout
  Files: index.html, public/og-image.png
- `c1f93ed` 1/22/2026: Update OG image to 512x512 for icon-card layout on LinkedIn
  Files: index.html

## Do Not Repeat
These issues have already been solved:
- Fix daily review limit to only count completed reviews
