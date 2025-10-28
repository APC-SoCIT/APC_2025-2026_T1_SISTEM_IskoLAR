import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hasPermission } from '@/lib/auth/roles';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type SchoolYearRow = {
  id: string;
  academic_year?: number | null;
  is_active?: boolean | null;
  semesters?: unknown[] | null;
  [key: string]: unknown;
};

type LatestRow = { academic_year?: number | null } | null;

type SupabaseUser = { email?: string };

export async function GET() {
  try {
    // Only fetch the last 5 academic years to improve performance
    // Most admins only need to see recent years
    const { data: schoolYears, error } = await supabaseAdmin
      .from('school_years')
      .select(`
        *,
        semesters (*)
      `)
      .order('academic_year', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error fetching school years:', error);
      return NextResponse.json(
        { error: 'Failed to fetch school years' },
        { status: 500 }
      );
    }

    // Get undo status for each year and determine current status
    // Run these in parallel for better performance
    const undoChecks = await Promise.all(
      schoolYears?.map(async (year: SchoolYearRow) => {
        const { data: canUndo, error: undoError } = await supabaseAdmin.rpc(
          'can_undo_school_year',
          { p_school_year_id: year.id }
        );

        if (undoError) {
          console.error('Error checking undo status:', undoError);
          return false;
        }

        return Boolean(canUndo);
      }) || []
    );

    // Combine the results
    const schoolYearsWithCurrentAndUndo = schoolYears?.map((year: SchoolYearRow, index: number) => ({
      ...year,
      isCurrent: year.is_active === true,  // Use is_active from database
      canUndo: undoChecks[index]
    })) || [];

    return NextResponse.json(schoolYearsWithCurrentAndUndo);
  } catch (error) {
    console.error('Error in school years GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    console.log('Starting POST request to create school year');
    
    // Expect adminEmail and adminPassword in the body
    const body = await request.json().catch(e => {
      console.error('Error parsing request body:', e);
      return {};
    });
    
    const { adminEmail, adminPassword } = body;
    
    if (!adminEmail || !adminPassword) {
      console.error('Missing required fields:', { hasEmail: !!adminEmail, hasPassword: !!adminPassword });
      return NextResponse.json(
        { error: 'adminEmail and adminPassword are required', debug: { body } },
        { status: 400 }
      );
    }
    
    console.log('Processing request for admin:', adminEmail);

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: 'adminEmail and adminPassword are required' },
        { status: 400 }
      );
    }

    // Verify the user exists in auth metadata
    const { data: { users }, error: adminUserError } = await supabaseAdmin.auth.admin.listUsers();
    if (adminUserError) {
      console.error('Error listing users for verification:', adminUserError);
      return NextResponse.json({ error: 'Failed to verify user' }, { status: 500 });
    }

    const adminUser = users?.find((u: SupabaseUser) => u.email === adminEmail);
    if (!adminUser) {
      return NextResponse.json({ error: 'Admin user not found' }, { status: 404 });
    }

    // Check if user has admin permissions using role guard
    const hasAdminPermission = await hasPermission(adminEmail, 'admin');
    if (!hasAdminPermission) {
      return NextResponse.json({ 
        error: 'Only administrators can create academic years' 
      }, { status: 403 });
    }

    // Create a client for the specific admin user to verify their password
    console.log('Creating user client for password verification...');
    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    console.log('Attempting password verification...');
    const { error: authError } = await userClient.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });

    if (authError) {
      console.error('Password verification failed:', authError);
      return NextResponse.json({ 
        error: 'Invalid password',
        details: authError.message
      }, { status: 403 });
    }
    
    console.log('Password verification successful');

    // Compute the next academic year. If none exists, start at 2025.
    const { data: latestRow, error: latestError } = await supabaseAdmin
      .from('school_years')
      .select('academic_year')
      .order('academic_year', { ascending: false })
      .limit(1)
      .single();

    if (latestError && latestError.code !== 'PGRST116') {
      // PGRST116 can indicate no rows found in some contexts; still handle gracefully
      console.error('Error fetching latest academic year:', latestError);
      return NextResponse.json({ error: 'Failed to determine next academic year' }, { status: 500 });
    }

    const DEFAULT_START_YEAR = 2025;
    const latest = latestRow as LatestRow;
    const nextYear = latest && typeof latest.academic_year === 'number'
      ? latest.academic_year + 1
      : DEFAULT_START_YEAR;

    console.log('Calling stored procedure to create school year...');
    // Call the stored procedure to create the school year and audit record
    const { data: yearData, error } = await supabaseAdmin.rpc(
      'admin_create_school_year',
      { p_academic_year: nextYear, p_admin_email: adminEmail }
    );

    if (error) {
      console.error('Error creating school year:', error);
      return NextResponse.json({ 
        error: error.message || 'Failed to create school year',
        details: error
      }, { status: 500 });
    }
    
    if (!yearData) {
      console.error('No year ID returned from create procedure');
      return NextResponse.json({ error: 'Failed to create school year - no ID returned' }, { status: 500 });
    }
    
    console.log('School year created with ID:', yearData);

    // Fetch the created school year with complete data
    const { data: createdYear, error: fetchError } = await supabaseAdmin
      .from('school_years')
      .select('*')
      .eq('id', yearData)
      .single();

    if (fetchError) {
      console.error('Error fetching created school year:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch created school year' }, { status: 500 });
    }

    return NextResponse.json(createdYear);
  } catch (error) {
    console.error('Error in school years POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}