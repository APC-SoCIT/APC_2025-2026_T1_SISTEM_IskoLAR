-- Enable RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to update their own data
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy for users to insert their own data (for profile creation)
CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Optional: Policy to allow service role to access all data (for admin operations)
CREATE POLICY "Service role can access all users"
ON public.users
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');