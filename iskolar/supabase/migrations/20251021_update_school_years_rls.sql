-- Update RLS policies for school_years
ALTER TABLE public.school_years ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.school_years;
DROP POLICY IF EXISTS "Enable insert/update/delete for super_admin only" ON public.school_years;

-- Allow read access for all authenticated users
CREATE POLICY "Enable read access for all authenticated users" ON public.school_years
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow insert/update/delete only for super_admin (lookup by email from JWT)
CREATE POLICY "Enable insert/update/delete for super_admin only" ON public.school_years
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.admin a
      JOIN public.role r ON a.role_id = r.role_id
      WHERE a.email_address = (auth.jwt() ->> 'email')
        AND r.name = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.admin a
      JOIN public.role r ON a.role_id = r.role_id
      WHERE a.email_address = (auth.jwt() ->> 'email')
        AND r.name = 'super_admin'
    )
  );