import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create an admin supabase client with service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { email_address, password } = await request.json();

    // First verify if this is an admin account
    console.log('Checking admin account:', email_address);
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('admin')
      .select(`
        *,
        role:role!role_id (
          name
        )
      `)
      .eq('email_address', email_address)
      .single();

    if (adminError || !adminData) {
      console.log('Admin account check failed:', adminError || 'No admin data found');
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }
    console.log('Admin account found:', adminData);

    // Try to sign in with admin credentials first
    console.log('Attempting admin sign in with Supabase auth...');
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: email_address,
      password: password,
    });

    if (signInError) {
      console.log('Sign in failed:', signInError.message);
      
      // Create the user directly with the provided password
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email_address,
        password: password,
        email_confirm: true,
        user_metadata: {
          role_id: adminData.role_id,
          is_admin: true
        }
      });

      if (createError) {
        console.error('Error creating auth user:', createError);
        return NextResponse.json({ error: 'Failed to create auth user: ' + createError.message }, { status: 500 });
      }

      console.log('Auth user created successfully, attempting final sign in...');

      // Try signing in again with the new credentials
      const { data: finalSignInData, error: finalSignInError } = await supabaseAdmin.auth.signInWithPassword({
        email: email_address,
        password: password,
      });

      if (finalSignInError) {
        console.error('Final sign in failed:', finalSignInError);
        return NextResponse.json({ error: 'Unable to sign in after user creation' }, { status: 401 });
      }

      console.log('Final sign in successful');
      return NextResponse.json({ 
        success: true,
        session: finalSignInData.session,
        admin: {
          ...adminData,
          role: adminData.role.name
        }
      });
    }

    // If initial sign in was successful, return the session
    console.log('Initial sign in successful');
    return NextResponse.json({ 
      success: true,
      session: signInData.session,
      admin: {
        ...adminData,
        role: adminData.role.name
      }
    });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
