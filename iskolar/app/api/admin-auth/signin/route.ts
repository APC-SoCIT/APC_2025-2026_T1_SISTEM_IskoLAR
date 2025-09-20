import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { email_address, password } = await request.json();
    // TEST: Print all admin rows for debugging
    const testAllAdmins = await supabase.from('admin').select('*');
    console.log('All admin rows:', testAllAdmins.data);
    const { data, error } = await supabase
      .from('admin')
      .select('*')
      .eq('email_address', email_address)
      .eq('password', password)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
    }

    // You can add session logic or JWT here if needed
    return NextResponse.json({ success: true, admin: data });
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
