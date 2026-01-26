# EstimateNow Data Structures - Single Source of Truth

**Last Updated:** 2026-01-14  
**Database:** MySQL (Cloud SQL)  
**Total Profiles:** 512,000+ Israeli LinkedIn profiles

---

## 📊 Core Data Tables

### 1. `linkedin_profiles` - Profile Data (512K records)
**Source:** Bright Data LinkedIn scraper  
**Purpose:** Store all LinkedIn profile information

```sql
CREATE TABLE linkedin_profiles (
  id VARCHAR(255) PRIMARY KEY,              -- LinkedIn profile ID (e.g., "liran-naim")
  linkedin_id VARCHAR(255) UNIQUE,          -- Alternative LinkedIn ID
  linkedin_num_id BIGINT,                   -- Numeric LinkedIn ID
  name VARCHAR(255) NOT NULL,               -- Full name
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  position VARCHAR(500),                    -- Current job title (CAN BE NULL)
  about TEXT,
  city VARCHAR(255),
  country_code VARCHAR(10),                 -- "IL" for Israel
  location VARCHAR(255),
  avatar VARCHAR(500),                      -- Profile photo URL
  banner_image VARCHAR(500),
  current_company_id VARCHAR(255),
  current_company_name VARCHAR(255),        -- Current employer (CAN BE NULL)
  followers INT DEFAULT 0,
  connections INT DEFAULT 0,
  default_avatar BOOLEAN DEFAULT FALSE,     -- LinkedIn's default avatar flag
  memorialized_account BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Key Notes:**
- ✅ `position` and `current_company_name` CAN BE NULL (93.95K profiles have null position)
- ✅ `default_avatar = TRUE` means LinkedIn flagged as low-quality profile
- ✅ Primary key is `id` (LinkedIn profile slug)

---

### 2. `work_experience` - Employment History
**Purpose:** Store all work experience entries for matching colleagues

```sql
CREATE TABLE work_experience (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id VARCHAR(255) NOT NULL,         -- FK to linkedin_profiles.id
  company VARCHAR(255) NOT NULL,            -- Company name
  company_id VARCHAR(255),                  -- Company LinkedIn ID
  title VARCHAR(500),                       -- Job title
  description TEXT,
  start_date VARCHAR(50),                   -- Format: "Jan 2022" or "2022" (CAN BE EMPTY)
  end_date VARCHAR(50),                     -- Format: "Present" or "Jan 2024" (CAN BE EMPTY)
  location VARCHAR(255),
  duration VARCHAR(100),                    -- Format: "3 years 10 months" (CAN BE EMPTY)
  is_current BOOLEAN DEFAULT FALSE,         -- TRUE if still working there
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES linkedin_profiles(id) ON DELETE CASCADE
);
```

**Key Notes:**
- ⚠️ **Date Formats Vary:**
  - Some profiles have `start_date` and `end_date` (e.g., "Jan 2022", "Present")
  - Some profiles ONLY have `duration` (e.g., "3 years 10 months")
  - Some profiles have NEITHER (empty strings)
- ✅ `is_current = TRUE` means currently employed at this company
- ✅ Used to populate `company_connections` table

---

### 3. `company_connections` - Colleague Matching Index
**Purpose:** Optimized table for finding colleagues who worked at same companies

```sql
CREATE TABLE company_connections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id VARCHAR(255) NOT NULL,         -- FK to linkedin_profiles.id
  company_name VARCHAR(255) NOT NULL,       -- Company name (normalized)
  company_id VARCHAR(255),
  worked_from VARCHAR(50),                  -- Start date (CAN BE EMPTY)
  worked_to VARCHAR(50),                    -- End date (CAN BE EMPTY)
  is_current BOOLEAN DEFAULT FALSE,         -- Currently working there
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (profile_id) REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  INDEX idx_company (company_name),
  INDEX idx_profile_company (profile_id, company_name)
);
```

**Key Notes:**
- ✅ Derived from `work_experience` table during import
- ✅ Used by colleague matching algorithm
- ⚠️ `worked_from` and `worked_to` CAN BE EMPTY for duration-only profiles

---

### 4. `users` - Registered Users
**Purpose:** Store authenticated users who have logged in via LinkedIn OAuth

```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,              -- UUID generated on first login
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  linkedin_profile_id VARCHAR(255),         -- FK to linkedin_profiles.id (matched profile)
  profile_match_method ENUM('linkedin_id', 'linkedin_num_id', 'image', 'image_multiple', 'name', 'email', 'not_found'),
  profile_match_confidence DECIMAL(3,2),    -- 0.00 to 1.00
  can_use_platform BOOLEAN DEFAULT FALSE,   -- TRUE if matched to Bright Data profile
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (linkedin_profile_id) REFERENCES linkedin_profiles(id) ON DELETE SET NULL
);
```

**Key Notes:**
- ✅ `linkedin_profile_id` is NULL until OAuth matches user to Bright Data profile
- ✅ `can_use_platform = TRUE` only if matched successfully
- ✅ Matching uses facial recognition on profile photos
- ❌ **`is_blocked` column DOES NOT EXIST** (planned for future abuse detection)

---

### 5. `review_sessions` - Review Sessions
**Purpose:** Track each time a user starts reviewing colleagues

```sql
CREATE TABLE review_sessions (
  id VARCHAR(255) PRIMARY KEY,              -- UUID
  user_id VARCHAR(255) NOT NULL,
  skip_budget INT NOT NULL,                 -- Base: 3-13 based on company size
  skips_used INT DEFAULT 0,
  status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Skip Budget Logic (Per-Company):**
Skips are now tracked **per company**, not per session. Each company the user worked at has its own skip budget.

**Initial Budget Formula:** `3 + (employees / 100)`, max 30 skips
- 50 employees: 3 skips
- 500 employees: 8 skips
- 1194 employees (Wix): 14 skips
- 3000+ employees: 30 skips (capped)

**Daily Refresh:**
- Companies with < 1000 employees: +3 skips per day
- Companies with ≥ 1000 employees: +5 skips per day

**Auto-Switch:** When user exhausts all skips for one company, system automatically shows colleagues from the next available company.

---

### 6. `review_assignments` - Skip Tracking (NEW)
**Purpose:** Track which colleagues each user has seen, skipped, or reviewed

```sql
CREATE TABLE review_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  colleague_id VARCHAR(255) NOT NULL,       -- FK to linkedin_profiles.id
  company_name VARCHAR(255),
  company_context ENUM('current', 'previous') DEFAULT 'previous',
  time_overlap_months INT,
  match_score DECIMAL(5,2),
  status ENUM('assigned', 'skipped', 'reviewed') DEFAULT 'assigned',
  skip_count INT DEFAULT 0,                 -- NEW: Tracks how many times user skipped this colleague
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actioned_at TIMESTAMP NULL,
  UNIQUE KEY unique_assignment (user_id, colleague_id),
  FOREIGN KEY (session_id) REFERENCES review_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (colleague_id) REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  INDEX idx_skip_count (user_id, colleague_id, skip_count)
);
```

**Skip Tracking Logic:**
- ✅ **Personal per user** - each user has independent skip counters
- ✅ **First skip:** `skip_count = 1` → Colleague goes to back of queue
- ✅ **Second skip:** `skip_count = 2` → Colleague permanently excluded for that user
- ✅ **Never-skipped colleagues** have priority over once-skipped colleagues

---

### 6b. `user_company_skips` - Per-Company Skip Tracking (NEW)
**Purpose:** Track skip usage per user per company, with daily refresh logic

```sql
CREATE TABLE user_company_skips (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  initial_budget INT NOT NULL DEFAULT 3,    -- Based on company size: 3 + (employees/100), max 30
  skips_used INT DEFAULT 0,
  daily_refresh INT DEFAULT 3,              -- <1000 employees: 3, >=1000 employees: 5
  last_refresh_date DATE,                   -- Track when daily refresh was applied
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_company (user_id, company_name),
  INDEX idx_user (user_id),
  INDEX idx_company (company_name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**How It Works:**
1. When user first sees a colleague from Company X, a record is created with initial_budget based on company size
2. Each skip decrements from that company's budget
3. Daily refresh adds +3 (small companies) or +5 (large companies) to the budget
4. When a company's skips are exhausted, system auto-switches to next available company
5. When ALL companies are exhausted, user sees "Come back tomorrow" message

---

### 7. `reviews` - Submitted Reviews
**Purpose:** Store peer reviews submitted by users

```sql
CREATE TABLE reviews (
  id VARCHAR(255) PRIMARY KEY,              -- UUID
  reviewer_id VARCHAR(255) NOT NULL,        -- FK to users.id
  reviewee_id VARCHAR(255) NOT NULL,        -- FK to linkedin_profiles.id
  assignment_id INT,
  company_name VARCHAR(255),
  company_context ENUM('current', 'previous'),
  interaction_type ENUM('direct_report', 'manager', 'peer', 'cross_team', 'other'),
  technical_rating DECIMAL(2,1) CHECK (technical_rating BETWEEN 1.0 AND 5.0),
  communication_rating DECIMAL(2,1) CHECK (communication_rating BETWEEN 1.0 AND 5.0),
  teamwork_rating DECIMAL(2,1) CHECK (teamwork_rating BETWEEN 1.0 AND 5.0),
  leadership_rating DECIMAL(2,1) CHECK (leadership_rating BETWEEN 1.0 AND 5.0),
  feedback TEXT,
  is_flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewee_id) REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (assignment_id) REFERENCES review_assignments(id) ON DELETE SET NULL
);
```

---

### 8. `user_scores` - Calculated Scores
**Purpose:** Cache calculated professional scores for users

```sql
CREATE TABLE user_scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  linkedin_profile_id VARCHAR(255),
  reviews_received INT DEFAULT 0,
  reviews_given INT DEFAULT 0,
  overall_score DECIMAL(3,2),               -- 1.00 to 5.00
  technical_score DECIMAL(3,2),
  communication_score DECIMAL(3,2),
  teamwork_score DECIMAL(3,2),
  leadership_score DECIMAL(3,2),
  score_unlocked BOOLEAN DEFAULT FALSE,     -- TRUE after giving 3+ reviews
  last_calculated TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (linkedin_profile_id) REFERENCES linkedin_profiles(id) ON DELETE SET NULL
);
```

**Score Unlock Logic:**
- ❌ Score hidden until user gives **3 reviews**
- ✅ After 3 reviews given → `score_unlocked = TRUE`
- ✅ Score recalculated when new reviews received

---

## 🔄 Data Flow & Relationships

### OAuth Login Flow
```
1. User clicks "Sign in with LinkedIn"
2. LinkedIn OAuth redirects back with code
3. Backend fetches LinkedIn profile (name, email, photo)
4. Backend matches photo to linkedin_profiles table (facial recognition)
5. Create/update user in users table
6. Set linkedin_profile_id and can_use_platform = TRUE
7. Return user object to frontend
```

### Colleague Matching Flow
```
1. Get user's work history from company_connections
2. Find all profiles with same company names
3. Calculate time overlap:
   - If both have dates: Calculate exact overlap
   - If both current + no dates: Assume 24 months overlap
   - If one current + no dates: Assume 12 months overlap
   - If neither has dates: Assume 6 months overlap
