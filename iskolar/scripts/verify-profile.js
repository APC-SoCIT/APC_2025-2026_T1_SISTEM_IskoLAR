/**
 * Script to verify that the profile page is working correctly
 * Run this script from the browser console when on the profile page
 */

(function() {
  console.log('Starting profile verification script...');
  
  // Check Supabase connection
  async function checkSupabaseConnection() {
    try {
      const { data, error } = await window.supabase.auth.getSession();
      if (error) {
        console.error('❌ Supabase connection error:', error);
        return false;
      }
      
      console.log('✅ Supabase connection is working');
      console.log('Session data:', data);
      return true;
    } catch (e) {
      console.error('❌ Failed to connect to Supabase:', e);
      return false;
    }
  }
  
  // Check if user profile exists in database
  async function checkUserProfile() {
    try {
      const { data: { user }, error: userError } = await window.supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ No authenticated user found:', userError);
        return false;
      }
      
      console.log('✅ Authenticated user found:', user.id);
      
      const { data: profile, error: profileError } = await window.supabase
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (profileError) {
        console.error('❌ User profile not found in database:', profileError);
        console.log('This could be causing the "Failed to fetch user profile" error.');
        console.log('Suggested fix: Create a profile record for this user in the users table.');
        return false;
      }
      
      console.log('✅ User profile found in database:', profile);
      return true;
    } catch (e) {
      console.error('❌ Error checking user profile:', e);
      return false;
    }
  }
  
  // Run the verification
  async function runVerification() {
    const supabaseOk = await checkSupabaseConnection();
    if (!supabaseOk) return;
    
    const profileOk = await checkUserProfile();
    if (!profileOk) return;
    
    console.log('✅ Profile verification passed! The profile page should load correctly.');
  }
  
  runVerification();
})();