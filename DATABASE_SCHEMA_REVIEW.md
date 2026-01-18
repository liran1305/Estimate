# Database Schema Review - January 18, 2026

## Executive Summary

**Status:** ⚠️ **MISALIGNMENT DETECTED**

The database schema in `complete-schema.sql` is **outdated** and does not reflect the current production database structure or the new review system implementation.

---

## Current Production Database (Actual)

### `reviews` Table - Production Schema
```sql
CREATE TABLE reviews (
  id VARCHAR(255) PRIMARY KEY,
  reviewer_id VARCHAR(255) NOT NULL,
  reviewee_id VARCHAR(255) NOT NULL,
  assignment_id INT,
  company_name VARCHAR(255),
  company_context ENUM('current', 'previous'),
  interaction_type ENUM('direct_report', 'manager', 'peer', 'cross_team', 'other'),
  
  -- OLD COLUMNS (deprecated but kept for backward compatibility)
  technical_rating DECIMAL(2,1),
  communication_rating DECIMAL(2,1),
  teamwork_rating DECIMAL(2,1),
  leadership_rating DECIMAL(2,1),
  feedback TEXT,
  
  -- NEW COLUMNS (active, used by current system)
  scores JSON COMMENT 'Dynamic scores object with relationship-specific questions',
  strength_tags JSON COMMENT 'Array of up to 3 selected strength tags',
  would_work_again INT CHECK (would_work_again BETWEEN 1 AND 5),
  would_promote INT CHECK (would_promote BETWEEN 1 AND 4),
  optional_comment TEXT COMMENT 'One sentence about working with this person',
  overall_score DECIMAL(3,1) CHECK (overall_score BETWEEN 1.0 AND 10.0),
  
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_reviewer (reviewer_id),
  INDEX idx_reviewee (reviewee_id),
  INDEX idx_company (company_name),
  INDEX idx_created (created_at),
  INDEX idx_would_work_again (would_work_again),
  INDEX idx_would_promote (would_promote),
  INDEX idx_overall_score (overall_score),
  
  UNIQUE KEY unique_review (reviewer_id, reviewee_id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewee_id) REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (assignment_id) REFERENCES review_assignments(id) ON DELETE SET NULL
);
```

---

## Backend Code Alignment Check

### ✅ **ALIGNED:** Backend Insert Statement
```javascript
// backend/routes/reviews.js:679-699
INSERT INTO reviews 
(id, reviewer_id, reviewee_id, assignment_id, company_name, company_context, 
 interaction_type, scores, strength_tags, would_work_again, would_promote,
 optional_comment, overall_score)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
```

**Status:** ✅ Correctly uses new columns

### ✅ **ALIGNED:** Weighted Scoring Algorithm
```javascript
// backend/routes/reviews.js:632-675
const relationshipWeights = {
  peer: 1.0,
  manager: 0.9,
  direct_report: 1.2,
  cross_team: 0.8,
  other: 0.5
};

const questionWeights = {
  reliability: 1.2,
  receptive_feedback: 1.2
};

// Work again: 1.5x weight
// Would promote: 1.3x weight
```

**Status:** ✅ Matches design specification

### ✅ **ALIGNED:** Frontend Data Structure
```javascript
// src/components/review/ReviewFormDynamic.jsx
const reviewData = {
  scores,                    // Object with relationship-specific scores
  strength_tags: selectedTags,  // Array of tag IDs
  would_work_again: workAgain,  // 1-5 scale
  would_promote: wouldPromote,  // 1-4 scale (direct_report only)
  optional_comment: comment     // String or null
};
```

**Status:** ✅ Matches backend expectations

---

## Issues Found

### ❌ **Issue 1: Outdated Schema Documentation**
**File:** `backend/database/complete-schema.sql`
**Problem:** Does not include new columns (scores, strength_tags, would_work_again, would_promote, optional_comment, overall_score)
**Impact:** Misleading for new developers, doesn't reflect production

### ❌ **Issue 2: user_scores Table Outdated**
**Current Schema:**
```sql
overall_score DECIMAL(3,2) CHECK (overall_score BETWEEN 0 AND 5.0)
technical_avg DECIMAL(3,2)
communication_avg DECIMAL(3,2)
teamwork_avg DECIMAL(3,2)
leadership_avg DECIMAL(3,2)
```

**Should Be:**
```sql
overall_score DECIMAL(3,1) CHECK (overall_score BETWEEN 1.0 AND 10.0)
-- Plus new aggregated fields for relationship-specific scores
```

### ⚠️ **Issue 3: Old Columns Still Present**
**Columns:** technical_rating, communication_rating, teamwork_rating, leadership_rating, feedback
**Status:** Deprecated but kept for backward compatibility
**Recommendation:** Can be removed in future migration after confirming all data migrated

---

## Data Flow Verification

### ✅ Review Submission Flow
1. **Frontend** → Sends `scores` object, `strength_tags`, `would_work_again`, etc.
2. **Backend Validation** → Validates scores (1-10), would_work_again (1-5), would_promote (1-4)
3. **Weighted Calculation** → Applies relationship and question weights
4. **Database Insert** → Stores in new columns as JSON/INT/TEXT
5. **Status:** ✅ **WORKING**

### ⚠️ Score Calculation Flow (Needs Update)
1. **Current:** Uses old columns (technical_avg, communication_avg, etc.)
2. **Should Use:** New `scores` JSON and `overall_score` with weighted calculation
3. **Status:** ⚠️ **NEEDS REFACTORING**

---

## Recommendations

### 1. Update Schema Documentation (HIGH PRIORITY)
Update `complete-schema.sql` to reflect production reality:
- Add new columns
- Mark old columns as deprecated
- Update comments

### 2. Refactor Score Calculation (MEDIUM PRIORITY)
Update the score calculation endpoint to:
- Read from `scores` JSON instead of old columns
- Use `overall_score` with weighted algorithm
- Calculate aggregated metrics from relationship-specific data

### 3. Create Migration Path (LOW PRIORITY)
Plan for eventual removal of old columns:
- Verify no reviews use old structure
- Create backup
- Drop deprecated columns

### 4. Update user_scores Table (MEDIUM PRIORITY)
Add new aggregated fields:
- `avg_work_again` DECIMAL(2,1)
- `promotion_readiness` INT (for users with direct_report reviews)
- `top_strength_tags` JSON
- `scores_by_relationship` JSON

---

## Conclusion

**Current State:**
- ✅ Review submission works correctly with new structure
- ✅ Weighted scoring algorithm implemented
- ✅ Database has all required columns
- ⚠️ Schema documentation outdated
- ⚠️ Score calculation needs refactoring
- ⚠️ Old columns should be deprecated/removed

**Next Steps:**
1. Update `complete-schema.sql` to match production
2. Update `PROJECT_CONTEXT.md` with new review approach
3. Plan score calculation refactoring
4. Test end-to-end review flow in production
