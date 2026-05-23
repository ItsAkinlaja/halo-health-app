-- Migration 016: Extend household profiles to support pets

ALTER TABLE health_profiles
ADD COLUMN IF NOT EXISTS relationship VARCHAR(50);

ALTER TABLE health_profiles
ADD COLUMN IF NOT EXISTS member_type VARCHAR(20) NOT NULL DEFAULT 'person';

ALTER TABLE health_profiles
ADD COLUMN IF NOT EXISTS pet_type VARCHAR(50);

UPDATE health_profiles
SET relationship = COALESCE(relationship, 'self')
WHERE relationship IS NULL;

UPDATE health_profiles
SET member_type = COALESCE(member_type, 'person')
WHERE member_type IS NULL;
