import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    // Use service role client to bypass RLS for admin operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    const { userId } = await context.params;

    console.log('Fetching history for user:', userId);

    // First, get the user's barangay
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('barangay')
      .eq('user_id', userId)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      throw userError;
    }

    const userBarangay = userData?.barangay;
    console.log('User barangay:', userBarangay);

    // Fetch all applications for this user with semester and school year details
    const { data: applications, error: appsError } = await supabase
      .from('application_details')
      .select(`
        appdet_id,
        status,
        created_at,
        updated_at,
        year_level,
        college_year_started,
        college_year_grad,
        semester_id,
        semesters (
          id,
          name,
          start_date,
          end_date,
          school_year_id,
          school_years (
            id,
            academic_year
          )
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    console.log('Applications query result:', { 
      count: applications?.length,
      applications: applications,
      error: appsError 
    });
    
    if (appsError) {
      console.error('Error fetching applications:', appsError);
      throw appsError;
    }

    // Fetch all releases that this user received (approved applications)
    // Get semester IDs from approved applications
    const approvedSemesterIds = (applications || [])
      .filter(app => app.status === 'approved')
      .map(app => app.semester_id);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let releases: any[] = [];
    if (approvedSemesterIds.length > 0 && userBarangay) {
      console.log('Fetching releases for semester IDs:', approvedSemesterIds, 'and barangay:', userBarangay);
      
      const { data: releasesData, error: releasesError } = await supabase
        .from('releases')
        .select(`
          releaseid,
          releasetype,
          releasedate,
          releasetime,
          amountperstudent,
          numberofrecipients,
          location,
          barangay,
          semester_id
        `)
        .in('semester_id', approvedSemesterIds)
        .ilike('barangay', userBarangay)
        .order('releasedate', { ascending: false });

      console.log('Releases query result:', { 
        count: releasesData?.length,
        releasesData: releasesData,
        error: releasesError,
        filteredByBarangay: userBarangay,
        approvedSemesterIds: approvedSemesterIds
      });

      if (releasesError) {
        console.error('Error fetching releases:', releasesError);
      } else {
        releases = releasesData || [];
      }
    } else {
      console.log('Skipping releases fetch:', {
        hasApprovedSemesters: approvedSemesterIds.length > 0,
        hasBarangay: !!userBarangay,
        approvedSemesterIds: approvedSemesterIds
      });
    }

    console.log('Final response data:', {
      applicationsCount: applications?.length,
      releasesCount: releases.length,
      sampleApplication: applications?.[0],
      sampleRelease: releases[0]
    });

    return NextResponse.json({
      applications: applications || [],
      releases: releases || []
    });

  } catch (error) {
    console.error('Error in user history API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user history' },
      { status: 500 }
    );
  }
}
