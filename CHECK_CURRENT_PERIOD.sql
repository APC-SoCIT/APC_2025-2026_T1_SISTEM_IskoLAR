-- Check school_year table structure and current values
SELECT * FROM public.school_year LIMIT 5;

-- Check semester table structure and current values
SELECT * FROM public.semester LIMIT 5;

-- Check if there's a current school year
SELECT * FROM public.school_year WHERE is_current = true;

-- Check if there's a current semester
SELECT * FROM public.semester WHERE is_current = true;
