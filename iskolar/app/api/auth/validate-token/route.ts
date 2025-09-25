import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');

    // Check if header exists and is properly formatted
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Missing or invalid authorization header',
        isValid: false 
      }, { status: 401 });
    }

    // Extract the token
    const token = authHeader.replace('Bearer ', '');

    // Validate token using Supabase getUser
    // This will verify if the token is valid without making a specific 
    // request to a protected resource
    const { data, error } = await supabase.auth.getUser(token);

    // If there's an error, the token is invalid
    if (error || !data.user) {
      return NextResponse.json({ 
        error: error?.message || 'Invalid token', 
        isValid: false 
      }, { status: 401 });
    }

    // Return user data if token is valid
    return NextResponse.json({
      isValid: true,
      userId: data.user.id,
      email: data.user.email,
      message: 'Token is valid',
      metadata: data.user.user_metadata
    });

  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      isValid: false 
    }, { status: 500 });
  }
}