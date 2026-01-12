-- LinkedIn Profiles Database Schema
-- Optimized for 500k+ profiles with fast search capabilities

-- Main profiles table
CREATE TABLE IF NOT EXISTS linkedin_profiles (
  id VARCHAR(255) PRIMARY KEY,
  linkedin_id VARCHAR(255) UNIQUE,
  linkedin_num_id VARCHAR(50),
  name VARCHAR(255) NOT NULL,
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  email VARCHAR(255),
  position VARCHAR(500),
  about TEXT,
  city VARCHAR(255),
  country_code VARCHAR(10),
  location VARCHAR(255),
  avatar TEXT,
  banner_image TEXT,
  current_company_id VARCHAR(255),
  current_company_name VARCHAR(255),
  followers INT DEFAULT 0,
  connections INT DEFAULT 0,
  default_avatar BOOLEAN DEFAULT false,
  memorialized_account BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_name (name),
  INDEX idx_company (current_company_name),
  INDEX idx_location (city),
  INDEX idx_linkedin_id (linkedin_id),
  FULLTEXT INDEX idx_name_fulltext (name, position)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Work experience table
CREATE TABLE IF NOT EXISTS work_experience (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  company_id VARCHAR(255),
  title VARCHAR(500),
  description TEXT,
  start_date VARCHAR(50),
  end_date VARCHAR(50),
  location VARCHAR(255),
  duration VARCHAR(100),
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (profile_id) REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  INDEX idx_profile (profile_id),
  INDEX idx_company (company),
  INDEX idx_company_id (company_id),
  INDEX idx_current (is_current)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Education table
CREATE TABLE IF NOT EXISTS education (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id VARCHAR(255) NOT NULL,
  title VARCHAR(500),
  degree VARCHAR(255),
  field VARCHAR(255),
  start_year VARCHAR(10),
  end_year VARCHAR(10),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (profile_id) REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  INDEX idx_profile (profile_id),
  INDEX idx_title (title)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id VARCHAR(255) NOT NULL,
  title VARCHAR(500),
  subtitle VARCHAR(255),
  credential_id VARCHAR(255),
  credential_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (profile_id) REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  INDEX idx_profile (profile_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Skills table (for future use)
CREATE TABLE IF NOT EXISTS skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id VARCHAR(255) NOT NULL,
  skill_name VARCHAR(255),
  endorsements INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (profile_id) REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  INDEX idx_profile (profile_id),
  INDEX idx_skill (skill_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Company connections table (for matching colleagues)
CREATE TABLE IF NOT EXISTS company_connections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  profile_id VARCHAR(255) NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  company_id VARCHAR(255),
  worked_from VARCHAR(50),
  worked_to VARCHAR(50),
  is_current BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (profile_id) REFERENCES linkedin_profiles(id) ON DELETE CASCADE,
  INDEX idx_profile (profile_id),
  INDEX idx_company (company_name),
  INDEX idx_company_id (company_id),
  INDEX idx_current (is_current),
  UNIQUE KEY unique_profile_company (profile_id, company_name, worked_from)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
