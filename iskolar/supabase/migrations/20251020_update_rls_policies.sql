-- Ensure RLS is enabled
ALTER TABLE IF EXISTS public.school_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.semesters ENABLE ROW LEVEL SECURITY;

-- Drop any previous policies that might conflict
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Enable insert/update/delete for admins only' AND polrelid = 'public.school_years'::regclass) THEN
    EXECUTE 'DROP POLICY "Enable insert/update/delete for admins only" ON public.school_years';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Enable insert/update/delete for admins only' AND polrelid = 'public.semesters'::regclass) THEN
    EXECUTE 'DROP POLICY "Enable insert/update/delete for admins only" ON public.semesters';
  END IF;
END$$;

-- Drop our target policies if they already exist to allow recreate
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'school_years_select' AND polrelid = 'public.school_years'::regclass) THEN
    EXECUTE 'DROP POLICY school_years_select ON public.school_years';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'school_years_insert_admin' AND polrelid = 'public.school_years'::regclass) THEN
    EXECUTE 'DROP POLICY school_years_insert_admin ON public.school_years';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'school_years_update_admin' AND polrelid = 'public.school_years'::regclass) THEN
    EXECUTE 'DROP POLICY school_years_update_admin ON public.school_years';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'school_years_delete_admin' AND polrelid = 'public.school_years'::regclass) THEN
    EXECUTE 'DROP POLICY school_years_delete_admin ON public.school_years';
  END IF;

  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'semesters_select' AND polrelid = 'public.semesters'::regclass) THEN
    EXECUTE 'DROP POLICY semesters_select ON public.semesters';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'semesters_insert_admin' AND polrelid = 'public.semesters'::regclass) THEN
    EXECUTE 'DROP POLICY semesters_insert_admin ON public.semesters';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'semesters_update_admin' AND polrelid = 'public.semesters'::regclass) THEN
    EXECUTE 'DROP POLICY semesters_update_admin ON public.semesters';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'semesters_delete_admin' AND polrelid = 'public.semesters'::regclass) THEN
    EXECUTE 'DROP POLICY semesters_delete_admin ON public.semesters';
  END IF;
END$$;

-- Create SELECT policies for authenticated users
CREATE POLICY school_years_select ON public.school_years
  FOR SELECT TO authenticated USING (true);

CREATE POLICY semesters_select ON public.semesters
  FOR SELECT TO authenticated USING (true);

-- Create INSERT policies requiring admin role from profiles table
CREATE POLICY school_years_insert_admin ON public.school_years
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY semesters_insert_admin ON public.semesters
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create UPDATE policies requiring admin role from profiles table
CREATE POLICY school_years_update_admin ON public.school_years
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY semesters_update_admin ON public.semesters
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create DELETE policies requiring admin role from profiles table
CREATE POLICY school_years_delete_admin ON public.school_years
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY semesters_delete_admin ON public.semesters
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );