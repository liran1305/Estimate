# EstimateNow - Complete Data Flows & Integrations

## 📊 Overview

This document maps all data inputs, outputs, and integrations for the EstimateNow platform.

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA INPUTS                                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
        ▼                           ▼                           ▼
┌───────────────┐          ┌───────────────┐          ┌───────────────┐
│  Bright Data  │          │   LinkedIn    │          │  User Actions │
│   Scraper     │          │     OAuth     │          │  (Frontend)   │
└───────┬───────┘          └───────┬───────┘          └───────┬───────┘
        │                          │                          │
        │ Profiles, Companies      │ Auth tokens              │ Reviews
        │ Work history             │ User info                │ Ratings
        │                          │                          │
        ▼                          ▼                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DATABASE TABLES                               │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│  │  companies   │  │    users     │  │   reviews    │             │
│  │  profiles    │  │oauth_tokens  │  │user_scores   │             │
│  │ experience   │  │              │  │ assignments  │             │
│  └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                      │
└────────────────────────────┬─────────────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   Frontend    │    │     Email     │    │   Analytics   │
│      UI       │    │   Service     │    │   Dashboard   │
└───────────────┘    └───────────────┘    └───────────────┘
```

---

## 📥 INPUT SOURCES

### 1. Bright Data LinkedIn Scraper

**What it provides:**
- LinkedIn profile data (418K+ profiles)
- Work experience history
- Education & certifications
- Company information
- Connection counts

**Tables populated:**
- `linkedin_profiles`
- `companies`
- `work_experience`
- `education`
- `certifications`
- `company_connections`

**Import process:**
```javascript
// backend/scripts/importLargeFile.js
1. Stream JSON file from GCS
2. Parse profiles in batches (1000 at a time)
3. Extract company data → companies table
4. Insert profiles → linkedin_profiles table
5. Extract work history → work_experience + company_connections
6. Extract education → education table
7. Extract certs → certifications table
```

**Data refresh:**
- Manual: Run import script when new data available
- Frequency: Monthly or as needed
- Incremental: Use `ON DUPLICATE KEY UPDATE` for existing profiles

---

### 2. LinkedIn OAuth

**What it provides:**
- User authentication
- Basic profile info (name, email, photo)
- LinkedIn profile URL

**Tables populated:**
- `users` (create/update on login)
- `oauth_tokens` (store access tokens)

**Authentication flow:**
```javascript
// src/lib/linkedinAuth.js
1. User clicks "Continue with LinkedIn"
2. Redirect to LinkedIn OAuth
3. User approves permissions
4. LinkedIn redirects back with code
5. Exchange code for access token
6. Fetch user profile from LinkedIn API
7. Match user by email to linkedin_profiles table
8. Create user record in users table
9. Store tokens in oauth_tokens table
10. Set session cookie
```

**Scopes required:**
- `openid` - Authentication
- `profile` - Name, photo, headline
- `email` - Email address

**Token management:**
- Access tokens expire in 60 days
- Refresh tokens for long-term access
- Store encrypted in database

---

### 3. User Actions (Frontend)

**What users provide:**
- Review submissions
- Ratings (1-5 scale)
- Written feedback
- Skip actions
- Profile updates

**Tables populated:**
- `reviews`
- `review_assignments`
- `review_sessions`
- `analytics_events`

**Review submission flow:**
```javascript
// src/pages/Review.jsx
1. User selects colleague from assignment
2. Choose interaction type (manager, peer, etc.)
3. Rate on 4 categories (technical, communication, teamwork, leadership)
4. Optional: Write feedback
5. Submit → POST /api/reviews/submit
6. Backend validates and saves to reviews table
7. Update user_scores for reviewee
8. Trigger notification queue
9. Assign next colleague
```

---

## 📤 OUTPUT DESTINATIONS

### 1. Frontend UI

**What it consumes:**
- User profile data
- Colleague matches
- Review assignments
- User scores
- Progress tracking

**API endpoints:**
```javascript
GET  /api/auth/me                    // Current user info
GET  /api/colleagues/search          // Find colleagues
GET  /api/reviews/next-colleague     // Get next assignment
POST /api/reviews/submit             // Submit review
POST /api/reviews/skip               // Skip colleague
GET  /api/scores/my-score            // User's score (if unlocked)
GET  /api/scores/stats               // Overall statistics
```

**Data flow:**
```
Database → API Routes → JSON Response → React Components → UI
```

---

### 2. Email Service

**What it sends:**
- Score unlock notifications
- New review alerts
- Milestone achievements
- Review requests
- Weekly digests

**Tables used:**
- `notification_queue` (emails to send)
- `notification_log` (tracking)
- `users` (recipient info)

**Email flow:**
```javascript
// backend/services/emailService.js
1. Trigger event (e.g., user unlocks score)
2. Insert into notification_queue table
3. Background worker polls queue every 1 minute
4. Fetch pending notifications
5. Render email template with data
6. Send via SendGrid/AWS SES
7. Update status to 'sent'
8. Log in notification_log
9. Track opens/clicks
```

**Email templates:**
- `score_unlocked.html` - "🎉 Your score is ready!"
- `new_review.html` - "Someone reviewed you"
- `milestone.html` - "You've reached X reviews!"
- `review_request.html` - "{Name} wants your review"

---

### 3. Analytics Dashboard

**What it tracks:**
- User signups
- Review completion rate
- Score unlock rate
- Viral coefficient
- Fraud detection

**Tables used:**
- `analytics_events`
- `users`
- `reviews`
- `user_scores`
- `fraud_flags`

**Metrics calculated:**
```sql
-- Conversion funnel
SELECT 
  COUNT(*) as signups,
  SUM(CASE WHEN reviews_given >= 1 THEN 1 ELSE 0 END) as started_reviewing,
  SUM(CASE WHEN reviews_given >= 3 THEN 1 ELSE 0 END) as unlocked_score,
  SUM(CASE WHEN reviews_given >= 5 THEN 1 ELSE 0 END) as power_users
