import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use the Service Role Key for admin-level access on the server
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ...
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select(`
        *,
        role:role_id (name)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const transformedData = data.map(user => {
        // Map database role names to frontend enum values
        let roleValue = 'User'; // Default fallback
        if (user.role && user.role.name) {
            const dbRole = user.role.name.toLowerCase();
            switch (dbRole) {
                case 'admin':
                    roleValue = 'Admin';
                    break;
                case 'user':
                case 'scholar':
                case 'applicant':
                    roleValue = 'User';
                    break;
                default:
                    roleValue = 'User';
            }
        }
        
        return {
            ...user,
            role: roleValue
        };
    });

    return NextResponse.json(transformedData);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error('ERROR IN GET /api/users:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}