import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        role:role_id (name)
      `);

    if (error) throw error;

    // Transform the data to match what the frontend page expects
    const transformedData = data.map(user => {
      let role = 'User'; // Default role
      if (user.role && user.role.name) {
        const roleName = user.role.name.toLowerCase();
        if (roleName === 'admin') {
          role = 'Admin';
        } else {
          role = 'User'; // Map all other roles to User
        }
      }
      
      return {
        ...user,
        name: `${user.first_name} ${user.last_name}`, // Combine names
        email: user.email_address,
        role: role, // Use the mapped role
      };
    });
    
    return NextResponse.json(transformedData);
  } catch (err: unknown) {
    console.error('ERROR IN GET /api/users:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}