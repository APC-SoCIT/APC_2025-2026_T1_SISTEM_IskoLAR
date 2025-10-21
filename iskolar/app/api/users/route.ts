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
        user_id,
        email_address,
        first_name,
        last_name,
        middle_name,
        mobile_number,
        last_login,
        created_at,
        updated_at
      `);

    if (error) throw error;
    
    return NextResponse.json(data);
    
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('ERROR IN GET /api/users:', err);
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}