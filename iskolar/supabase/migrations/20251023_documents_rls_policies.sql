-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to view their own documents
CREATE POLICY "Users can view their own documents"
  ON documents
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Create policy to allow users to insert their own documents
CREATE POLICY "Users can insert their own documents"
  ON documents
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Create policy to allow users to update their own documents
CREATE POLICY "Users can update their own documents"
  ON documents
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Create policy to allow users to delete their own documents
CREATE POLICY "Users can delete their own documents"
  ON documents
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON documents TO authenticated;