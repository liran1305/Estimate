# Estimate Platform - Project Context

**Last Updated:** January 18, 2026

---

## Platform Overview

**Estimate** is an anonymous peer review platform for professionals to receive honest, unbiased feedback from colleagues. The platform uses LinkedIn for authentication and work history verification.

### Core Principles
1. **Complete Anonymity** - Reviewers don't know who they're reviewing; reviewees don't know who reviewed them
2. **Work History Verification** - Only colleagues with verified time overlap can review each other
3. **Gamified Unlocking** - Users must give 3 reviews to unlock their own score
4. **Recruiter Consent** - Users control whether recruiters can see their scores

---

## Review System Architecture

### Relationship-Specific Questions (NEW - Jan 2026)

The platform now uses **dynamic, relationship-specific questions** tailored to each type of professional relationship:

#### 1. **Direct Colleague (peer)** - 5 Questions
- Communication Skills
- Reliability & Follow-Through
- Problem-Solving
- Teamwork & Collaboration
- Handles Disagreements (optional)

**Weight:** 1.0 (baseline)

#### 2. **They Were My Manager** - 7 Questions
- Communication Skills
- Reliability & Follow-Through
- Problem-Solving
- Provides Clear Direction
- Supports Growth & Development
- Handles Pressure Well
- Gives Recognition & Feedback

**Weight:** 0.9 (valuable but potentially biased)

#### 3. **They Reported to Me (direct_report)** - 7 Questions + Promotion Question
- Communication Skills
- Reliability & Follow-Through
- Problem-Solving
- Receptive to Feedback (1.2x weight)
- Takes Ownership
- Works Independently
- Shows Growth Over Time

**Additional:** "Would you recommend them for a more senior role?" (1-4 scale, 1.3x weight)

**Weight:** 1.2 (highest - manager perspective very valuable)

#### 4. **Cross-Team Collaboration** - 5 Questions
- Communication Skills
- Reliability & Follow-Through
- Problem-Solving
- Meets Cross-Team Commitments
- Responsive & Accessible

**Weight:** 0.8 (limited visibility but unbiased)

#### 5. **Other Professional Interaction** - 3 Questions
- Communication Skills
- Professionalism
- Overall Impression

**Weight:** 0.5 (minimal interaction)

---

## Data Model

### Reviews Table (Current Production Schema)

```sql
CREATE TABLE reviews (
  -- Identity
  id VARCHAR(255) PRIMARY KEY,
  reviewer_id VARCHAR(255) NOT NULL,
  reviewee_id VARCHAR(255) NOT NULL,
  assignment_id INT,
  
  -- Context
  company_name VARCHAR(255),
  company_context ENUM('current', 'previous'),
  interaction_type ENUM('direct_report', 'manager', 'peer', 'cross_team', 'other'),
  
  -- NEW: Dynamic Review Data (Active)
  scores JSON COMMENT 'Relationship-specific question scores (1-10 scale)',
  strength_tags JSON COMMENT 'Array of up to 3 selected strength tags',
  would_work_again INT CHECK (would_work_again BETWEEN 1 AND 5),
  would_promote INT CHECK (would_promote BETWEEN 1 AND 4),
  optional_comment TEXT,
  overall_score DECIMAL(3,1) CHECK (overall_score BETWEEN 1.0 AND 10.0),
  
  -- OLD: Deprecated (kept for backward compatibility)
  technical_rating DECIMAL(2,1),
  communication_rating DECIMAL(2,1),
  teamwork_rating DECIMAL(2,1),
  leadership_rating DECIMAL(2,1),
  feedback TEXT,
  
  -- Metadata
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_reviewer (reviewer_id),
  INDEX idx_reviewee (reviewee_id),
  INDEX idx_would_work_again (would_work_again),
  INDEX idx_would_promote (would_promote),
  INDEX idx_overall_score (overall_score),
  
  UNIQUE KEY unique_review (reviewer_id, reviewee_id)
);
```

