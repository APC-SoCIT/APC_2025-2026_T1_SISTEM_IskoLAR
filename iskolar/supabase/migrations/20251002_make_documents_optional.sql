-- Alternative solution: Make document fields optional in database
-- Run this in Supabase SQL Editor if you want document fields to be optional

-- Make birth_certificate column nullable (optional)
ALTER TABLE public.users ALTER COLUMN birth_certificate DROP NOT NULL;

-- Make voters_certification column nullable (optional) 
ALTER TABLE public.users ALTER COLUMN voters_certification DROP NOT NULL;

-- Make national_id column nullable (optional)
ALTER TABLE public.users ALTER COLUMN national_id DROP NOT NULL;

-- Verify the changes
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public' 
  AND column_name IN ('birth_certificate', 'voters_certification', 'national_id');

-- Note: After running this migration, you can uncomment the document fields 
-- in the API route if you want to allow updating them through profile updates