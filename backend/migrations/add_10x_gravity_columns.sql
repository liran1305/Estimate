-- Migration: Add is_10x and has_gravity columns to anonymous_reviews table
-- Date: 2026-02-04
-- Purpose: Track 10X (force multiplier) and Gravity (team magnet) personality traits

-- Add columns to anonymous_reviews table
ALTER TABLE anonymous_reviews 
ADD COLUMN is_10x TINYINT(1) DEFAULT NULL AFTER would_promote,
ADD COLUMN has_gravity TINYINT(1) DEFAULT NULL AFTER is_10x;

-- Add columns to reviews table (legacy, for consistency)
ALTER TABLE reviews 
ADD COLUMN is_10x TINYINT(1) DEFAULT NULL AFTER would_promote,
ADD COLUMN has_gravity TINYINT(1) DEFAULT NULL AFTER is_10x;

-- Add columns to user_scores table for caching percentages
ALTER TABLE user_scores 
ADD COLUMN is_10x_pct TINYINT UNSIGNED DEFAULT NULL AFTER work_again_absolutely_pct,
ADD COLUMN has_gravity_pct TINYINT UNSIGNED DEFAULT NULL AFTER is_10x_pct;

-- Verify the migration
DESCRIBE anonymous_reviews;
DESCRIBE user_scores;
