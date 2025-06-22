-- Create tables for habit heatmap tracker
CREATE TABLE IF NOT EXISTS github_contributions (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS youtube_uploads (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 0,
  video_ids TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sync_status (
  id SERIAL PRIMARY KEY,
  platform TEXT NOT NULL UNIQUE,
  last_sync_date DATE NOT NULL,
  is_initialized BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert initial sync status
INSERT INTO sync_status (platform, last_sync_date, is_initialized) 
VALUES 
  ('github', '2024-12-01', FALSE),
  ('youtube', '2024-12-01', FALSE)
ON CONFLICT (platform) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_github_contributions_date ON github_contributions(date);
CREATE INDEX IF NOT EXISTS idx_youtube_uploads_date ON youtube_uploads(date);
CREATE INDEX IF NOT EXISTS idx_sync_status_platform ON sync_status(platform);
