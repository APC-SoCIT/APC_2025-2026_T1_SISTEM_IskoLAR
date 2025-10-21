-- Drop existing function if it exists
DROP FUNCTION IF EXISTS admin_delete_semester_with_apps;

-- Create the stored procedure for deleting semesters
CREATE OR REPLACE FUNCTION admin_delete_semester_with_apps(target_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete any applications first
    DELETE FROM public.applications 
    WHERE semester_id = target_id;

    -- Then delete the semester using direct SQL
    DELETE FROM public.semesters 
    WHERE id = target_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_delete_semester_with_apps(uuid) TO authenticated;

-- Disable RLS for the supabase_admin role
ALTER TABLE public.semesters FORCE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    -- Create policy for service role to delete
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_catalog.pg_policies 
        WHERE tablename = 'semesters' 
        AND policyname = 'Enable delete for service role'
    ) THEN
        CREATE POLICY "Enable delete for service role" 
        ON public.semesters
        FOR DELETE 
        USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;