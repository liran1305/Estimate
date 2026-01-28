# Estimate Platform - Complete Database Schema

## Overview
This document is the **single source of truth** for all database tables, fields, and data structures.

**Last Updated:** January 28, 2026

---

## Review Data Structure

### Two Review Tables (IMPORTANT!)

The platform has **two review tables** that must BOTH be queried for complete data:

| Table | Purpose | Has reviewer_id? | Count |
|-------|---------|------------------|-------|
| `anonymous_reviews` | New anonymous reviews | NO | Privacy by design |
| `reviews` | Legacy reviews | YES | Contains older data |

### Review Score Fields

#### `would_work_again` (1-5 scale)
| Value | Label | Percentage |
|-------|-------|------------|
| 5 | "Absolutely!" | 100% |
| 4 | "Gladly" | 80% |
| 3 | "Sure" | 60% |
| 2 | "Maybe" | 40% |
| 1 | "Prefer not" | 20% |

**Calculation:** `average_score * 20 = percentage`

#### `would_promote` (1-4 scale, only for direct reports)
| Value | Label | Percentage |
|-------|-------|------------|
| 4 | "Already performing above their level" | 100% |
| 3 | "Yes, ready now" | 75% |
| 2 | "Maybe in 1-2 years" | 50% |
| 1 | "Not yet - needs more development" | 25% |

**Calculation:** `(average_score / 4) * 100 = percentage`

**NOTE:** Legacy reviews may have `would_promote = 5` which is invalid. Treat as 4 (max).

#### `scores` (JSON - varies by review version)

**Version 1 (Legacy):** 0-10 scale sliders
```json
{
  "communication": 8,
  "reliability": 9,
  "problem_solving": 7,
  "teamwork": 8,
  "delivers_on_time": 7,
  "easy_to_work_with": 9
}
```

**Version 2 (New Behavioral):** 1-5 scale (mapped to 0-3 internally)
```json
{
  "learns_fast": 5,
  "figures_out": 5,
  "ai_ready": 4,
  "gets_buyin": 3,
  "owns_it": 5,
  "wants_tough": 4,
  "recruits_top": 3,
  "grows_people": 4
}
```

#### `behavioral_answers` (JSON - Version 2 only)
Internal 0-3 scale for dimension scoring:
```json
{
  "learns_fast": 3,
  "figures_out": 3,
  "ai_ready": 2,
  "gets_buyin": 2,
  "owns_it": 3
}
```

#### `high_signal_answers` (JSON - Version 2 only)
```json
{
  "work_again": 5,
  "startup_hire": 3,
  "harder_job": 4
}
```

---

## All Tables

### 1. `users`
Primary user accounts linked to LinkedIn profiles.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar(255) PK | UUID |
| linkedin_profile_id | varchar(255) | FK to linkedin_profiles.id |
| email | varchar(255) | User email |
| name | varchar(255) | Display name |
| avatar | varchar(500) | Profile photo URL |
| reviews_given_count | int | Total reviews given |
| reviews_given_today | int | Daily limit tracking |

### 2. `linkedin_profiles`
LinkedIn profile data (512K+ profiles).

| Column | Type | Description |
|--------|------|-------------|
| id | varchar(255) PK | LinkedIn profile slug |
| linkedin_id | varchar(255) | LinkedIn public ID |
| name | varchar(255) | Full name |
| position | varchar(500) | Current job title |
| current_company_name | varchar(255) | Current employer |
| avatar | varchar(500) | Profile photo URL |

### 3. `user_scores`
Cached aggregate scores for users.

| Column | Type | Description |
|--------|------|-------------|
| user_id | varchar(255) PK | FK to users.id |
| linkedin_profile_id | varchar(255) | FK to linkedin_profiles.id |
| reviews_received | int | Total reviews received |
| reviews_given | int | Total reviews given |
| score_unlocked | tinyint(1) | Has unlocked their score |
| overall_score | decimal(4,2) | 0-10 scale |
| display_score | int | 0-100 scale |
| percentile | int | Percentile rank |
| badge | enum | none/preliminary/reliable/verified |
| **startup_hire_pct** | int | % would recruit to startup |
| **harder_job_pct** | int | % would promote |
| **work_again_absolutely_pct** | int | % would work with again |

### 4. `dimension_scores`
Per-dimension scores for behavioral assessment.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar(255) PK | UUID |
| linkedin_profile_id | varchar(255) | FK to linkedin_profiles.id |
| dimension | varchar(50) | Dimension key |
| level | varchar(20) | very_high/strong/moderate/developing |
| percentile | int | Percentile for this dimension |
| raw_score | decimal(4,2) | 0-3 scale |
| review_count | int | Reviews contributing to this score |

### 5. `anonymous_reviews`
New anonymous reviews (no reviewer tracking).

