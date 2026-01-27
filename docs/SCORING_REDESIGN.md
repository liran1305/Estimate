# Estimate Scoring System Redesign

## Overview

This document outlines the migration from numeric 1-10 slider scores to a qualitative behavioral assessment system focused on "future-fit" skills.

## Current System Analysis

### What We Have Now
- **8 skill sliders** (1-10 scale): communication, reliability, problem_solving, teamwork, etc.
- **Strength tags**: 30+ tags like "Reliable", "Quick Learner", "Problem Solver"
- **Would Work Again**: 5-point emoji scale (😬 to 🤩)
- **Would Promote**: 4-point scale (for direct reports only)
- **Overall Score**: Weighted average stored as decimal (e.g., 7.8)
- **~15 users** with existing reviews

### Database Tables Affected
- `anonymous_reviews.scores` (JSON) - stores slider scores
- `anonymous_reviews.overall_score` (DECIMAL) - weighted average
- `anonymous_reviews.strength_tags` (JSON) - selected tags
- `user_scores.overall_score` (DECIMAL) - aggregated score
- `user_scores.badge` (VARCHAR) - current badge

---

## New System Design

### The 5 Future-Fit Dimensions

| Dimension | Key | Description | Maps From Old |
|-----------|-----|-------------|---------------|
| **Picks Things Up Fast** | `learns_fast` | Learns new tools, processes, skills quicker than most | quick_learner, adaptable |
| **Figures It Out** | `figures_out` | Moves forward when requirements are unclear | problem_solving, takes_ownership |
| **AI-Ready** | `ai_ready` | Uses AI tools effectively, knows when to trust them | NEW |
| **Gets People On Board** | `gets_buyin` | Convinces and aligns others without authority | communication, teamwork |
| **Owns It** | `owns_it` | Takes responsibility, catches problems early | reliability, takes_ownership |

### Behavioral Questions (Replace Sliders)

Each dimension has 1-2 behavioral questions with multiple choice answers:

```javascript
const behavioralQuestions = {
  learns_fast: {
    question: "When a new tool or process was introduced, [Name] typically...",
    options: [
      { value: 1, label: "Waited to be trained" },
      { value: 2, label: "Explored it independently" },
      { value: 3, label: "Became the go-to person for others" },
      { value: 0, label: "Resisted until forced" }
    ]
  },
  figures_out: {
    question: "When requirements were unclear or changing, [Name]...",
    options: [
      { value: 0, label: "Got frustrated and waited for clarity" },
      { value: 1, label: "Asked questions then made reasonable assumptions" },
      { value: 3, label: "Created clarity for the team" },
      { value: 0, label: "Escalated immediately" }
    ]
  },
  ai_ready: {
    question: "Does [Name] effectively use AI tools in their work?",
    options: [
      { value: 0, label: "No / Rarely" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Regularly" },
      { value: 3, label: "Power user" }
    ]
  },
  ai_trust: {
    question: "When AI tools produce output, [Name] typically...",
    options: [
      { value: 0, label: "Accepts as-is" },
      { value: 2, label: "Reviews before using" },
      { value: 3, label: "Knows exactly when to trust vs verify" }
    ]
  },
  gets_buyin: {
    question: "Can [Name] get agreement from people who don't report to them?",
    options: [
      { value: 0, label: "Rarely" },
      { value: 1, label: "Sometimes" },
      { value: 2, label: "Usually" },
      { value: 3, label: "Almost always" }
    ]
  },
  owns_it: {
    question: "If something fell through the cracks that was partially [Name]'s responsibility...",
    options: [
      { value: 0, label: "Would point out it wasn't clearly theirs" },
      { value: 2, label: "Would catch it before it became a problem" },
      { value: 3, label: "Would fix it and suggest process improvements" }
    ]
  }
};
```

### High-Signal Questions (Keep Prominent)

```javascript
const highSignalQuestions = {
  harder_job: {
    question: "Would you want [Name] on your team if things got 50% harder next month?",
    options: [
      { value: 1, label: "Definitely not" },
      { value: 2, label: "Probably not" },
      { value: 3, label: "Maybe" },
      { value: 4, label: "Definitely yes" }
    ],
    weight: 2.0
  },
  startup_hire: {
    question: "If you were starting a company, would you try to hire [Name]?",
    options: [
      { value: 1, label: "No" },
      { value: 2, label: "Maybe for a specific role" },
      { value: 3, label: "Yes, they're a multiplier" }
    ],
    weight: 2.0
  },
  work_again: {
    // Keep existing 5-point emoji scale
    weight: 1.5
  }
};
```

