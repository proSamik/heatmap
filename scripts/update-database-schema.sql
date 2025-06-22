-- Add details columns to existing tables
ALTER TABLE github_contributions 
ADD COLUMN IF NOT EXISTS details JSONB;

ALTER TABLE youtube_uploads 
ADD COLUMN IF NOT EXISTS details JSONB;

-- Update existing records to have empty details
UPDATE github_contributions 
SET details = '{"repos": [], "commits": []}' 
WHERE details IS NULL;

UPDATE youtube_uploads 
SET details = '{"videos": []}' 
WHERE details IS NULL;
