
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isSuperAdmin } from '@/lib/auth/roles';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// In-memory rate limiter
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = 2; // Very restrictive for this dangerous operation
const RATE_LIMIT_WINDOW = 24 * 60 * 60 * 1000; // 24 hours

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimiter.get(userId);

  if (!userLimit || now > userLimit.resetAt) {
    rateLimiter.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT) {
    return false;
  }

  userLimit.count++;
  return true;
}

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

// Helper to verify admin password
async function verifyAdminPassword(email: string, password: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password
    });
    return !error;
  } catch {
    return false;
  }
}

// POST /api/admin/settings/danger/reset-semester - Delete all applications for a semester
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super_admin
    const isSuperAdminUser = await isSuperAdmin(user.email);
    if (!isSuperAdminUser) {
      return NextResponse.json(
        { error: 'Only super administrators can reset semesters' },
        { status: 403 }
      );
    }

    // Rate limiting (24h window, max 2 attempts)
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in 24 hours.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { password, confirmationText, semesterId } = body;

    // Validate inputs
    if (!password || !confirmationText || !semesterId) {
      return NextResponse.json(
        { error: 'password, confirmationText, and semesterId are required' },
        { status: 400 }
      );
    }

    if (confirmationText !== 'DELETE') {
      return NextResponse.json(
        { error: 'Confirmation text must be exactly "DELETE"' },
        { status: 400 }
      );
    }

    // Verify password
    const passwordValid = await verifyAdminPassword(user.email, password);
    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Verify semester exists
    const { data: semester, error: semesterError } = await supabaseAdmin
      .from('semesters')
      .select('id, name, school_year_id, applications_open')
      .eq('id', semesterId)
      .single();

    if (semesterError || !semester) {
      return NextResponse.json(
        { error: 'Semester not found' },
        { status: 404 }
      );
    }

    // Prevent deleting applications for current semester
    if (semester.applications_open) {
      return NextResponse.json(
        { error: 'Cannot reset the current active semester. Please change the active semester first.' },
        { status: 400 }
      );
    }

    // Count applications before deletion
    const { count: appCount } = await supabaseAdmin
      .from('application_details')
      .select('*', { count: 'exact', head: true })
      .eq('semester_id', semesterId);

    if (appCount === 0) {
      return NextResponse.json({
        success: true,
        message: `No applications found for semester: ${semester.name}`,
        deletedCount: 0
      });
    }

    // Delete all applications for this semester (cascade deletes documents)
    const { error: deleteError } = await supabaseAdmin
      .from('application_details')
      .delete()
      .eq('semester_id', semesterId);

    if (deleteError) {
      console.error('[POST /api/admin/settings/danger/reset-semester] Delete error:', deleteError);
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: `Reset semester "${semester.name}": deleted ${appCount} application(s) and all associated documents`,
      deletedCount: appCount,
      semesterName: semester.name
    });
  } catch (error) {
    console.error('[POST /api/admin/settings/danger/reset-semester] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reset semester' },
      { status: 500 }
    );
  }
}