### Weighted Scoring Algorithm

```javascript
// Relationship Weights
const relationshipWeights = {
  peer: 1.0,           // Baseline - sees day-to-day work
  manager: 0.9,        // Valuable but potentially biased
  direct_report: 1.2,  // Highest - manager perspective for hiring
  cross_team: 0.8,     // Limited visibility but unbiased
  other: 0.5           // Minimal interaction
};

// Question Weights
const questionWeights = {
  reliability: 1.2,           // Key for hiring decisions
  receptive_feedback: 1.2,    // Coachability signal
  work_again: 1.5,            // Strongest hiring signal
  would_promote: 1.3          // Promotion readiness
};

// Calculation
1. Calculate weighted average of all scores
2. Add work_again score (scaled to 10, weighted 1.5x)
3. Add would_promote score if applicable (scaled to 10, weighted 1.3x)
4. Apply relationship weight
5. Result: overall_score (1.0-10.0)
```

---

## Data Visibility Strategy

### User Profile (Public to User)
- Overall Score (7.8/10 or 78/100)
- Score Breakdown (radar chart)
- Top Strength Tags (badges: "🎯 Reliable" x8)
- Review Count ("Based on 12 reviews")
- "Would Work Again" Average (4.2/5)
- Relationship Distribution ("5 peers, 3 managers, 2 reports")

**Hidden from User:**
- Individual review scores (anonymity)
- Who reviewed them
- Individual comments (could identify reviewer)
- "Would Promote" scores (recruiter-only)

### Recruiter View (If Consent Enabled)
**Everything from User Profile, PLUS:**
- **"Would Promote" Summary** - "67% say ready for senior role"
- **Anonymized Comments** - Curated quotes for social proof
- **Score by Relationship Type** - "Managers rate 8.2, Peers rate 7.5"
- **Red Flags** - Low "work again" scores
- **Consistency Score** - Variance across reviewers

---

## Technical Stack

### Frontend
- **Framework:** React + Vite
- **Routing:** React Router
- **UI:** TailwindCSS + shadcn/ui components
- **State:** React hooks (useState, useEffect)
- **Auth:** LinkedIn OAuth 2.0

### Backend
- **Runtime:** Node.js + Express
- **Database:** MySQL (Google Cloud SQL)
- **ORM:** Raw SQL queries via mysql2
- **Auth:** Passport.js + LinkedIn Strategy
- **Session:** express-session with MySQL store

### Infrastructure
- **Frontend Hosting:** Netlify
- **Backend Hosting:** Render
- **Database:** Google Cloud SQL (MySQL 8.0)
- **Domain:** estimatenow.io

---

## Key Workflows

### 1. Review Submission Flow
```
User selects colleague
  ↓
Selects relationship type (peer, manager, etc.)
  ↓
Frontend loads relationship-specific questions
  ↓
User answers 3-7 sliders + selects strength tags + "would work again"
  ↓
Frontend sends: { scores: {...}, strength_tags: [...], would_work_again: 4, ... }
  ↓
Backend validates (scores 1-10, work_again 1-5, etc.)
  ↓
Backend calculates weighted overall_score
  ↓
Insert into reviews table with JSON data
  ↓
Update user_scores (reviews_given++, check if unlocked)
```

### 2. Score Unlocking
```
User gives 1st review → Progress shown (1/3)
User gives 2nd review → Progress shown (2/3)
User gives 3rd review → Score unlocked! + Recruiter consent option shown
```

### 3. Colleague Matching
```
Get user's work_experience from LinkedIn
  ↓
Find colleagues with 3+ months time overlap
  ↓
Exclude already reviewed colleagues
  ↓
Prioritize current company colleagues (70/30 weighting)
  ↓
Return random colleague from pool
```