### New Strength Tags

```javascript
const newStrengthTags = {
  // Keep
  brings_solutions: { label: "Brings Solutions", icon: "💡" },
  gets_things_done: { label: "Gets Things Done", icon: "🛠️" },
  owns_mistakes: { label: "Admits When Wrong", icon: "🙋" },
  
  // Add
  learns_crazy_fast: { label: "Learns Crazy Fast", icon: "🚀" },
  thrives_in_chaos: { label: "Thrives in Chaos", icon: "🌊" },
  ai_power_user: { label: "AI Power User", icon: "🤖" },
  cuts_through_noise: { label: "Cuts Through Noise", icon: "🎯" },
  unblocks_others: { label: "Unblocks Others", icon: "⚡" },
  thinks_ahead: { label: "Thinks Ahead", icon: "🔮" },
  
  // Remove (too generic)
  // low_drama, organized, reliable
};
```

### New Free-Text Question

```javascript
const freeTextQuestion = {
  key: "never_worry_about",
  prompt: "Working with [Name], I never had to worry about ___",
  maxLength: 100,
  examples: ["deadlines", "quality", "communication", "follow-through"]
};
```

---

## Database Schema Changes

### New Table: `dimension_scores`

```sql
CREATE TABLE dimension_scores (
  id VARCHAR(36) PRIMARY KEY,
  linkedin_profile_id VARCHAR(255) NOT NULL,
  dimension VARCHAR(50) NOT NULL,  -- learns_fast, figures_out, ai_ready, gets_buyin, owns_it
  level VARCHAR(20) NOT NULL,       -- very_high, strong, moderate, developing
  percentile INT,                   -- 10, 15, 20, 25, etc.
  review_count INT DEFAULT 0,
  raw_score DECIMAL(5,2),           -- Internal calculation
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_profile_dimension (linkedin_profile_id, dimension),
  INDEX idx_dimension (dimension),
  INDEX idx_level (level)
);
```

### Modify `anonymous_reviews`

```sql
-- Add new columns (keep old for migration)
ALTER TABLE anonymous_reviews ADD COLUMN behavioral_answers JSON;
ALTER TABLE anonymous_reviews ADD COLUMN high_signal_answers JSON;
ALTER TABLE anonymous_reviews ADD COLUMN never_worry_about VARCHAR(200);
ALTER TABLE anonymous_reviews ADD COLUMN review_version INT DEFAULT 1;
-- version 1 = old slider system, version 2 = new behavioral system
```

### Modify `user_scores`

```sql
-- Add new columns
ALTER TABLE user_scores ADD COLUMN qualitative_badge VARCHAR(50);  -- highly_adaptable, solid_contributor, growing
ALTER TABLE user_scores ADD COLUMN startup_hire_pct INT;
ALTER TABLE user_scores ADD COLUMN harder_job_pct INT;
ALTER TABLE user_scores ADD COLUMN work_again_pct INT;  -- "Absolutely!" percentage
ALTER TABLE user_scores ADD COLUMN never_worry_about JSON;  -- Aggregated from reviews
```

---

## Scoring Algorithm

### Converting Behavioral Answers to Dimension Levels

```javascript
function calculateDimensionLevel(answers, dimension) {
  // Get all answers for this dimension
  const dimensionAnswers = answers.filter(a => a.dimension === dimension);
  
  // Calculate average score (0-3 scale)
  const avgScore = dimensionAnswers.reduce((sum, a) => sum + a.value, 0) / dimensionAnswers.length;
  
  // Convert to level
  if (avgScore >= 2.5) return { level: 'very_high', percentile: 15 };
  if (avgScore >= 2.0) return { level: 'strong', percentile: 25 };
  if (avgScore >= 1.0) return { level: 'moderate', percentile: 50 };
  return { level: 'developing', percentile: 75 };
}
```

### Calculating Percentiles

```javascript
function calculatePercentile(userScore, allScores) {
  const sorted = allScores.sort((a, b) => b - a);
  const rank = sorted.indexOf(userScore) + 1;
  return Math.round((rank / sorted.length) * 100);
}
```

### Qualitative Badge Assignment

