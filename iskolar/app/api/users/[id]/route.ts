import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Deactivate or reactivate a user
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status } = await request.json();

    const { error } = await supabaseAdmin
      .from('users')
      .update({ status: status })
      .eq('user_id', id);

    if (error) throw error;
    return NextResponse.json({ message: 'User status updated successfully' });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`ERROR IN PATCH /api/users/${params.id}:`, err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Permanently delete a user
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // This command deletes the user from Supabase Authentication
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError) throw authError;

    // The user will be automatically deleted from your 'users' table
    // if its foreign key has ON DELETE CASCADE. This is a good safety net:
    await supabaseAdmin.from('users').delete().eq('user_id', id);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`ERROR IN DELETE /api/users/${params.id}:`, err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}