| Column | Type | Description |
|--------|------|-------------|
| id | varchar(255) PK | UUID |
| reviewee_id | varchar(255) | FK to linkedin_profiles.id |
| company_name | varchar(255) | Company context |
| interaction_type | enum | direct_report/manager/peer/cross_team/other |
| scores | json | Score data (varies by version) |
| would_work_again | int | 1-5 scale |
| would_promote | int | 1-4 scale |
| behavioral_answers | json | Version 2 behavioral data |
| high_signal_answers | json | Version 2 high-signal data |
| review_version | int | 1 or 2 |
| strength_tags | json | Selected strength tags |
| optional_comment | text | Free-form feedback |

### 6. `reviews` (Legacy)
Legacy reviews with reviewer tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar(255) PK | UUID |
| reviewer_id | varchar(255) | FK to users.id |
| reviewee_id | varchar(255) | FK to linkedin_profiles.id |
| scores | json | Score data |
| would_work_again | int | 1-5 scale |
| would_promote | int | 1-4 scale (may have invalid 5) |
| behavioral_answers | json | Version 2 only |
| high_signal_answers | json | Version 2 only |
| review_version | int | 1 or 2 |

### 7. `request_tokens`
Token system for review requests.

| Column | Type | Description |
|--------|------|-------------|
| id | int PK | Auto-increment |
| user_id | varchar(255) | FK to users.id |
| tokens_available | int | Available request tokens |
| tokens_earned_total | int | Total earned (5 reviews = 1 token) |
| tokens_used_total | int | Total used |

### 8. `review_requests`
Direct review request links.

| Column | Type | Description |
|--------|------|-------------|
| id | int PK | Auto-increment |
| requester_id | varchar(255) | FK to users.id |
| unique_link | varchar(64) | Shareable link ID |
| status | enum | pending/completed/expired/cancelled |
| expires_at | timestamp | Link expiration |

### 9. `review_sessions`
Review session tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar(255) PK | UUID |
| user_id | varchar(255) | FK to users.id |
| skip_budget | int | Allowed skips |
| skips_used | int | Skips used |
| reviews_completed | int | Reviews completed in session |
| status | enum | active/completed/abandoned |

### 10. `review_assignments`
Colleague matching for reviews.

| Column | Type | Description |
|--------|------|-------------|
| id | int PK | Auto-increment |
| session_id | varchar(255) | FK to review_sessions.id |
| user_id | varchar(255) | Reviewer |
| colleague_id | varchar(255) | Reviewee |
| company_name | varchar(255) | Shared company |
| status | enum | pending/assigned/skipped/reviewed |

### 11. `work_experience`
LinkedIn work history (1.2M+ entries).

| Column | Type | Description |
|--------|------|-------------|
| id | int PK | Auto-increment |
| profile_id | varchar(255) | FK to linkedin_profiles.id |
| company | varchar(255) | Company name |
| title | varchar(500) | Job title |
| is_current | tinyint(1) | Currently employed |

### 12. `company_connections`
Company-based colleague connections.

| Column | Type | Description |
|--------|------|-------------|
| id | int PK | Auto-increment |
| profile_id | varchar(255) | FK to linkedin_profiles.id |
| company_name | varchar(255) | Company name |
| location | varchar(255) | Work location (city/branch) |
| is_current | tinyint(1) | Currently employed |
| is_excluded | tinyint(1) | Excluded from matching |

**NOTE:** Location is critical for large companies with multiple branches (e.g., Bank Discount, Shufersal). Colleagues are prioritized by location match score.

### 13. `companies`
Company metadata.

| Column | Type | Description |
|--------|------|-------------|
| id | varchar(255) PK | Company slug |
| name | varchar(255) | Company name |
| industry | varchar(255) | Industry category |
| employee_count | int | Employee count |

---

## Key Relationships

```
users.linkedin_profile_id → linkedin_profiles.id
user_scores.linkedin_profile_id → linkedin_profiles.id
dimension_scores.linkedin_profile_id → linkedin_profiles.id
anonymous_reviews.reviewee_id → linkedin_profiles.id
reviews.reviewee_id → linkedin_profiles.id
reviews.reviewer_id → users.id
work_experience.profile_id → linkedin_profiles.id
company_connections.profile_id → linkedin_profiles.id
```

---

## Profile Display Metrics

The profile page shows three "Colleague Endorsements" metrics:

1. **"Would work with again"** → `work_again_absolutely_pct`
   - Source: `would_work_again` from BOTH review tables
   - Calculation: `(sum of all would_work_again / count) * 20`

2. **"Would recruit to their team"** → `startup_hire_pct`
   - Source: `would_promote` from BOTH review tables
   - Calculation: `(sum of all would_promote / count / 4) * 100`

3. **"Want on tough projects"** → `harder_job_pct`
   - Source: Same as startup_hire_pct (currently)
   - TODO: Should come from `wants_tough` in behavioral scores

---

## Data Aggregation Rules

When calculating scores, ALWAYS query BOTH tables:

```sql
SELECT would_work_again, would_promote 
FROM anonymous_reviews WHERE reviewee_id = ?
UNION ALL
SELECT would_work_again, would_promote 
FROM reviews WHERE reviewee_id = ?
```

**Important:** The `dimensionScoring.js` service currently only queries `anonymous_reviews`. This is a BUG that needs to be fixed.
