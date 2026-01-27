-- Add room_to_grow column to anonymous_reviews
ALTER TABLE anonymous_reviews ADD COLUMN room_to_grow VARCHAR(500) DEFAULT NULL;

-- Add room_to_grow column to reviews (legacy table)
ALTER TABLE reviews ADD COLUMN room_to_grow VARCHAR(500) DEFAULT NULL;
