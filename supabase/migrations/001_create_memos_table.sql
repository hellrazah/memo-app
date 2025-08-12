-- Create memos table based on the existing Memo interface
CREATE TABLE IF NOT EXISTS memos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'other',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on category for better query performance
CREATE INDEX IF NOT EXISTS idx_memos_category ON memos(category);

-- Create index on tags for array operations
CREATE INDEX IF NOT EXISTS idx_memos_tags ON memos USING GIN(tags);

-- Create index on created_at for ordering
CREATE INDEX IF NOT EXISTS idx_memos_created_at ON memos(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_memos_updated_at
    BEFORE UPDATE ON memos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for now (you can customize this later)
CREATE POLICY "Allow all operations on memos" ON memos
FOR ALL USING (true);