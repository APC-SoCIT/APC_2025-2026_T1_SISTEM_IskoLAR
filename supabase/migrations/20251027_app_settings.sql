-- ============================================
-- System Settings Tables
-- ============================================
-- This migration creates tables for storing application-wide settings
-- and an audit log for tracking changes

-- Create app_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create app_settings_audit table for tracking changes
CREATE TABLE IF NOT EXISTS public.app_settings_audit (
  audit_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  old_value jsonb,
  new_value jsonb NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_by_email text,
  changed_at timestamptz DEFAULT now() NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_app_settings_audit_changed_at 
  ON public.app_settings_audit(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_app_settings_audit_key 
  ON public.app_settings_audit(key);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings_audit ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "app_settings_select" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_insert" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_update" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_delete" ON public.app_settings;
DROP POLICY IF EXISTS "app_settings_audit_select" ON public.app_settings_audit;

-- RLS Policies for app_settings
-- Anyone authenticated can read settings
CREATE POLICY "app_settings_select" ON public.app_settings
  FOR SELECT TO authenticated
  USING (true);

-- Only super_admin can insert/update/delete settings
CREATE POLICY "app_settings_insert" ON public.app_settings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin a
      JOIN public.role r ON a.role_id = r.role_id
      WHERE a.email_address = auth.jwt()->>'email'
        AND r.name = 'super_admin'
    )
  );

CREATE POLICY "app_settings_update" ON public.app_settings
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin a
      JOIN public.role r ON a.role_id = r.role_id
      WHERE a.email_address = auth.jwt()->>'email'
        AND r.name = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin a
      JOIN public.role r ON a.role_id = r.role_id
      WHERE a.email_address = auth.jwt()->>'email'
        AND r.name = 'super_admin'
    )
  );

CREATE POLICY "app_settings_delete" ON public.app_settings
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.admin a
      JOIN public.role r ON a.role_id = r.role_id
      WHERE a.email_address = auth.jwt()->>'email'
        AND r.name = 'super_admin'
    )
  );

-- RLS Policies for app_settings_audit
-- Anyone authenticated can read audit logs
CREATE POLICY "app_settings_audit_select" ON public.app_settings_audit
  FOR SELECT TO authenticated
  USING (true);

-- Create trigger function for audit logging
CREATE OR REPLACE FUNCTION public.log_app_settings_changes()
RETURNS TRIGGER AS $$
DECLARE
  user_email text;
BEGIN
  -- Get the email from the JWT or from updated_by
  user_email := COALESCE(
    auth.jwt()->>'email',
    (SELECT email FROM auth.users WHERE id = NEW.updated_by)
  );

  -- Insert audit record
  INSERT INTO public.app_settings_audit (
    key,
    old_value,
    new_value,
    changed_by,
    changed_by_email
  ) VALUES (
    NEW.key,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.value ELSE NULL END,
    NEW.value,
    NEW.updated_by,
    user_email
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for audit logging
DROP TRIGGER IF EXISTS app_settings_audit_trigger ON public.app_settings;
CREATE TRIGGER app_settings_audit_trigger
  AFTER INSERT OR UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.log_app_settings_changes();

-- Seed default settings if they don't exist
INSERT INTO public.app_settings (key, value, updated_by)
VALUES 
  ('general', '{"siteName": "IskoLAR Scholarship System", "defaultTimezone": "Asia/Manila", "dateFormat": "MM/DD/YYYY"}'::jsonb, NULL),
  ('email', '{"fromAddress": "noreply@iskolar.edu"}'::jsonb, NULL),
  ('authPolicy', '{"minLength": 8, "requireUpper": true, "requireLower": true, "requireNumber": true, "requireSymbol": true, "allowAdminSignups": false}'::jsonb, NULL),
  ('features', '{"openApplications": true, "allowApplicationDeletion": false, "enableAIVerification": true}'::jsonb, NULL),
  ('maintenance', '{"maintenanceMode": false, "maintenanceMessage": "System is under maintenance. Please check back later."}'::jsonb, NULL)
ON CONFLICT (key) DO NOTHING;

-- Grant permissions
GRANT SELECT ON public.app_settings TO authenticated;
GRANT SELECT ON public.app_settings_audit TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.app_settings TO authenticated;
