-- Add notes column to saved_matches table
-- Run this SQL script in your Supabase SQL editor or database client

ALTER TABLE saved_matches
ADD COLUMN notes TEXT;

-- Optional: Add a comment to document the column
COMMENT ON COLUMN saved_matches.notes IS 'Optional notes about the match (up to 500 characters)';

-- Verify the change (optional query to check the table structure)
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'saved_matches'
-- ORDER BY ordinal_position;