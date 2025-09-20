-- Updated saved_matches table with notes column
-- This is the complete table structure including the new notes field

CREATE TABLE saved_matches (
  id SERIAL PRIMARY KEY,
  court_number INTEGER NOT NULL,
  left_team_name VARCHAR(255) NOT NULL,
  left_team_score INTEGER NOT NULL,
  right_team_name VARCHAR(255) NOT NULL,
  right_team_score INTEGER NOT NULL,
  upcoming_left VARCHAR(255),
  upcoming_right VARCHAR(255),
  notes TEXT, -- NEW: Optional match notes
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE saved_matches ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is a simple app)
CREATE POLICY "Allow all operations on saved_matches" ON saved_matches
  FOR ALL USING (true);

-- Enable real-time subscriptions
ALTER PUBLICATION supabase_realtime ADD TABLE saved_matches;

-- Add comment to document the notes column
COMMENT ON COLUMN saved_matches.notes IS 'Optional notes about the match (up to 500 characters)';