FROM user_scores;

-- Viral coefficient
SELECT 
  AVG(reviews_given) as avg_reviews_per_user,
  AVG(reviews_received) as avg_reviews_received
FROM user_scores
WHERE score_unlocked = TRUE;

-- Fraud rate
SELECT 
  COUNT(*) as total_reviews,
  SUM(CASE WHEN is_flagged THEN 1 ELSE 0 END) as flagged_reviews,
  (SUM(CASE WHEN is_flagged THEN 1 ELSE 0 END) / COUNT(*)) * 100 as fraud_rate
FROM reviews;
```

---

## 🔄 BACKGROUND PROCESSES

### 1. Score Calculation (Cron Job)

**Frequency:** Every 5 minutes

**Process:**
```javascript
// backend/jobs/calculateScores.js
1. Find users with new reviews since last calculation
2. For each user:
   a. Fetch all reviews for reviewee_id
   b. Apply time decay weights
   c. Remove outliers (top/bottom 10% if 10+ reviews)
   d. Calculate category averages
   e. Calculate weighted overall score
   f. Determine percentile
   g. Assign badge (preliminary/reliable/verified)
   h. Update user_scores table
3. Check if score_unlocked threshold met (3 reviews given)
4. Trigger notification if newly unlocked
```

**SQL:**
```sql
-- Recalculate scores
UPDATE user_scores us
SET 
  reviews_received = (SELECT COUNT(*) FROM reviews WHERE reviewee_id = us.linkedin_profile_id),
  technical_avg = (SELECT AVG(technical_rating) FROM reviews WHERE reviewee_id = us.linkedin_profile_id),
  communication_avg = (SELECT AVG(communication_rating) FROM reviews WHERE reviewee_id = us.linkedin_profile_id),
  teamwork_avg = (SELECT AVG(teamwork_rating) FROM reviews WHERE reviewee_id = us.linkedin_profile_id),
  leadership_avg = (SELECT AVG(leadership_rating) FROM reviews WHERE reviewee_id = us.linkedin_profile_id),
  overall_score = (
    (SELECT AVG(technical_rating) FROM reviews WHERE reviewee_id = us.linkedin_profile_id) * 0.30 +
    (SELECT AVG(communication_rating) FROM reviews WHERE reviewee_id = us.linkedin_profile_id) * 0.25 +
    (SELECT AVG(teamwork_rating) FROM reviews WHERE reviewee_id = us.linkedin_profile_id) * 0.25 +
    (SELECT AVG(leadership_rating) FROM reviews WHERE reviewee_id = us.linkedin_profile_id) * 0.20
  ),
  last_calculated = NOW()
WHERE linkedin_profile_id IN (
  SELECT DISTINCT reviewee_id FROM reviews WHERE created_at > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
);
```

---

### 2. Fraud Detection (Cron Job)

**Frequency:** Every 15 minutes

**Process:**
```javascript
// backend/jobs/detectFraud.js
1. Check for outlier ratings (> 2 std deviations)
2. Detect mutual boosting (A reviews B, B reviews A within 24h)
3. Identify spam patterns (same reviewer, multiple reviews in short time)
4. Check time overlap (< 3 months = suspicious)
5. Flag suspicious patterns
6. Insert into fraud_flags table
7. If severity = 'high', auto-suspend review
8. Notify admin for manual review
```

**Detection rules:**
```javascript
// Outlier detection
if (rating > avg + 2*stddev || rating < avg - 2*stddev) {
  flag('outlier', 'medium');
}

