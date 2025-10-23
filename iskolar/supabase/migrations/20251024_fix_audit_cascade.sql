-- First drop the existing foreign key constraint
ALTER TABLE IF EXISTS public.school_year_audit 
    DROP CONSTRAINT IF EXISTS school_year_audit_school_year_id_fkey;

-- Now recreate it with ON DELETE CASCADE
ALTER TABLE public.school_year_audit
    ADD CONSTRAINT school_year_audit_school_year_id_fkey 
    FOREIGN KEY (school_year_id) 
    REFERENCES public.school_years(id) 
    ON DELETE CASCADE;