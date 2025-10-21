-- Create or replace the admin_delete_semester function
CREATE OR REPLACE FUNCTION public.admin_delete_semester(semester_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- This ensures the function runs with the privileges of the creator
AS $$
BEGIN
    -- First delete any related records that might prevent deletion
    DELETE FROM applications WHERE semester_id = $1;
    
    -- Then delete the semester
    DELETE FROM semesters WHERE id = $1;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.admin_delete_semester(uuid) TO authenticated;

-- Add comment
COMMENT ON FUNCTION public.admin_delete_semester(uuid) IS 'Admin function to force delete a semester and its related records';

-- Add RLS policy for semesters table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_catalog.pg_policies 
        WHERE tablename = 'semesters' 
        AND policyname = 'Enable delete for service role'
    ) THEN
        CREATE POLICY "Enable delete for service role" ON semesters
        FOR DELETE
        USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;