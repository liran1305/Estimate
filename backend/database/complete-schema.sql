-- ============================================================================
-- ESTIMATENOW COMPLETE DATABASE SCHEMA
-- ============================================================================
-- This schema includes all tables for:
-- - LinkedIn profile data (from Bright Data)
-- - User authentication (OAuth)
-- - Review system
-- - Scoring & analytics
-- - Fraud detection
-- - Notifications
-- ============================================================================

-- ============================================================================
-- SECTION 1: COMPANIES & LINKEDIN DATA (from Bright Data)
-- ============================================================================

-- Companies table (extracted from LinkedIn data)
CREATE TABLE IF NOT EXISTS companies (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  linkedin_url VARCHAR(500),
  employee_count INT,
  employee_count_range VARCHAR(50), -- e.g., "5001-10000"
  industry VARCHAR(255),
  headquarters VARCHAR(255),
  founded_year INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_size (employee_count)
);

-- LinkedIn profiles (from Bright Data scraper)
CREATE TABLE IF NOT EXISTS linkedin_profiles (
  id VARCHAR(255) PRIMARY KEY,
  linkedin_id VARCHAR(255) UNIQUE,
  linkedin_num_id BIGINT,
  name VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  position VARCHAR(500),
  about TEXT,
  city VARCHAR(255),
  country_code VARCHAR(10),
  location VARCHAR(255),
  avatar VARCHAR(500),
  banner_image VARCHAR(500),
  current_company_id VARCHAR(255),
  current_company_name VARCHAR(255),
  followers INT DEFAULT 0,
  connections INT DEFAULT 0,
  default_avatar BOOLEAN DEFAULT FALSE,
  memorialized_account BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_name (name),
  INDEX idx_email (email),
  INDEX idx_linkedin_id (linkedin_id),
  INDEX idx_current_company (current_company_name),
  FOREIGN KEY (current_company_id) REFERENCES companies(id) ON DELETE SET NULL
);

-- Work experience (from LinkedIn profiles)
CREATE TABLE IF NOT EXISTS work_experience (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  company_id VARCHAR(255),
  title VARCHAR(500),
  description TEXT,
  start_date VARCHAR(50),
  end_date VARCHAR(50),
  location VARCHAR(255),
  duration VARCHAR(100),
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_profile (profile_id),
  INDEX idx_company (company),
  INDEX idx_current (is_current),
  FOREIGN KEY (profile_id) REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

-- Education (from LinkedIn profiles)
CREATE TABLE IF NOT EXISTS education (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id VARCHAR(255) NOT NULL,
  title VARCHAR(500),
  degree VARCHAR(255),
  field VARCHAR(255),
  start_year INT,
  end_year INT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_profile (profile_id),
  FOREIGN KEY (profile_id) REFERENCES linkedin_profiles(id) ON DELETE CASCADE
);

-- Certifications (from LinkedIn profiles)
CREATE TABLE IF NOT EXISTS certifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id VARCHAR(255) NOT NULL,
  title VARCHAR(500),
  subtitle VARCHAR(500),
  credential_id VARCHAR(255),
  credential_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_profile (profile_id),
  FOREIGN KEY (profile_id) REFERENCES linkedin_profiles(id) ON DELETE CASCADE
);

-- Company connections (tracks who worked where and when)
CREATE TABLE IF NOT EXISTS company_connections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  company_id VARCHAR(255),
  worked_from VARCHAR(50),
  worked_to VARCHAR(50),
  is_current BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_profile (profile_id),
  INDEX idx_company (company_name),
  INDEX idx_current (is_current),
  UNIQUE KEY unique_connection (profile_id, company_name, worked_from),
  FOREIGN KEY (profile_id) REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE SET NULL
);

-- ============================================================================
-- SECTION 2: USER AUTHENTICATION & APP USERS
-- ============================================================================

-- App users (authenticated via LinkedIn OAuth)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  linkedin_profile_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar VARCHAR(500),
  linkedin_url VARCHAR(500),
  account_status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
  email_verified BOOLEAN DEFAULT FALSE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  -- Profile matching fields
  profile_match_method ENUM('linkedin_id', 'email', 'not_found') NULL,
  profile_match_confidence DECIMAL(3,2) CHECK (profile_match_confidence BETWEEN 0 AND 1),
  profile_matched_at TIMESTAMP NULL,
  can_use_platform BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_linkedin_profile (linkedin_profile_id),
  INDEX idx_can_use (can_use_platform),
  FOREIGN KEY (linkedin_profile_id) REFERENCES linkedin_profiles(id) ON DELETE SET NULL
);

-- OAuth tokens (store LinkedIn access tokens)
CREATE TABLE IF NOT EXISTS oauth_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  provider ENUM('linkedin') DEFAULT 'linkedin',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type VARCHAR(50),
  expires_at TIMESTAMP,
  scope TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- SECTION 3: REVIEW SYSTEM
-- ============================================================================

-- Review sessions (track user review sessions)
CREATE TABLE IF NOT EXISTS review_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  skip_budget INT DEFAULT 0,
  skips_used INT DEFAULT 0,
  reviews_completed INT DEFAULT 0,
  status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Review assignments (track which colleagues are assigned to review)
