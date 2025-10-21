-- Function to update semester application status
CREATE OR REPLACE FUNCTION admin_update_semester_status(target_id uuid, new_status boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update the semester status using direct SQL
    UPDATE public.semesters 
    SET 
        applications_open = new_status,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = target_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION admin_update_semester_status(uuid, boolean) TO authenticated;

-- Ensure RLS policy exists for updates
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_catalog.pg_policies 
        WHERE tablename = 'semesters' 
        AND policyname = 'Enable update for service role'
    ) THEN
        CREATE POLICY "Enable update for service role" 
        ON public.semesters
        FOR UPDATE
        USING (auth.jwt() ->> 'role' = 'service_role')
        WITH CHECK (auth.jwt() ->> 'role' = 'service_role');
    END IF;
END $$;