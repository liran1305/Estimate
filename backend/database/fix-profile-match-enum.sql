-- Add 'image' and other matching methods to profile_match_method ENUM
ALTER TABLE users 
MODIFY COLUMN profile_match_method ENUM(
  'linkedin_id',
  'linkedin_num_id',
  'image',
  'image_multiple',
  'name',
  'email',
  'not_found'
) DEFAULT NULL;
