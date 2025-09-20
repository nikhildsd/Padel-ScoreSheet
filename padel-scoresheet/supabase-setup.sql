-- Create courts table
CREATE TABLE IF NOT EXISTS courts (
  id BIGSERIAL PRIMARY KEY,
  court_number INTEGER NOT NULL UNIQUE,
  left_team_name TEXT NOT NULL DEFAULT 'Team A',
  left_team_score INTEGER NOT NULL DEFAULT 0,
  right_team_name TEXT NOT NULL DEFAULT 'Team B',
  right_team_score INTEGER NOT NULL DEFAULT 0,
  upcoming_left TEXT NOT NULL DEFAULT '',
  upcoming_right TEXT NOT NULL DEFAULT '',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert initial data for 6 courts
INSERT INTO courts (court_number, left_team_name, left_team_score, right_team_name, right_team_score, upcoming_left, upcoming_right) VALUES
  (1, 'Team A', 0, 'Team B', 0, '', ''),
  (2, 'Team A', 0, 'Team B', 0, '', ''),
  (3, 'Team A', 0, 'Team B', 0, '', ''),
  (4, 'Team A', 0, 'Team B', 0, '', ''),
  (5, 'Team A', 0, 'Team B', 0, '', ''),
  (6, 'Team A', 0, 'Team B', 0, '', '')
ON CONFLICT (court_number) DO NOTHING;

-- Enable RLS (Row Level Security)
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for everyone (since this is a simple scoresheet app)
CREATE POLICY "Allow all operations on courts" ON courts FOR ALL USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE courts;