-- Add profile_photo_url field to users table
-- This stores the URL of the user's uploaded high-quality profile photo

ALTER TABLE users 
ADD COLUMN profile_photo_url VARCHAR(500) NULL AFTER avatar,
ADD COLUMN profile_photo_uploaded_at TIMESTAMP NULL AFTER profile_photo_url;

-- Add index for faster lookups
CREATE INDEX idx_users_profile_photo ON users(profile_photo_url);