// Mutual boosting
if (userAReviewedUserB && userBReviewedUserA && timeDiff < 24h) {
  if (bothRatings > 4.5) {
    flag('mutual_boost', 'high');
  }
}

// Spam detection
if (reviewerSubmittedMoreThan10ReviewsInLast24h) {
  flag('spam', 'high');
}

// Short overlap
if (timeOverlapMonths < 3) {
  flag('short_overlap', 'low');
}
```

---

### 3. Email Queue Processor

**Frequency:** Every 1 minute

**Process:**
```javascript
// backend/jobs/processEmailQueue.js
1. SELECT * FROM notification_queue WHERE status = 'pending' AND scheduled_for <= NOW() LIMIT 100
2. For each notification:
   a. Fetch user data
   b. Render email template
   c. Send via email service
   d. Update status to 'sent'
   e. Insert into notification_log
3. Handle failures:
   - Retry up to 3 times
   - Exponential backoff
   - Mark as 'failed' after 3 attempts
```

---

## 🔐 DATA SECURITY & PRIVACY

### Sensitive Data

**Encrypted at rest:**
- OAuth tokens
- Email addresses
- User feedback

**Access control:**
- Reviewers are anonymous
- Users can't see who reviewed them
- Only aggregated scores visible

**GDPR Compliance:**
- Right to access: Export user data
- Right to deletion: Cascade delete user + reviews
- Right to rectification: Update profile data

---

## 📊 Database Indexes

**Critical indexes for performance:**

```sql
-- Fast colleague matching
CREATE INDEX idx_company_connections ON company_connections(profile_id, company_name, is_current);

-- Fast review lookups
CREATE INDEX idx_reviews_reviewee ON reviews(reviewee_id, created_at);
CREATE INDEX idx_reviews_reviewer ON reviews(reviewer_id, created_at);

-- Fast score queries
CREATE INDEX idx_user_scores_unlocked ON user_scores(score_unlocked, overall_score);

-- Fast assignment checks
CREATE INDEX idx_assignments_unique ON review_assignments(user_id, colleague_id, status);
```

---

## 🚀 Scaling Considerations

### Current Setup (MVP)
- Single Cloud SQL instance
- 418K profiles
- Expected: 1K-10K active users
- ~100 reviews/day

### Future Scaling
- Read replicas for score queries
- Redis cache for colleague matching
- Separate analytics database
- CDN for profile images
- Queue service (RabbitMQ/SQS) for emails

---

## ✅ Data Validation Rules

### Review Submission
- ✅ Ratings must be 1.0-5.0
- ✅ Can't review yourself
- ✅ Can't review same person twice
- ✅ Must have worked together (company_connections overlap)
- ✅ Feedback max 1000 characters

### Score Calculation
- ✅ Minimum 3 reviews for score
- ✅ Outliers removed if 10+ reviews
- ✅ Time decay applied to old reviews
- ✅ Recalculated on new review

### Fraud Detection
- ✅ Flag if rating is outlier
- ✅ Flag if mutual boost detected
- ✅ Flag if < 3 months overlap
- ✅ Auto-suspend if severity = 'critical'

---

## 📝 Summary Checklist

### Database Tables (17 total)
- [x] 1. `companies` - Company data
- [x] 2. `linkedin_profiles` - Profile data from Bright Data
- [x] 3. `work_experience` - Work history
- [x] 4. `education` - Education history
- [x] 5. `certifications` - Certifications
- [x] 6. `company_connections` - Who worked where
- [x] 7. `users` - App users (OAuth)
- [x] 8. `oauth_tokens` - LinkedIn tokens
- [x] 9. `review_sessions` - Review sessions
- [x] 10. `review_assignments` - Colleague assignments
- [x] 11. `reviews` - Submitted reviews
- [x] 12. `user_scores` - Calculated scores
- [x] 13. `fraud_flags` - Fraud detection
- [x] 14. `admin_actions` - Moderation log
- [x] 15. `notification_queue` - Emails to send
- [x] 16. `notification_log` - Sent emails
- [x] 17. `analytics_events` - User actions

### Data Integrations
- [x] Bright Data → LinkedIn profiles
- [x] LinkedIn OAuth → User authentication
- [x] Frontend → Reviews & ratings
- [x] Email service → Notifications
- [x] Analytics → Metrics tracking

### Background Jobs
- [x] Score calculation (every 5 min)
- [x] Fraud detection (every 15 min)
- [x] Email queue processor (every 1 min)

---

**Next Steps:**
1. Run `complete-schema.sql` on Cloud SQL
2. Update import script for new tables
3. Implement API endpoints
4. Build background jobs
5. Test end-to-end flow
