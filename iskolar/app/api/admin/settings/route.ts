
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

// Default settings structure
const defaultSettings = {
  general: {
    siteName: 'IskoLAR Scholarship System',
    defaultTimezone: 'Asia/Manila',
    dateFormat: 'MM/DD/YYYY'
  },
  email: {
    fromAddress: 'iskolar.learnersaidresource@gmail.com'
  },
  authPolicy: {
    minLength: 8,
    requireUpper: true,
    requireLower: true,
    requireNumber: true,
    requireSymbol: true,
    allowAdminSignups: false
  },
  features: {
    openApplications: true,
    allowApplicationDeletion: false,
    enableAIVerification: true
  },
  maintenance: {
    maintenanceMode: false,
    maintenanceMessage: 'System is under maintenance. Please check back later.'
  }
};

// GET /api/admin/settings - Get all settings
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
        { error: 'Only super administrators can access settings' },
        { status: 403 }
      );
    }

    // Fetch all settings
    const { data: settingsData, error } = await supabaseAdmin
      .from('app_settings')
      .select('key, value');

    if (error) {
      console.error('[GET /api/admin/settings] Error:', error);
      
      // If table doesn't exist, return defaults only
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        console.warn('[GET /api/admin/settings] app_settings table not found, using defaults');
        // Continue with default settings below
      } else {
        throw error;
      }
    }

    // Merge with defaults
    const settings: Record<string, any> = { ...defaultSettings };
    
    if (settingsData) {
      settingsData.forEach(({ key, value }) => {
        settings[key] = value;
      });
    }

    // Get current school year and semester (read-only)
    const { data: currentSchoolYear, error: schoolYearError } = await supabaseAdmin
      .from('school_years')
      .select('id, academic_year, is_active')
      .eq('is_active', true)
      .single();

    if (schoolYearError) {
      console.warn('[GET /api/admin/settings] School year query error:', schoolYearError);
    }

    const { data: currentSemester, error: semesterError } = await supabaseAdmin
      .from('semesters')
      .select('id, name, school_year_id, applications_open')
      .eq('applications_open', true)
      .single();

    if (semesterError) {
      console.warn('[GET /api/admin/settings] Semester query error:', semesterError);
    }

    console.log('[GET /api/admin/settings] Current school year:', currentSchoolYear);
    console.log('[GET /api/admin/settings] Current semester:', currentSemester);

    return NextResponse.json({
      settings,
      currentSchoolYear: currentSchoolYear || null,
      currentSemester: currentSemester || null
    });
  } catch (error) {
    console.error('[GET /api/admin/settings] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is super_admin
    const isSuperAdminUser = await isSuperAdmin(user.email);
    if (!isSuperAdminUser) {
      return NextResponse.json(
        { error: 'Only super administrators can update settings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { changes } = body;

    if (!changes || typeof changes !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body. Expected { changes: { key: value } }' },
        { status: 400 }
      );
    }

    // Update each setting key
    const results = [];
    for (const [key, value] of Object.entries(changes)) {
      const { error } = await supabaseAdmin
        .from('app_settings')
        .upsert({
          key,
          value: value as any,
          updated_by: user.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'key'
        });

      if (error) {
        console.error(`[PUT /api/admin/settings] Error updating ${key}:`, error);
        results.push({ key, success: false, error: error.message });
      } else {
        results.push({ key, success: true });
      }
    }

    const allSuccess = results.every(r => r.success);

    return NextResponse.json({
      success: allSuccess,
      results
    }, { status: allSuccess ? 200 : 207 }); // 207 = Multi-Status
  } catch (error) {
    console.error('[PUT /api/admin/settings] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update settings' },
      { status: 500 }
    );
  }
}