CREATE TABLE IF NOT EXISTS review_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  colleague_id VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  company_context ENUM('current', 'previous') DEFAULT 'previous',
  time_overlap_months INT,
  match_score DECIMAL(5,2),
  status ENUM('assigned', 'skipped', 'reviewed') DEFAULT 'assigned',
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  actioned_at TIMESTAMP NULL,
  INDEX idx_session (session_id),
  INDEX idx_user (user_id),
  INDEX idx_colleague (colleague_id),
  INDEX idx_status (status),
  UNIQUE KEY unique_assignment (user_id, colleague_id),
  FOREIGN KEY (session_id) REFERENCES review_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (colleague_id) REFERENCES linkedin_profiles(id) ON DELETE CASCADE
);

-- Reviews (submitted peer reviews)
CREATE TABLE IF NOT EXISTS reviews (
  id VARCHAR(255) PRIMARY KEY,
  reviewer_id VARCHAR(255) NOT NULL,
  reviewee_id VARCHAR(255) NOT NULL,
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
  INDEX idx_reviewer (reviewer_id),
  INDEX idx_reviewee (reviewee_id),
  INDEX idx_company (company_name),
  INDEX idx_created (created_at),
  UNIQUE KEY unique_review (reviewer_id, reviewee_id),
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewee_id) REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (assignment_id) REFERENCES review_assignments(id) ON DELETE SET NULL
);

-- ============================================================================
-- SECTION 4: SCORING & ANALYTICS
-- ============================================================================

-- User scores (calculated and cached)
CREATE TABLE IF NOT EXISTS user_scores (
  user_id VARCHAR(255) PRIMARY KEY,
  linkedin_profile_id VARCHAR(255) UNIQUE,
  reviews_received INT DEFAULT 0,
  reviews_given INT DEFAULT 0,
  score_unlocked BOOLEAN DEFAULT FALSE,
  overall_score DECIMAL(3,2) CHECK (overall_score BETWEEN 0 AND 5.0),
  display_score INT CHECK (display_score BETWEEN 0 AND 100),
  technical_avg DECIMAL(3,2),
  communication_avg DECIMAL(3,2),
  teamwork_avg DECIMAL(3,2),
  leadership_avg DECIMAL(3,2),
  percentile INT CHECK (percentile BETWEEN 0 AND 100),
  badge ENUM('none', 'preliminary', 'reliable', 'verified') DEFAULT 'none',
  last_calculated TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_score (overall_score),
  INDEX idx_percentile (percentile),
  INDEX idx_unlocked (score_unlocked),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (linkedin_profile_id) REFERENCES linkedin_profiles(id) ON DELETE SET NULL
);

-- Analytics events (track user actions)
CREATE TABLE IF NOT EXISTS analytics_events (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255),
  event_type VARCHAR(100) NOT NULL,
  event_data JSON,
  session_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_event_type (event_type),
  INDEX idx_created (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- ============================================================================
-- SECTION 5: FRAUD DETECTION & MODERATION
-- ============================================================================

-- Fraud flags (anti-gaming detection)
CREATE TABLE IF NOT EXISTS fraud_flags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  review_id VARCHAR(255),
  user_id VARCHAR(255),
  flag_type ENUM('outlier', 'mutual_boost', 'spam', 'short_overlap', 'suspicious_pattern') NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  details TEXT,
  auto_detected BOOLEAN DEFAULT TRUE,
  flagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP NULL,
  status ENUM('pending', 'confirmed', 'dismissed') DEFAULT 'pending',
  action_taken ENUM('none', 'warning', 'review_removed', 'account_suspended'),
  INDEX idx_review (review_id),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_severity (severity),
  FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Admin actions (moderation log)
CREATE TABLE IF NOT EXISTS admin_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_user_id VARCHAR(255) NOT NULL,
  action_type ENUM('review_removed', 'user_suspended', 'flag_reviewed', 'score_recalculated', 'data_corrected') NOT NULL,
  target_type ENUM('user', 'review', 'flag', 'score'),
  target_id VARCHAR(255),
  reason TEXT,
  details JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_admin (admin_user_id),
  INDEX idx_action_type (action_type),
  INDEX idx_created (created_at)
);

-- ============================================================================
-- SECTION 6: NOTIFICATIONS
-- ============================================================================

-- Notification queue (emails to send)
CREATE TABLE IF NOT EXISTS notification_queue (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  notification_type ENUM('score_unlocked', 'new_review', 'milestone', 'review_request', 'weekly_digest') NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  template_name VARCHAR(100),
  template_data JSON,
  priority ENUM('low', 'normal', 'high') DEFAULT 'normal',
  status ENUM('pending', 'sent', 'failed', 'cancelled') DEFAULT 'pending',
  scheduled_for TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP NULL,
  error_message TEXT,
  retry_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_scheduled (scheduled_for),
  INDEX idx_type (notification_type),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notification log (track sent notifications)
CREATE TABLE IF NOT EXISTS notification_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  queue_id BIGINT,
  user_id VARCHAR(255) NOT NULL,
  notification_type VARCHAR(100),
  email VARCHAR(255),
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  opened_at TIMESTAMP NULL,
  clicked_at TIMESTAMP NULL,
  INDEX idx_user (user_id),
  INDEX idx_sent (sent_at),
  INDEX idx_type (notification_type),
  FOREIGN KEY (queue_id) REFERENCES notification_queue(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- SECTION 7: SYSTEM METADATA
-- ============================================================================

-- Schema version tracking
CREATE TABLE IF NOT EXISTS schema_versions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  version VARCHAR(50) NOT NULL,
  description TEXT,
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial version
INSERT INTO schema_versions (version, description) 
VALUES ('1.0.0', 'Initial complete schema with all tables');