4. Filter: Keep only colleagues with 6+ months overlap
5. Exclude: Reviewed colleagues and colleagues skipped 2+ times
6. Prioritize: Never-skipped > Once-skipped
7. Sort by overlap months (most overlap first)
8. 70/30 Selection: 70% current company, 30% previous company
   - EXCEPTION: If user skipped 3+ colleagues from current company, force previous company
9. Return selected colleague
```

### Skip Tracking Flow
```
1. User skips colleague → skip_count increments
2. First skip (skip_count = 1):
   - Colleague goes to back of queue
   - Will appear again after all others reviewed
3. Second skip (skip_count = 2):
   - Colleague permanently excluded for this user
   - Other users unaffected (personal counter)
```

---

## 📋 Data Quality Notes

### Profile Completeness
- **418K profiles** with `position` field (original dataset)
- **93.95K profiles** without `position` field (newly imported)
- **Total: 512K profiles**

### Date Format Variations
1. **Full dates:** "Jan 2022" to "Present" (32 FireArc employees)
2. **Duration only:** "3 years 10 months" (12 FireArc employees)
3. **No dates/duration:** Empty strings (17 FireArc employees)

### Overlap Status Categories
- `TIME_OVERLAP`: Both have dates, confirmed overlap
- `LIKELY_OVERLAP_CURRENT`: Both current, duration only
- `UNKNOWN_DATES`: Both current, no dates/duration
- `NO_OVERLAP`: Dates don't overlap

---

## 🚫 Features NOT Yet Implemented

### Abuse Detection (Planned)
**Required columns (NOT in schema yet):**
- `users.is_blocked` BOOLEAN
- `users.blocked_reason` TEXT
- `users.blocked_at` TIMESTAMP

**Logic (commented out in code):**
- Block users who exhaust all skips for 3 consecutive days
- Redirect to Blocked page with contact form

---

## 🔧 Migration History

### 2026-01-14: Skip Tracking
- Added `review_assignments.skip_count` column
- Enables 2-skip-max per colleague per user
- Personal tracking (independent per user)

### 2026-01-14: Data Import
- Imported 93,945 profiles without position field
- Total profiles: 418K → 512K
- FireArc employees: 44 → 62

---

## 📝 Important Rules

1. **Never assume `position` or `current_company_name` exist** - they can be NULL
2. **Never assume dates exist** - check `start_date`, `end_date`, AND `duration`
3. **Skip tracking is personal** - each user has independent counters
4. **Score unlocks at 3 reviews given** - not before
5. **`is_blocked` column does NOT exist** - don't reference it in queries

---

## 🔗 Table Relationships

```
linkedin_profiles (512K)
    ↓ (1:many)
work_experience
    ↓ (derived)
company_connections
    ↓ (used by)
review_assignments
    ↓ (creates)
reviews
    ↓ (aggregates to)
user_scores

users
    ↓ (1:1)
linkedin_profiles (via linkedin_profile_id)
    ↓ (1:many)
review_sessions
    ↓ (1:many)
review_assignments
    ↓ (1:many)
reviews
```

---

**End of Data Structures Documentation**
