-- Create table for saved matches
CREATE TABLE saved_matches (
  id SERIAL PRIMARY KEY,
  court_number INTEGER NOT NULL,
  left_team_name VARCHAR(255) NOT NULL,
  left_team_score INTEGER NOT NULL,
  right_team_name VARCHAR(255) NOT NULL,
  right_team_score INTEGER NOT NULL,
  upcoming_left VARCHAR(255),
  upcoming_right VARCHAR(255),
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