```javascript
function assignQualitativeBadge(dimensionScores, highSignalAnswers) {
  const veryHighCount = dimensionScores.filter(d => d.level === 'very_high').length;
  const strongCount = dimensionScores.filter(d => d.level === 'strong').length;
  
  const startupHirePct = calculatePercentage(highSignalAnswers, 'startup_hire', 3);
  const harderJobPct = calculatePercentage(highSignalAnswers, 'harder_job', 4);
  
  if (veryHighCount >= 3 && startupHirePct >= 70) {
    return 'highly_adaptable';
  } else if (veryHighCount >= 2 || strongCount >= 3) {
    return 'solid_contributor';
  } else {
    return 'growing';
  }
}
```

---

## Migration Strategy

### Phase 1: Database Preparation
1. Add new columns to existing tables
2. Create `dimension_scores` table
3. Keep old columns for backward compatibility

### Phase 2: Map Existing Data
```javascript
const oldToNewMapping = {
  // Old slider → New dimension
  problem_solving: 'figures_out',
  reliability: 'owns_it',
  takes_ownership: 'owns_it',
  communication: 'gets_buyin',
  teamwork: 'gets_buyin',
  
  // Old tags → New tags
  quick_learner: 'learns_crazy_fast',
  problem_solver: 'brings_solutions',
  fast_executor: 'gets_things_done',
  adaptable: 'thrives_in_chaos',
  owns_mistakes: 'owns_mistakes'
};

function migrateOldReview(oldReview) {
  const scores = JSON.parse(oldReview.scores);
  
  // Convert old sliders to dimension estimates
  const dimensionEstimates = {
    learns_fast: null, // No direct mapping, leave null
    figures_out: scores.problem_solving ? (scores.problem_solving / 10) * 3 : null,
    ai_ready: null, // New dimension, no data
    gets_buyin: scores.communication ? ((scores.communication + (scores.teamwork || 5)) / 20) * 3 : null,
    owns_it: scores.reliability ? ((scores.reliability + (scores.takes_ownership || 5)) / 20) * 3 : null
  };
  
  return {
    behavioral_answers: dimensionEstimates,
    high_signal_answers: {
      work_again: oldReview.would_work_again
    },
    review_version: 1 // Mark as migrated from old system
  };
}
```

### Phase 3: Update Frontend
1. Replace slider components with behavioral question cards
2. Update review form flow
3. Update profile display

### Phase 4: Gradual Rollout
1. New reviews use new system (version 2)
2. Profiles show new format, enriched as new reviews come in
3. Old data contributes to partial scores where mappable

---

## Profile Display Changes

### Remove
- Single numeric score (7.8 out of 10)
- Numeric skill bars

### Add
- Qualitative badge with percentile
- 3 key percentages (startup hire, harder job, work again)
- 5 dimension cards with levels
- "You Don't Worry About..." section
- "What Colleagues Actually Said" quotes
- "Room to Grow" (private)

---

## Implementation Order

1. **Database migrations** (add new columns, create tables)
2. **New reviewConfig.js** with behavioral questions
3. **New ReviewFormBehavioral.jsx** component
4. **Backend scoring algorithm** updates
5. **Profile display** updates
6. **Migration script** for existing users
7. **Testing & validation**

---

## Files to Modify

### Backend
- `backend/routes/anonymousReviews.js` - New scoring logic
- `backend/routes/reviews.js` - Score calculation
- `backend/database/migrations/` - Schema changes

### Frontend
- `src/config/reviewConfig.js` - New questions/dimensions
- `src/components/review/ReviewFormDynamic.jsx` → `ReviewFormBehavioral.jsx`
- `src/pages/Profile.jsx` - New display format
- `src/components/profile/` - New profile components

### New Files
- `src/config/behavioralConfig.js` - New dimension definitions
- `src/components/review/BehavioralQuestion.jsx`
- `src/components/profile/DimensionCard.jsx`
- `src/components/profile/KeyMetrics.jsx`
- `backend/services/dimensionScoring.js`

---

## Timeline Estimate

| Phase | Duration | Description |
|-------|----------|-------------|
| Database prep | 1 day | Migrations, new tables |
| Review form | 2-3 days | New behavioral questions UI |
| Scoring algorithm | 1-2 days | Backend calculation logic |
| Profile display | 2-3 days | New profile components |
| Migration script | 1 day | Convert existing data |
| Testing | 1-2 days | End-to-end validation |

**Total: ~8-12 days**

---

## Questions to Resolve

1. **AI-Ready dimension**: Should this be optional for older reviews/users who haven't used AI?
2. **Percentile calculation**: Calculate against all users or within job title?
3. **Minimum reviews**: How many reviews needed before showing dimension levels?
4. **Private feedback**: How to aggregate "Room to Grow" from reviews?
