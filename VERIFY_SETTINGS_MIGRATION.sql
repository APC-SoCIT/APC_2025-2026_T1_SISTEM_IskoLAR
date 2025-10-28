-- Run this query in Supabase SQL Editor to verify the migration was successful

-- Check if app_settings table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'app_settings'
) as app_settings_exists;

-- Check if app_settings_audit table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'app_settings_audit'
) as app_settings_audit_exists;

-- Count rows in app_settings (should have 5 default rows)
SELECT COUNT(*) as settings_count FROM public.app_settings;

-- Show all settings keys
SELECT key, updated_at FROM public.app_settings ORDER BY key;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('app_settings', 'app_settings_audit');

-- Check policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('app_settings', 'app_settings_audit')
ORDER BY tablename, policyname;
