
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isSuperAdmin } from '@/lib/auth/roles';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Type for audit log from database
interface AuditLogRecord {
  audit_id: string;
  key: string;
  old_value: unknown;
  new_value: unknown;
  changed_by: string;
  changed_by_email: string;
  changed_at: string;
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

// GET /api/admin/settings/audit?limit=100 - Get audit log
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super_admin
    const isSuperAdminUser = await isSuperAdmin(user.email);
    if (!isSuperAdminUser) {
      return NextResponse.json(
        { error: 'Only super administrators can view audit logs' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    // Fetch audit log (email is already stored in changed_by_email column)
    const { data: auditData, error } = await supabaseAdmin
      .from('app_settings_audit')
      .select(`
        audit_id,
        key,
        old_value,
        new_value,
        changed_by,
        changed_by_email,
        changed_at
      `)
      .order('changed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[GET /api/admin/settings/audit] Error:', error);
      
      // If table doesn't exist, return empty array
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          logs: [],
          count: 0,
          message: 'Audit table not found. Please run database migrations.'
        });
      }
      
      throw error;
    }

    // Data is already in the correct format from the database
    const flatData = auditData?.map((log: AuditLogRecord) => ({
      audit_id: log.audit_id,
      key: log.key,
      old_value: log.old_value,
      new_value: log.new_value,
      changed_by: log.changed_by,
      changed_by_email: log.changed_by_email || 'Unknown',
      changed_at: log.changed_at
    })) || [];

    return NextResponse.json({
      success: true,
      logs: flatData,
      count: flatData.length
    });
  } catch (error) {
    console.error('[GET /api/admin/settings/audit] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch audit logs' },
      { status: 500 }
    );
  }
}
