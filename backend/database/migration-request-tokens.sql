-- Migration: Request Tokens System
-- Creates tables for the review request token system

-- Table to track user's token balance
CREATE TABLE IF NOT EXISTS request_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  tokens_available INT DEFAULT 0,
  tokens_earned_total INT DEFAULT 0,
  tokens_used_total INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user (user_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table to track review requests (shareable links)
CREATE TABLE IF NOT EXISTS review_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  requester_id VARCHAR(255) NOT NULL,
  unique_link VARCHAR(64) NOT NULL,
  recipient_email VARCHAR(255) DEFAULT NULL,
  recipient_name VARCHAR(255) DEFAULT NULL,
  company_context VARCHAR(255) DEFAULT NULL,
  status ENUM('pending', 'completed', 'expired', 'cancelled') DEFAULT 'pending',
  expires_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP NULL,
  completed_by_user_id VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_link (unique_link),
  INDEX idx_requester (requester_id),
  INDEX idx_status (status),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table to prevent reciprocal gaming (A requests B, B cannot request A)
CREATE TABLE IF NOT EXISTS request_blocks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_a_id VARCHAR(255) NOT NULL,
  user_b_id VARCHAR(255) NOT NULL,
  reason VARCHAR(50) DEFAULT 'reciprocal_block',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_block (user_a_id, user_b_id),
  INDEX idx_user_a (user_a_id),
  INDEX idx_user_b (user_b_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initialize tokens for existing users based on their reviews_given count
-- Every 5 reviews = 1 token earned
INSERT INTO request_tokens (user_id, tokens_available, tokens_earned_total, tokens_used_total)
SELECT 
  us.user_id,
  FLOOR(us.reviews_given / 5) as tokens_available,
  FLOOR(us.reviews_given / 5) as tokens_earned_total,
  0 as tokens_used_total
FROM user_scores us
WHERE us.reviews_given >= 5
ON DUPLICATE KEY UPDATE
  tokens_available = FLOOR(us.reviews_given / 5),
  tokens_earned_total = FLOOR(us.reviews_given / 5);
