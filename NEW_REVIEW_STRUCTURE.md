# New Review Structure - Implementation Guide

## Overview
The review flow has been redesigned to be faster (~90 seconds), more engaging, and provide better signals for recruiters.

## Key Changes

### 1. Reduced Core Skills (8 → 5)
**Old (8 sliders):**
- Technical Skills
- Communication
- Teamwork
- Leadership
- Problem Solving
- Reliability
- Initiative
- Adaptability

**New (5 focused sliders, 1-10 scale):**
1. **Communication Skills** - Clear, effective communication
2. **Reliability & Follow-Through** - Delivers on commitments
3. **Problem-Solving** - Analytical thinking and solutions
4. **Teamwork & Collaboration** - Works well with others
5. **Initiative & Ownership** - Takes action without being asked (with N/A option)

### 2. New Qualitative Elements

#### Strength Tags (Select up to 3)
- 🎯 Reliable
- 💡 Creative Thinker
- 🤝 Team Player
- 📊 Detail-Oriented
- 🔥 High Energy
- 🧘 Calm Under Pressure
- 📣 Great Communicator
- 🎓 Quick Learner
- 🌟 Natural Leader
- 🛠️ Problem Solver

#### "Would Work Again?" (5-point scale)
This is the **strongest signal** for recruiters:
1. 😬 Prefer not
2. 😐 Maybe
3. 🙂 Sure
4. 😊 Gladly
5. 🤩 Absolutely!

#### Optional Comment
One sentence that captures working with this person (e.g., "Always the first to help when deadlines get tight")

## Database Schema

### New Columns in `reviews` table:
```sql
-- 5 Core Skills (1-10 scale)
communication_score INT CHECK (communication_score BETWEEN 1 AND 10)
reliability_score INT CHECK (reliability_score BETWEEN 1 AND 10)
problem_solving_score INT CHECK (problem_solving_score BETWEEN 1 AND 10)
teamwork_score INT CHECK (teamwork_score BETWEEN 1 AND 10)
initiative_score INT CHECK (initiative_score BETWEEN 1 AND 10)
initiative_na BOOLEAN DEFAULT FALSE

-- Qualitative Data
strength_tags JSON  -- Array of up to 3 tags
would_work_again INT CHECK (would_work_again BETWEEN 1 AND 5)
optional_comment TEXT

-- Calculated
overall_score DECIMAL(3,1) CHECK (overall_score BETWEEN 1.0 AND 10.0)
```

## Backend API Changes

### POST `/api/review/submit`

**New Request Body:**
```json
{
  "user_id": "uuid",
  "session_id": "uuid",
  "colleague_id": "profile-id",
  "company_name": "Company Name",
  "interaction_type": "peer|manager|direct_report|cross_team|other",
  
  // 5 Core Skills (1-10)
  "communication_score": 7,
  "reliability_score": 8,
  "problem_solving_score": 6,
  "teamwork_score": 9,
  "initiative_score": 7,
  "initiative_na": false,
  
  // Qualitative Data
  "strength_tags": ["Reliable", "Team Player", "Great Communicator"],
  "would_work_again": 4,  // 1-5 scale
  "optional_comment": "Always the first to help when deadlines get tight"
}
```

**Overall Score Calculation:**
```javascript
const scores = [communication_score, reliability_score, problem_solving_score, teamwork_score];
if (!initiative_na && initiative_score) {
  scores.push(initiative_score);
}
const overall_score = scores.reduce((sum, s) => sum + s, 0) / scores.length;
```

## Frontend Implementation

### Required Changes:

1. **Update Review Component** (`src/pages/Review.jsx`)
   - Replace 8 sliders with 5 new sliders
   - Add strength tags selection (max 3)
   - Add "Would Work Again?" emoji buttons
   - Add optional comment textarea
   - Update submit payload to match new structure

2. **Update ColleagueCard** (`src/components/review/ColleagueCard.jsx`)
   - Update interaction type selection to match new UX
   - Keep existing radio button approach

3. **Styling**
   - Use the HTML mockup provided as reference
   - Maintain Inter font family
   - Use Tailwind CSS classes from mockup

## Migration Strategy

### Phase 1: Database Migration (DONE ✅)
- Created migration SQL file
- Updated backend to accept new fields
- Maintained backward compatibility with old fields

### Phase 2: Backend Deployment (DONE ✅)
- Backend now accepts both old and new review structures
- Calculates overall_score from 5 core skills
- Stores strength_tags as JSON array

### Phase 3: Frontend Update (TODO)
- Implement new UI/UX from HTML mockup
- Update submit payload to use new fields
- Test review flow end-to-end

### Phase 4: Database Cleanup (AFTER FRONTEND DEPLOYED)
- Remove old columns: technical_rating, communication_rating, teamwork_rating, leadership_rating, feedback
- Make new columns required (NOT NULL)

## Benefits

### For Users:
- ✅ Faster review time (~90 seconds vs 2-3 minutes)
- ✅ More engaging (tags, emojis)
- ✅ Less cognitive load (5 vs 8 sliders)
- ✅ Optional comment reduces pressure

### For Recruiters:
- ✅ "Would work again" = strongest hiring signal
- ✅ Strength tags = quick skill snapshot
- ✅ Optional comments = credibility and context
- ✅ More honest feedback (anonymous + easier)

### For Platform:
- ✅ Higher completion rates
- ✅ Better quality data
- ✅ More engaging UX
- ✅ Easier to display on profiles

## Next Steps

1. Run database migration: `mysql < backend/database/migration-new-review-structure.sql`
2. Deploy backend changes (already committed)
3. Update frontend Review component with new UI
4. Test review submission end-to-end
5. Deploy to production
6. Monitor completion rates and feedback quality

## Weighting System (To Be Implemented)

Once we have data, we can implement relationship-based weighting:
- Manager reviews: 1.0 (highest weight)
- Direct Report reviews: 0.95
- Direct Colleague reviews: 0.90
- Cross-Team reviews: 0.70
- Other Professional: 0.50

The "would_work_again" score will be a key factor in the final weighted score.
