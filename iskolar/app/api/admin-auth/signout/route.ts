import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST() {

  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Signed out successfully' });
  } catch (error) {
    console.error('Error signing out:', error);
    return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
  }
}