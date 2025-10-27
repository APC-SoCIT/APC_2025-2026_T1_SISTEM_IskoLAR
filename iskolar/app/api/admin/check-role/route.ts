
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isSuperAdmin } from '@/lib/auth/roles';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to get user from Authorization header
async function getUserFromRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const accessToken = authHeader.substring(7);

  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !user) {
      return null;
    }
    return user;
  } catch {
    return null;
  }
}

// GET /api/admin/check-role - Check if current user is super_admin
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user?.email) {
      return NextResponse.json({ 
        isSuperAdmin: false,
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    const isSuperAdminUser = await isSuperAdmin(user.email);

    return NextResponse.json({
      isSuperAdmin: isSuperAdminUser,
      email: user.email
    });
  } catch (error) {
    console.error('[GET /api/admin/check-role] Error:', error);
    return NextResponse.json(
      { 
        isSuperAdmin: false,
        error: error instanceof Error ? error.message : 'Failed to check role' 
      },
      { status: 500 }
    );
  }
}
