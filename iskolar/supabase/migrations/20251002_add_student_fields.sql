-- Add missing columns to users table for student profile information
-- Run this in your Supabase SQL Editor

-- Add year_level column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS year_level TEXT;

-- Add gpa column  
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS gpa TEXT;

-- Add comments for documentation
COMMENT ON COLUMN public.users.year_level IS 'Student year level (e.g., 1st Year, 2nd Year, etc.)';
COMMENT ON COLUMN public.users.gpa IS 'Student Grade Point Average';

-- Update any existing profiles to have these fields available
-- (This is optional - the fields will be NULL until users update their profiles)