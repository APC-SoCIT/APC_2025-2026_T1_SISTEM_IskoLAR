-- Add is_active to school_years and create audit table
ALTER TABLE public.school_years ADD COLUMN is_active BOOLEAN DEFAULT false;

-- Add unique constraint to ensure only one active year
CREATE UNIQUE INDEX idx_school_years_active ON school_years(is_active) WHERE is_active = true;

-- Add audit table for school years
CREATE TABLE IF NOT EXISTS public.school_year_audit (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    school_year_id UUID REFERENCES public.school_years(id) ON DELETE CASCADE,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('created', 'deleted')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policy for audit table
ALTER TABLE public.school_year_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for admins" ON public.school_year_audit
    FOR SELECT
    TO authenticated
    USING (EXISTS (
        SELECT 1
        FROM public.admin
        WHERE admin.email_address = auth.jwt() ->> 'email'
    ));

CREATE POLICY "Enable insert for super admins" ON public.school_year_audit
    FOR INSERT
    TO authenticated
    WITH CHECK (EXISTS (
        SELECT 1
        FROM public.admin
        WHERE admin.email_address = auth.jwt() ->> 'email'
        AND admin.role_id = '4f53ccf0-9d4a-4345-8061-50a1e728494d'
    ));

-- Enable RLS on school_years table
ALTER TABLE public.school_years ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for school_years table
CREATE POLICY "Enable read for all authenticated users" ON public.school_years
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert for super admins" ON public.school_years
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.admin
            WHERE admin.email_address = auth.jwt() ->> 'email'
            AND admin.role_id = '4f53ccf0-9d4a-4345-8061-50a1e728494d'
        )
    );

CREATE POLICY "Enable update for super admins" ON public.school_years
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.admin
            WHERE admin.email_address = auth.jwt() ->> 'email'
            AND admin.role_id = '4f53ccf0-9d4a-4345-8061-50a1e728494d'
        )
    );

-- Add stored procedure to handle school year creation with audit
CREATE OR REPLACE FUNCTION admin_create_school_year(
    p_academic_year INTEGER,
    p_admin_email TEXT
) RETURNS UUID AS $$
DECLARE
    v_year_id UUID;
    v_super_admin BOOLEAN;
BEGIN
    -- Verify super admin status
    SELECT EXISTS (
        SELECT 1 FROM public.admin
        WHERE email_address = p_admin_email
        AND role_id = '4f53ccf0-9d4a-4345-8061-50a1e728494d'
    ) INTO v_super_admin;

    IF NOT v_super_admin THEN
        RAISE EXCEPTION 'Only super administrators can create academic years';
    END IF;

    -- First set currently active year as inactive
    UPDATE public.school_years SET is_active = false 
    WHERE is_active = true;
    
    -- Insert new year as active
    INSERT INTO public.school_years (academic_year, is_active)
    VALUES (p_academic_year, true)
    RETURNING id INTO v_year_id;

    -- Add audit entry
    INSERT INTO public.school_year_audit (school_year_id, admin_email, action)
    VALUES (v_year_id, p_admin_email, 'created');

    RETURN v_year_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in admin_create_school_year: %', SQLERRM;
        RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to check if school year can be undone
CREATE OR REPLACE FUNCTION can_undo_school_year(p_school_year_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_created_at TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT created_at INTO v_created_at
    FROM public.school_year_audit
    WHERE school_year_id = p_school_year_id
    AND action = 'created';

    -- Return true if created less than 24 hours ago
    RETURN COALESCE(
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - v_created_at)) < 86400,
        false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add stored procedure to handle school year deletion (undo) with audit
CREATE OR REPLACE FUNCTION admin_delete_school_year(
    p_school_year_id UUID,
    p_admin_email TEXT
) RETURNS BOOLEAN AS $$
BEGIN
    -- First verify it can be undone
    IF NOT can_undo_school_year(p_school_year_id) THEN
        RAISE EXCEPTION 'School year cannot be undone after 24 hours';
    END IF;

    -- Delete any existing semesters first
    DELETE FROM public.semesters WHERE school_year_id = p_school_year_id;
    
    -- Delete the school year (audit records will be deleted via CASCADE)
    DELETE FROM public.school_years WHERE id = p_school_year_id;

    -- Add deletion audit entry as a record of the deletion
    INSERT INTO public.school_year_audit (school_year_id, admin_email, action)
    VALUES (p_school_year_id, p_admin_email, 'deleted');

    -- Activate the most recent remaining year if any exist
    UPDATE public.school_years
    SET is_active = true
    WHERE academic_year = (
        SELECT MAX(academic_year)
        FROM public.school_years
    );

    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;