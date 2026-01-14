-- Migration: Add abuse detection columns to users table
-- This enables blocking users who abuse the skip system

-- Add is_blocked column
ALTER TABLE users 
ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE AFTER can_use_platform;

-- Add blocked_reason column
ALTER TABLE users 
ADD COLUMN blocked_reason TEXT NULL AFTER is_blocked;

-- Add blocked_at timestamp
ALTER TABLE users 
ADD COLUMN blocked_at TIMESTAMP NULL AFTER blocked_reason;

-- Create index for efficient querying
CREATE INDEX idx_is_blocked ON users(is_blocked);
