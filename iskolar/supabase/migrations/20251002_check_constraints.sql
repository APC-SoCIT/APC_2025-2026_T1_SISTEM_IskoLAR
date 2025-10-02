-- Check and fix NOT NULL constraints for document fields
-- Run this in your Supabase SQL Editor if needed

-- Check the current schema for users table
SELECT column_name, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY column_name;

-- If birth_certificate column has NOT NULL constraint and you want to make it optional:
-- ALTER TABLE public.users ALTER COLUMN birth_certificate DROP NOT NULL;

-- If voters_certification column has NOT NULL constraint and you want to make it optional:
-- ALTER TABLE public.users ALTER COLUMN voters_certification DROP NOT NULL;

-- If national_id column has NOT NULL constraint and you want to make it optional:
-- ALTER TABLE public.users ALTER COLUMN national_id DROP NOT NULL;

-- Note: Only run the ALTER statements above if you want to make document fields optional
-- The profile update API now skips updating these fields to avoid constraint violations