### 4. Colleague Persistence (CRITICAL)
```
User requests next colleague
  ↓
Check review_assignments for status='assigned' by user_id
  ↓
If found → Return same colleague (update session_id if different device)
  ↓
If not found → Select new colleague and create 'assigned' record
  ↓
Colleague persists until user skips or submits review
```

**review_assignments.status values (Single Source of Truth):**
- `'assigned'` = Currently shown to user, waiting for action
- `'skipped'` = User skipped this colleague
- `'reviewed'` = User submitted a review for this colleague

**Key behavior:** Same colleague shown across page reloads, different devices, and GTM preview mode until explicitly skipped or reviewed.

---

## Recent Changes (January 2026)

### ✅ Implemented
1. **Relationship-Specific Questions** - Different questions for each relationship type
2. **Weighted Scoring Algorithm** - Relationship and question weights
3. **Dynamic Review Form** - Frontend adapts to relationship type
4. **New Database Columns** - scores (JSON), strength_tags, would_work_again, would_promote, overall_score
5. **BI Analytics Endpoints** - `/api/analytics/*` for tracking user engagement
6. **GDPR Email Unsubscribe System** - Email preferences, unsubscribe page, GTM tracking
7. **Leaderboard/Top Performers** - Rankings by job category with privacy controls

### 🏆 Leaderboard Feature (January 2026)
**Routes:** `/Leaderboard`, `/top-performers`

**API Endpoints:**
- `GET /api/leaderboard/categories` - Get all job categories with user counts
- `GET /api/leaderboard/:categoryKey` - Get ranked users for a category
- `GET /api/leaderboard/user/:userId/rank` - Get specific user's rank

**Privacy Logic:**
- Users with `recruiter_consent = 1` → Full profile visible (name, photo, company)
- Users with `recruiter_consent = 0` → "Private Profile" (only rank & score shown)

**Requirements to appear:**
- Minimum 3 reviews received
- Score unlocked (given 3+ reviews)
- Valid overall score

**Uses existing:**
- `backend/utils/jobTitlesSystem.js` for job categories (15+ categories, 100+ titles)
- `user_scores.recruiter_consent` for privacy
- `user_scores.overall_score` for ranking

### ⚠️ Pending
1. **Profile Page Update** - Display aggregated scores, top tags, work-again average
2. **Recruiter View** - Implement recruiter-specific data visibility
3. **Score Calculation Refactor** - Update to use new `scores` JSON instead of old columns
4. **Old Column Removal** - Deprecate technical_rating, communication_rating, etc.

---

## Configuration Files

### Environment Variables (.env)
```bash
# Database
CLOUD_SQL_HOST=
CLOUD_SQL_USER=
CLOUD_SQL_PASSWORD=
CLOUD_SQL_DATABASE=linkedin_profiles

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
LINKEDIN_CALLBACK_URL=

# Session
SESSION_SECRET=

# Frontend URL
FRONTEND_URL=https://estimatenow.io
```

### Review Configuration (src/config/reviewConfig.js)
- Defines all relationship types
- Maps sliders to each relationship
- Defines strength tags per relationship
- Contains weighting constants

---

## Database Indexes (Performance)

### Reviews Table
- `idx_reviewer` - Fast lookup of reviews given by user
- `idx_reviewee` - Fast lookup of reviews received by user
- `idx_would_work_again` - Filter/sort by work-again ratings
- `idx_would_promote` - Query promotion readiness
- `idx_overall_score` - Sort by weighted scores
- `unique_review` - Prevent duplicate reviews

---

## Recent Changes Log

### 2025-01-20: Colleague Persistence Fix (CRITICAL)
**Changes:**
- Fixed colleague assignment to persist across sessions/devices
- Check for `status='assigned'` by `user_id` only (not session_id)
- Update session_id when user returns from different device
- Same colleague shown until explicitly skipped or reviewed

**Impact:**
- Users no longer see different colleagues on page reload
- Consistent experience across devices (phone, desktop)
- GTM preview mode no longer causes colleague changes

