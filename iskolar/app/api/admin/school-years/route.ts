import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: schoolYears, error } = await supabaseAdmin
      .from('school_years')
      .select(`
        *,
        semesters (*)
      `)
      .order('academic_year', { ascending: false });

    if (error) {
      console.error('Error fetching school years:', error);
      return NextResponse.json(
        { error: 'Failed to fetch school years' },
        { status: 500 }
      );
    }

    // Get current academic year
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    // Academic year typically starts in August/September
    const academicYear = currentDate.getMonth() >= 7 
      ? currentYear 
      : currentYear - 1;

    // Mark current year in the response
    const schoolYearsWithCurrent = schoolYears?.map(year => ({
      ...(year as any),
      isCurrent: (year as any).academic_year === academicYear
    })) || [];

    return NextResponse.json(schoolYearsWithCurrent);
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
    const body = await request.json();
    const { year } = body;
    
    // Get admin token from Authorization header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing or invalid authentication token' },
        { status: 401 }
      );
    }

    let tokenData;
    try {
      tokenData = JSON.parse(atob(token));
      
      // Check if token is expired
      if (tokenData.exp < Math.floor(Date.now() / 1000)) {
        return NextResponse.json(
          { error: 'Token expired' },
          { status: 401 }
        );
      }

      // Verify the admin exists and is a super_admin
      const { data: admin, error: adminError } = await supabaseAdmin
        .from('admin')
        .select('role')
        .eq('id', tokenData.id)
        .single();

      if (adminError || !admin || admin.role !== 'super_admin') {
        return NextResponse.json(
          { error: 'Unauthorized. Super admin access required.' },
          { status: 403 }
        );
      }
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 401 }
      );
    }

    // Role check already done above with token data

    const { data: existingYear, error: checkError } = await supabaseAdmin
      .from('school_years')
      .select()
      .eq('academic_year', year)
      .single();

    if (existingYear) {
      return NextResponse.json(
        { error: 'School year already exists' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('school_years')
      .insert([{ academic_year: year }])
      .select()
      .single();

    if (error) {
      console.error('Error creating school year:', error);
      return NextResponse.json(
        { error: 'Failed to create school year' },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in school years POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}