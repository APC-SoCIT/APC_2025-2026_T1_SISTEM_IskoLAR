
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isSuperAdmin } from '@/lib/auth/roles';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// In-memory rate limiter
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = 3;
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

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

// POST /api/admin/settings/danger/delete-drafts - Delete draft applications older than X days
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
        { error: 'Only super administrators can delete draft applications' },
        { status: 403 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(user.id)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again in 1 hour.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { password, confirmationText, olderThanDays } = body;

    // Validate inputs
    if (!password || !confirmationText || !olderThanDays) {
      return NextResponse.json(
        { error: 'password, confirmationText, and olderThanDays are required' },
        { status: 400 }
      );
    }

    if (confirmationText !== 'DELETE') {
      return NextResponse.json(
        { error: 'Confirmation text must be exactly "DELETE"' },
        { status: 400 }
      );
    }

    if (typeof olderThanDays !== 'number' || olderThanDays < 7) {
      return NextResponse.json(
        { error: 'olderThanDays must be a number >= 7' },
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

    // Calculate cutoff date
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // Delete draft applications older than cutoff
    const { data: deletedApps, error: deleteError } = await supabaseAdmin
      .from('application_details')
      .delete()
      .eq('status', 'draft')
      .lt('created_at', cutoffDate.toISOString())
      .select('application_id');

    if (deleteError) {
      console.error('[POST /api/admin/settings/danger/delete-drafts] Delete error:', deleteError);
      throw deleteError;
    }

    const deletedCount = deletedApps?.length || 0;

    return NextResponse.json({
      success: true,
      message: `Deleted ${deletedCount} draft application(s) older than ${olderThanDays} days`,
      deletedCount
    });
  } catch (error) {
    console.error('[POST /api/admin/settings/danger/delete-drafts] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete draft applications' },
      { status: 500 }
    );
  }
}
