-- Run this in Supabase SQL Editor to check your current active period

-- Check active school year
SELECT 
    id, 
    academic_year, 
    is_active,
    created_at
FROM school_years 
WHERE is_active = true;

-- Check semester with open applications (current semester)
SELECT 
    s.id, 
    s.name, 
    s.applications_open,
    sy.academic_year as school_year,
    s.created_at
FROM semesters s
JOIN school_years sy ON s.school_year_id = sy.id
WHERE s.applications_open = true;

-- If no active school year, show all school years
SELECT 
    id, 
    academic_year, 
    is_active,
    'Set one to is_active = true' as note
FROM school_years 
ORDER BY academic_year DESC;

-- If no open semester, show all semesters
SELECT 
    s.id, 
    s.name, 
    s.applications_open,
    sy.academic_year as school_year,
    'Set one to applications_open = true' as note
FROM semesters s
JOIN school_years sy ON s.school_year_id = sy.id
ORDER BY sy.academic_year DESC, s.name;
