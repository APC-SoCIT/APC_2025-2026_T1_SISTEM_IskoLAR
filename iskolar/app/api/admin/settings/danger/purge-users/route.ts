
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isSuperAdmin } from '@/lib/auth/roles';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// In-memory rate limiter (simple implementation)
const rateLimiter = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMIT = 3; // Max 3 attempts
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

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

// POST /api/admin/settings/danger/purge-users - Delete users inactive for X days
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
        { error: 'Only super administrators can purge users' },
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
    const { password, confirmationText, inactiveDays } = body;

    // Validate inputs
    if (!password || !confirmationText || !inactiveDays) {
      return NextResponse.json(
        { error: 'password, confirmationText, and inactiveDays are required' },
        { status: 400 }
      );
    }

    if (confirmationText !== 'DELETE') {
      return NextResponse.json(
        { error: 'Confirmation text must be exactly "DELETE"' },
        { status: 400 }
      );
    }

    if (typeof inactiveDays !== 'number' || inactiveDays < 30) {
      return NextResponse.json(
        { error: 'inactiveDays must be a number >= 30' },
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
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

    // Find inactive users (no applications and last sign in before cutoff)
    const { data: inactiveUsers, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('user_id, email_address, last_sign_in_at')
      .lt('last_sign_in_at', cutoffDate.toISOString())
      .is('last_sign_in_at', null); // Users who never signed in OR signed in before cutoff

    if (fetchError) {
      console.error('[POST /api/admin/settings/danger/purge-users] Fetch error:', fetchError);
      throw fetchError;
    }

    if (!inactiveUsers || inactiveUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No inactive users found',
        deletedCount: 0
      });
    }

    // Filter out users with any applications
    const userIdsToCheck = inactiveUsers.map(u => u.user_id);
    const { data: usersWithApps } = await supabaseAdmin
      .from('application_details')
      .select('user_id')
      .in('user_id', userIdsToCheck);

    const userIdsWithApps = new Set(usersWithApps?.map(a => a.user_id) || []);
    const usersToDelete = inactiveUsers.filter(u => !userIdsWithApps.has(u.user_id));

    if (usersToDelete.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No inactive users without applications found',
        deletedCount: 0
      });
    }

    // Delete users from auth.users (cascades to public.users via trigger)
    const deletePromises = usersToDelete.map(u => 
      supabaseAdmin.auth.admin.deleteUser(u.user_id)
    );

    const results = await Promise.allSettled(deletePromises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;

    return NextResponse.json({
      success: true,
      message: `Purged ${successCount} inactive users (inactive for ${inactiveDays}+ days with no applications)`,
      deletedCount: successCount,
      attemptedCount: usersToDelete.length
    });
  } catch (error) {
    console.error('[POST /api/admin/settings/danger/purge-users] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to purge users' },
      { status: 500 }
    );
  }
}
