
import { NextResponse, NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isSuperAdmin } from '@/lib/auth/roles';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Type definitions for database records
interface AdminRecord {
  admin_id: string;
  email_address: string;
  role_id: string;
  role: { role_name: string } | { role_name: string }[];
  created_at: string;
}

interface ApplicationRecord {
  application_id: string;
  user_id: string;
  users: { email_address: string; first_name: string; last_name: string } | { email_address: string; first_name: string; last_name: string }[];
  school_year_id: string;
  school_year: { academic_year: string } | { academic_year: string }[];
  semester_id: string;
  semester: { name: string } | { name: string }[];
  status: string;
  rejection_reason: string | null;
  created_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
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

// Helper to convert array of objects to CSV
function arrayToCSV(data: Record<string, unknown>[], headers: string[]): string {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape commas and quotes in CSV values
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });
  
  return [csvHeaders, ...csvRows].join('\n');
}

// GET /api/admin/settings/export?type=users|admins|applications
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
        { error: 'Only super administrators can export data' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const exportType = searchParams.get('type');

    if (!exportType || !['users', 'admins', 'applications'].includes(exportType)) {
      return NextResponse.json(
        { error: 'Invalid export type. Must be one of: users, admins, applications' },
        { status: 400 }
      );
    }

    let csvData = '';
    let filename = '';

    if (exportType === 'users') {
      // Export all users
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('user_id, email_address, first_name, middle_name, last_name, created_at, last_sign_in_at')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const headers = ['user_id', 'email_address', 'first_name', 'middle_name', 'last_name', 'created_at', 'last_sign_in_at'];
      csvData = arrayToCSV(data || [], headers);
      filename = `iskolar_users_${new Date().toISOString().split('T')[0]}.csv`;
    } 
    else if (exportType === 'admins') {
      // Export all admins with role names
      const { data, error } = await supabaseAdmin
        .from('admin')
        .select(`
          admin_id,
          email_address,
          role_id,
          role:role_id (role_name),
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Flatten role data
      const flatData = data?.map((admin: AdminRecord) => ({
        admin_id: admin.admin_id,
        email_address: admin.email_address,
        role_id: admin.role_id,
        role_name: Array.isArray(admin.role) ? admin.role[0]?.role_name : admin.role?.role_name || '',
        created_at: admin.created_at
      })) || [];

      const headers = ['admin_id', 'email_address', 'role_id', 'role_name', 'created_at'];
      csvData = arrayToCSV(flatData, headers);
      filename = `iskolar_admins_${new Date().toISOString().split('T')[0]}.csv`;
    } 
    else if (exportType === 'applications') {
      // Export all applications with user info and status
      const { data, error } = await supabaseAdmin
        .from('application_details')
        .select(`
          application_id,
          user_id,
          users:user_id (email_address, first_name, last_name),
          school_year_id,
          school_year:school_year_id (academic_year),
          semester_id,
          semester:semester_id (name),
          status,
          rejection_reason,
          created_at,
          submitted_at,
          reviewed_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Flatten nested data
      const flatData = data?.map((app: ApplicationRecord) => ({
        application_id: app.application_id,
        user_id: app.user_id,
        email_address: Array.isArray(app.users) ? app.users[0]?.email_address : app.users?.email_address || '',
        first_name: Array.isArray(app.users) ? app.users[0]?.first_name : app.users?.first_name || '',
        last_name: Array.isArray(app.users) ? app.users[0]?.last_name : app.users?.last_name || '',
        school_year: Array.isArray(app.school_year) ? app.school_year[0]?.academic_year : app.school_year?.academic_year || '',
        semester: Array.isArray(app.semester) ? app.semester[0]?.name : app.semester?.name || '',
        status: app.status,
        rejection_reason: app.rejection_reason || '',
        created_at: app.created_at,
        submitted_at: app.submitted_at || '',
        reviewed_at: app.reviewed_at || ''
      })) || [];

      const headers = [
        'application_id',
        'user_id',
        'email_address',
        'first_name',
        'last_name',
        'school_year',
        'semester',
        'status',
        'rejection_reason',
        'created_at',
        'submitted_at',
        'reviewed_at'
      ];
      csvData = arrayToCSV(flatData, headers);
      filename = `iskolar_applications_${new Date().toISOString().split('T')[0]}.csv`;
    }

    // Return CSV as downloadable file
    return new NextResponse(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[GET /api/admin/settings/export] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to export data' },
      { status: 500 }
    );
  }
}
