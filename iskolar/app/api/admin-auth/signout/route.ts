import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }

    // Set cookie expiration
    const response = NextResponse.json(
      { message: 'Signed out successfully' },
      { status: 200 }
    );

    // Clear all auth-related cookies
    const cookiesToClear = [
      'sb-access-token',
      'sb-refresh-token',
      'authToken',
      'supabase-auth-token'
    ];

    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        path: '/',
        expires: new Date(0),
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
    });

    return response;
  } catch (error) {
    console.error('Error signing out:', error);
    return NextResponse.json(
      { error: 'Failed to sign out' }, 
      { status: 500 }
    );
  }
}