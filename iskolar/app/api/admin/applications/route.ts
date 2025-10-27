import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const semesterId = searchParams.get('semesterId');

    console.log('🔍 API: Received semesterId:', semesterId);
    console.log('🔍 API: semesterId type:', typeof semesterId);

    if (!semesterId) {
      console.error('❌ API: No semester ID provided');
      return NextResponse.json(
        { error: 'Semester ID is required' },
        { status: 400 }
      );
    }

    console.log('📡 API: Querying application_details table...');
    // Fetch application details
    const { data: applications, error: appError } = await supabaseAdmin
      .from('application_details')
      .select('appdet_id, status, created_at, semester_id, user_id')
      .eq('semester_id', semesterId)
      .order('created_at', { ascending: false });

    console.log('📊 API: Query completed');
    console.log('📦 API: Found', applications?.length || 0, 'applications');
    console.log('❓ API: Query error?', appError);

    if (appError) {
      console.error('❌ API: Error fetching applications:', appError);
      return NextResponse.json(
        { error: 'Failed to fetch applications', details: appError.message },
        { status: 500 }
      );
    }

    if (!applications || applications.length === 0) {
      console.log('⚠️ API: No applications found');
      return NextResponse.json([]);
    }

    // Get unique user IDs
    const userIds = [...new Set(applications.map(app => app.user_id))];
    console.log('👥 API: Fetching data for', userIds.length, 'unique users');

    // Fetch user data separately
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('user_id, first_name, last_name, email_address, barangay, college_university')
      .in('user_id', userIds);

    console.log('👥 API: Found', users?.length || 0, 'user records');
    if (usersError) {
      console.error('❌ API: Error fetching users:', usersError);
    }

    // Create a map of user data for quick lookup
    const userMap = new Map(users?.map(user => [user.user_id, user]) || []);

    // Map and join the data
    const mappedApplications = applications.map(app => {
      const userData = userMap.get(app.user_id);
      
      console.log('👤 API: Mapping application:', {
        appdet_id: app.appdet_id,
        user_id: app.user_id,
        hasUserData: !!userData,
        userName: userData ? `${userData.first_name} ${userData.last_name}` : 'N/A'
      });
      
      return {
        application_id: app.appdet_id,
        semester_id: app.semester_id,
        user_id: app.user_id,
        status: app.status,
        submitted_at: app.created_at,
        first_name: userData?.first_name || 'N/A',
        last_name: userData?.last_name || '',
        barangay: userData?.barangay || 'N/A',
        school: userData?.college_university || 'N/A',
        email_address: userData?.email_address || 'N/A'
      };
    });

    console.log('✅ API: Mapped applications:', JSON.stringify(mappedApplications, null, 2));

    return NextResponse.json(mappedApplications);
  } catch (error) {
    console.error('Error in applications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
