-- Verify actual database schema for school_years and semesters tables
-- Run this in Supabase SQL Editor to confirm column names

-- Check school_years table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'school_years' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check semesters table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'semesters' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check current school year data
SELECT * FROM school_years WHERE is_current = true;

-- Check current semester data
SELECT * FROM semesters WHERE is_current = true;

-- Check if is_current column exists
SELECT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'school_years' 
        AND column_name = 'is_current'
) as school_years_has_is_current,
EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'semesters' 
        AND column_name = 'is_current'
) as semesters_has_is_current;