**Files Modified:**
- `backend/routes/reviews.js` - Colleague next endpoint

### 2025-01-20: GTM Event Tracking
**Changes:**
- Added Google Tag Manager (GTM-PSNC2B5F)
- Added GA4 tracking (G-C8PFEN67G1)
- Implemented 9 custom events for user journey tracking

**Events:**
- `linkedin_auth_start`, `linkedin_auth_complete`
- `review_submitted`, `review_skipped`, `score_unlocked`
- `profile_viewed`, `onboarding_complete`
- `recruiter_consent_enabled`, `recruiter_consent_disabled`
- `badge_copied`

**Files Modified:**
- `index.html` - GTM script
- `src/pages/Review.jsx`, `Profile.jsx`, `LinkedInAuth.jsx`, `LinkedInCallback.jsx`, `Onboarding.jsx`

### 2025-01-20: SEO Setup
**Changes:**
- Added `sitemap.xml` with public pages
- Added `robots.txt` to block private pages
- Updated `_redirects` to serve static files

**Files Modified:**
- `public/sitemap.xml`, `public/robots.txt`, `public/_redirects`

### 2025-01-19: Colleague Matching Algorithm Improvements
**Changes:**
- Expanded company history from 2 to 4 companies (current + 3 previous)
- Added 2-year recency filter for previous companies
- Implemented smart filtering: only uses companies with colleagues in database
- Added 70/30 weighted selection: 70% current company, 30% previous company

**Impact:**
- Users with startups/small companies now see colleagues from older companies
- Better colleague distribution between current and previous companies
- Prevents "no colleagues found" for users whose current company has no data

**Files Modified:**
- `backend/routes/reviews.js` - Colleague matching endpoint

### 2025-01-19: Server-Side Fraud Detection
**Changes:**
- Moved fraud detection from client localStorage to MySQL database
- Added `user_violations` table and columns to `users` table
- Server checks lockout status before accepting reviews
- 3 violations = 24-hour lockout

**Impact:**
- Fraud detection cannot be bypassed by clearing browser data
- Complete audit trail with timestamps
- Secure, database-backed enforcement

**Files Modified:**
- `backend/routes/fraud.js` - New fraud detection endpoints
- `backend/routes/reviews.js` - Integrated server-side violation checks
- `src/components/review/ReviewFormDynamic.jsx` - Removed localStorage tracking

---

## Known Issues & Technical Debt

1. **Schema Documentation Outdated** - `complete-schema.sql` doesn't reflect production
2. **Old Columns Present** - technical_rating, communication_rating, etc. still in table
3. **Score Calculation Uses Old Columns** - Needs refactoring to use new structure
4. **No Aggregated Metrics** - user_scores table needs update for new data
5. **Data Sync** - Some users may have companies in `work_experience` but not `company_connections`

---

## Future Enhancements

### Short Term
- [ ] Update profile page with new score display
- [ ] Implement recruiter view with would_promote data
- [ ] Refactor score calculation endpoint
- [ ] Add aggregated metrics to user_scores table

### Medium Term
- [ ] Trend analysis (score changes over time)
- [ ] Team/company analytics
- [ ] Skill gap identification
- [ ] Personalized improvement suggestions

### Long Term
- [ ] Mobile app
- [ ] Integration with ATS systems
- [ ] AI-powered comment analysis
- [ ] Verified badge system

---

## Contact & Resources

- **GitHub:** https://github.com/liran1305/Estimate
- **Production:** https://estimatenow.io
- **Backend API:** https://estimate-mio1.onrender.com
- **Database:** Google Cloud SQL (linkedin_profiles)

---

**For detailed implementation notes, see:**
- `NEW_REVIEW_STRUCTURE.md` - Review system redesign documentation
- `DATABASE_SCHEMA_REVIEW.md` - Current schema alignment review
- `backend/routes/analytics.js` - BI analytics implementation
